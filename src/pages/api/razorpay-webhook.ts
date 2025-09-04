import type { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro'; // For raw body
import crypto from 'crypto';

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
        // Get raw body
        const rawBody = (await buffer(req)).toString('utf8');
        const sig = req.headers['x-razorpay-signature'] as string;

        // console.log('Razorpay Webhook Signature:', sig);
        // console.log('Razorpay Webhook received:', rawBody);

        // Verify webhook signature
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!);
        hmac.update(rawBody);
        const digest = hmac.digest('hex');

        if (sig === digest) {
            const event = JSON.parse(rawBody); // Parse the raw body now
            if (event.event === 'subscription.charged' || event.event === 'subscription.activated') {
                const subscription = event.payload.subscription.entity;
                console.log('Subscription Event:', JSON.stringify(subscription));
                // Update your database (e.g., PocketBase) here
                // Example: await updateUserSubscription(subscription.id, 'active');
            }
            return res.status(200).json({ status: 'ok' });
        } else {
            return res.status(400).json({ status: 'signature mismatch' });
        }
    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}