// src/pages/api/razorpay/create-order.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { amount } = req.body;
    console.log("🔹 Creating Razorpay order for amount (paise):", amount);

    // Validate amount
    if (!amount || amount < 1) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // Validate environment variables
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("❌ Razorpay credentials not configured");
      return res.status(500).json({ error: "Payment system not configured" });
    }

    const options = {
      amount: Math.round(amount), // Amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      notes: {
        created_at: new Date().toISOString(),
      },
    };

    const order = await razorpay.orders.create(options);
    console.log("✅ Order created successfully:", {
      id: order.id,
      amount: order.amount,
      currency: order.currency
    });

    return res.status(200).json({ 
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      }
    });
  } catch (error: any) {
    console.error("❌ API Error creating order:", error);
    
    // Handle specific Razorpay errors
    if (error.statusCode) {
      return res.status(error.statusCode).json({ 
        error: error.error?.description || "Payment service error" 
      });
    }
    
    return res.status(500).json({ 
      error: error.message || "Failed to create order" 
    });
  }
}