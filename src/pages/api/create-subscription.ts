import type { NextApiRequest, NextApiResponse } from 'next'
import Razorpay from 'razorpay';

const rzp = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    const method = req.method;
    if (method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { amount, customer_id, plan_type } = req.body;

    console.log('Creating subscription for amount:', amount, 'customer:', customer_id, 'plan type:', plan_type);

    if (!amount || !customer_id || !plan_type) {
        return res.status(400).json({ error: 'Missing amount, customer_id, or plan_type' });
    }

    try {
        // Create a plan dynamically based on the amount
        const plan = await rzp.plans.create({
            period: 'monthly',
            interval: 1,
            item: {
                name: `${plan_type} Plan`,
                amount: Number(amount) * 100, // Convert to paise
                currency: 'INR',
                description: `${plan_type} subscription plan`
            }
        });

        // Create subscription using the newly created plan
        const subscription = await rzp.subscriptions.create({
            plan_id: plan.id,
            customer_notify: 1,
            total_count: 12, // 12 months
            notes: {
                customer_id: String(customer_id).trim(),
                plan_type: String(plan_type).trim(),
            },
        });

        return res.status(200).json(subscription);
    } catch (error: any) {
        console.error('Subscription creation error:', error);
        return res.status(500).json({ error: 'Failed to create subscription', details: error.message });
    }




    res.status(200).json({ message: 'Hello from Next.js!', plan_id, customer_id })
}