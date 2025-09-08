import type { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro'; // For raw body
import crypto from 'crypto';
import pb from '@/lib/pocketbase';

// Disable Next.js body parsing to access raw body
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get raw body and signature from header
        const rawBody = (await buffer(req)).toString('utf8');
        const sig = req.headers['x-razorpay-signature'] as string;

        // Verify the webhook signature
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!);
        hmac.update(rawBody);
        const digest = hmac.digest('hex');

        // Compare signatures
        if (sig !== digest) {
            console.error('Webhook signature mismatch');
            return res.status(400).json({ status: 'signature mismatch' });
        }

        // Signature is verified, parse the event
        const event = JSON.parse(rawBody);

        // Authenticate with PocketBase as admin
        pb.authStore.save(process.env.DB_SUPER_USER_TOKEN!);

        // --- Handle Subscription Events ---
        if (event.event === 'subscription.charged' || event.event === 'subscription.activated') {
            const subscription = event.payload.subscription.entity;
            const customerId = subscription.notes.customer_id;

            console.log(`Processing subscription event for user: ${customerId}`);

            // Refactored to a single update call for efficiency
            await pb.collection("users").update(customerId, {
                plan_expiry: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
                subscription_id: subscription.id,
                subscription_status: 'active',
                plan_name: subscription.notes.plan_name,
            });

            console.log(`Successfully updated subscription for user: ${customerId}`);
        }
        // --- Handle One-Time Payment Event (NEW) ---
        else if (event.event === 'payment.captured') {
            const payment = event.payload.payment.entity;
            const customerId = payment.notes?.customer_id;

            // Ensure we have the necessary info in notes
            console.log(`Processing payment.captured event for user: ${customerId}`);

            await pb.collection("users").update(customerId, {
                plan_expiry: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
                plan_name: payment.notes.plan_name,
            });


        }

        // Clean up admin authentication
        pb.authStore.clear();

        return res.status(200).json({ status: 'ok' });

    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}