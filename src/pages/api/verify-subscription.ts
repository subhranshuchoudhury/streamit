import pb from '@/lib/pocketbase';
import type { NextApiRequest, NextApiResponse } from 'next';
import Razorpay from 'razorpay';

const rzp = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { paymentId, subscriptionId, userId } = req.body;

    try {
        // Verify payment status
        const payment = await rzp.payments.fetch(paymentId);
        if (payment.status === 'captured') {
            // Verify subscription status
            // const subscription = await rzp.subscriptions.fetch(subscriptionId);
            // if (subscription.status === 'active') {
            // }
            // Update DB
            pb.authStore.save(process.env.DB_SUPER_USER_TOKEN!);

            try {
                // Use getFirstListItem which is perfect for this. It throws an error if not found.
                // ✅ We are using the unique `razorpay_payment_id` for the check.
                await pb.collection('payments').getFirstListItem(`payment_id="${paymentId}"`);

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

            // Create a new payment record
            const paymentData = {
                user: userId,
                user_id: userId,
                payment_id: paymentId,
                order_id: payment.order_id,
                status: 'verified',
                gateway: 'razorpay',
                payment: payment,
                amount: Number(payment.amount) / 100, // Convert from paise to rupees
            };

            await pb.collection('payments').create(paymentData);

            await pb.collection("users").update(userId, {
                plan_expiry: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
            });

            pb.authStore.clear();

            return res.json({ success: true });
        }
        return res.json({ success: false, error: 'Payment or subscription not confirmed yet' });
    } catch (error) {
        console.error('Verification error:', error);
        return res.status(500).json({ success: false, error: 'Verification failed' });
    }
}