// src/pages/api/razorpay/verify-payment.ts
import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    console.log("🔹 Verifying payment:", {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      signature_received: !!razorpay_signature
    });

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing required payment verification data" 
      });
    }

    // Validate environment variable
    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error("❌ Razorpay key secret not configured");
      return res.status(500).json({ 
        success: false, 
        error: "Payment verification not configured" 
      });
    }

    // Create HMAC signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    // Compare signatures
    if (generatedSignature === razorpay_signature) {
      console.log("✅ Payment verified successfully:", {
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id
      });

      // Here you can:
      // 1. Update user subscription in database
      // 2. Send confirmation email
      // 3. Log the successful payment
      // 4. Update user permissions

      return res.status(200).json({ 
        success: true, 
        message: "Payment verified successfully",
        data: {
          order_id: razorpay_order_id,
          payment_id: razorpay_payment_id
        }
      });
    } else {
      console.log("❌ Invalid signature:", {
        generated: generatedSignature,
        received: razorpay_signature,
        order_id: razorpay_order_id
      });

      return res.status(400).json({ 
        success: false, 
        message: "Invalid payment signature" 
      });
    }
  } catch (err: any) {
    console.error("❌ Payment verification error:", err);
    return res.status(500).json({ 
      success: false,
      error: err.message || "Payment verification failed" 
    });
  }
}