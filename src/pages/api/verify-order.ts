// Example path: /pages/api/payments/verify-order.ts
import pb from '@/lib/pocketbase';
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto'; // Node.js crypto module for signature verification

import Razorpay from 'razorpay';

const rzp = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId) {
        return res.status(400).json({ error: 'Missing required payment verification fields' });
    }

    try {
        // This is the crucial step for verifying one-time payments
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest('hex');

        // Compare the signature generated on your server with the one from the client
        if (expectedSignature !== razorpay_signature) {
            // If they don't match, the payment is fraudulent or has been tampered with.
            return res.status(400).json({ success: false, error: 'Invalid signature' });
        }

        // --- Signature is valid, payment is authentic ---
        // Now you can safely update your database.

        pb.authStore.save(process.env.DB_SUPER_USER_TOKEN!);

        try {
            // Use getFirstListItem which is perfect for this. It throws an error if not found.
            // ✅ We are using the unique `razorpay_payment_id` for the check.
            await pb.collection('payments').getFirstListItem(`payment_id="${razorpay_payment_id}"`);

            // If the line above SUCCEEDS, it means the record exists. This is a replay.
            return res.status(200).json({ success: true, message: 'Payment already verified.' });

        } catch (error: any) {
            // A 404 error is the "good path" here, it means this is a new payment ID.
            // If the error is not 404, then something else went wrong with the database.
            if (error.status !== 404) {
                // For any other error (e.g., 500), we should stop and report it.
                throw error;
            }
        }

        const payment = await rzp.payments.fetch(razorpay_payment_id);

        // Create a new payment record
        const paymentData = {
            user: userId,
            user_id: userId,
            payment_id: razorpay_payment_id,
            order_id: razorpay_order_id,
            status: 'verified',
            gateway: 'razorpay',
            payment: payment,
            amount: Number(payment.amount) / 100, // Convert from paise to rupees
        };

        await pb.collection('payments').create(paymentData);
        await pb.collection("users").update(userId, {
            plan_expiry: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
        });

        // await pb.collection("payments").update()

        pb.authStore.clear();

        // Or, update the user record directly to grant access to a product/service
        // await pb.collection("users").update(userId, {
        //     has_purchased_product: true,
        // });


        return res.status(200).json({ success: true, paymentId: razorpay_payment_id });

    } catch (error: any) {
        console.error('Verification error:', error);
        return res.status(500).json({ success: false, error: 'Verification failed', details: error.message });
    }
}