import pb from '@/lib/pocketbase';
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

    const { customer_id, plan_id, plan_name } = req.body;


    if (!customer_id || !plan_id) {
        return res.status(400).json({ error: 'Missing  customer_id or plan_id' });
    }

    try {

        pb.authStore.save(process.env.DB_SUPER_USER_TOKEN!);

        const customer = await pb.collection("users").getOne(customer_id);

        if (customer?.plan_expiry && new Date(customer.plan_expiry) > new Date()) {
            return res.status(400).json({ error: 'User already has an active subscription' });
        }

        pb.authStore.clear();


        // Create subscription using the newly created plan
        const subscription = await rzp.subscriptions.create({
            plan_id: plan_id,
            customer_notify: 1,
            total_count: 12, // 12 months
            notes: {
                customer_id: String(customer_id).trim(),
                plan_name: String(plan_name).trim(),
            },
        });

        return res.status(200).json(subscription);
    } catch (error: any) {
        console.error('Subscription creation error:', error);
        return res.status(500).json({ error: 'Failed to create subscription', details: error.message });
    }

}