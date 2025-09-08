// pages/api/payments/create-order.ts

import pb from '@/lib/pocketbase';
import type { NextApiRequest, NextApiResponse } from 'next';
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

    const { customer_id, plan_id } = req.body;

    if (!customer_id || !plan_id) {
        return res.status(400).json({ error: 'Missing customer_id or plan_id' });
    }

    pb.authStore.save(process.env.DB_SUPER_USER_TOKEN!);

    const customer = await pb.collection("users").getOne(customer_id);

    if (customer?.plan_expiry && new Date(customer.plan_expiry) > new Date()) {
        return res.status(400).json({ error: 'You already have an active subscription' });
    }

    const getPlan = await pb.collection('plans').getOne(plan_id);

    // console.log('Retrieved Plan:', getPlan);

    if (!getPlan) {
        return res.status(400).json({ error: 'Invalid plan_id' });
    }

    const amount = getPlan.actual_price || getPlan.price;

    // Razorpay expects the amount in the smallest currency unit (e.g., paise for INR)
    // So, we multiply the amount in rupees by 100.
    const options = {
        amount: Number(amount) * 100,
        currency: 'INR',
        receipt: `receipt_order_${new Date().getTime()}`,
        notes: {
            customer_id: String(customer_id).trim(),
            payment_for: 'One-Time Purchase',
            plan_name: String(getPlan.name).trim(),
            plan_id: String(plan_id).trim(),
        },
    };

    try {
        const order = await rzp.orders.create(options);
        // await pb.collection("payments").create({
        //     user: customer_id,
        //     order_id: order.id,
        //     amount: amount,
        //     status: 'created',
        //     gateway: 'razorpay',
        //     notes: options.notes,
        //     user_id: customer_id,
        // });
        pb.authStore.clear();

        return res.status(200).json(order);
    } catch (error: any) {
        console.error('Order creation error:', error);
        return res.status(500).json({ error: 'Failed to create order', details: error.message });
    }
}