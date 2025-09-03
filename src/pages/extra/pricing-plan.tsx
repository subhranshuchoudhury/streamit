import { Fragment, memo, useState } from "react"

// react-bootstrap
import { Col, Container, Row } from "react-bootstrap"

//custom hook
import { useBreadcrumb } from "@/utilities/usePage";

// PocketBase client
import PocketBase from "pocketbase";

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090");

const PricingPage = memo(() => {
  useBreadcrumb('Pricing Plan')
  
  const [loading, setLoading] = useState<string | null>(null);
  
  const USD_TO_INR = 83; // approximate conversion

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      priceUSD: Math.round(99 / USD_TO_INR),
      priceINR: 99,
      duration: '1 Month',
      features: [
        { text: 'Ads free movies and shows', included: false },
        { text: 'Watch on TV or Laptop', included: true },
        { text: 'Streamit Special', included: true },
        { text: 'Max video quality', included: true },
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      priceUSD: Math.round(199 / USD_TO_INR),
      priceINR: 199,
      duration: '1 Month',
      features: [
        { text: 'Ads free movies and shows', included: true },
        { text: 'Watch on TV or Laptop', included: true },
        { text: 'Streamit Special', included: true },
        { text: 'Max video quality', included: true },
      ]
    },
    {
      id: 'ultra',
      name: 'Ultra Premium',
      priceUSD: Math.round(399 / USD_TO_INR),
      priceINR: 399,
      duration: '1 Month',
      features: [
        { text: 'Ads free movies and shows', included: true },
        { text: 'Watch on TV or Laptop', included: true },
        { text: 'Streamit Special', included: true },
        { text: 'Max video quality (4K + HDR)', included: true },
      ]
    }
  ];

  async function loadScript(): Promise<boolean> {
    if (document.getElementById("razorpay-script")) return true;
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.id = "razorpay-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function handlePay(planId: string, priceINR: number, planName: string) {
    // 🔹 Step 1: Check PocketBase Auth
    if (!pb.authStore.isValid || !pb.authStore.model) {
      window.location.href = "/auth/login"; // redirect if not logged in
      return;
    }

    setLoading(planId);
    try {
      const amountInPaise = priceINR * 100;
      
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountInPaise }),
      });

      if (!res.ok) {
        throw new Error("Failed to create order");
      }

      const { order } = await res.json();

      const loaded = await loadScript();
      if (!loaded) throw new Error("Failed to load Razorpay SDK");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: "StreamIT",
        description: `${planName} Plan Subscription`,
        image: "/logo.png",
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const data = await verifyRes.json();
            if (data.success) {
              alert("✅ Payment verified! Welcome to " + planName + " plan!");
            } else {
              alert("❌ Payment verification failed!");
            }
          } catch (error) {
            console.error("Verification error:", error);
            alert("Payment verification failed!");
          }
        },
        prefill: {
          name: pb.authStore.model?.name || "",
          email: pb.authStore.model?.email || "",
          contact: ""
        },
        theme: { color: "#3399cc" },
        modal: {
          ondismiss: function() {
            setLoading(null);
          }
        }
      };

      new (window as any).Razorpay(options).open();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Payment error");
      setLoading(null);
    }
  }

  return (
    <Fragment>
      <div className="section-padding">
        <Container>
          <Row>
            {plans.map((plan) => (
              <Col key={plan.id} lg="4" md="6" className="mb-3 mb-lg-0">
                <div className="pricing-plan-wrapper">
                  <div className="pricing-plan-header">
                    <h4 className="plan-name text-capitalize text-body mb-0">{plan.name}</h4>
                    <span className="main-price text-primary">₹{Math.round(plan.priceINR)}</span>
                    <span className="font-size-18">/ {plan.duration}</span>
                  </div>
                  <div className="pricing-details">
                    <div className="pricing-plan-description">
                      <ul className="list-inline p-0">
                        {plan.features.map((feature, index) => (
                          <li key={index}>
                            <i className={`fas ${feature.included ? 'fa-check text-primary' : 'fa-times'}`}></i>
                            <span className="font-size-18 fw-500">{feature.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pricing-plan-footer">
                      <div className="iq-button">
                        <button 
                          onClick={() => handlePay(plan.id, plan.priceINR, plan.name)}
                          disabled={loading === plan.id}
                          className="btn text-uppercase position-relative w-100"
                          style={{ border: 'none', background: 'var(--bs-primary)', color: 'white' }}
                        >
                          <span className="button-text">
                            {loading === plan.id ? 'Processing...' : `Select ${plan.name}`}
                          </span>
                          <i className="fa-solid fa-play ms-2"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>
    </Fragment>
  )
})

PricingPage.displayName = "PricingPage"
export default PricingPage
