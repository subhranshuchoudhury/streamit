import { Fragment, memo, useState } from "react"

// react-bootstrap
import { Col, Container, Row } from "react-bootstrap"

//custom hook
import { useBreadcrumb } from "@/utilities/usePage";

const PricingPage = memo(() => {
  useBreadcrumb('Pricing Plan')
  
  const [loading, setLoading] = useState<string | null>(null);
  
  // USD to INR conversion rate (you might want to fetch this from an API)
  const USD_TO_INR = 83; // Current approximate rate
  
  const plans = [
    {
      id: 'free',
      name: 'Free',
      priceUSD: 0,
      priceINR: 0,
      duration: 'Forever',
      features: [
        { text: 'Ads free movies and shows', included: true },
        { text: 'Watch on TV or Laptop', included: false },
        { text: 'Streamit Special', included: false },
        { text: 'Max video quality', included: false },
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      priceUSD: Math.round(499 / USD_TO_INR), // approx 6 USD
      priceINR: 499,
      originalPriceUSD: Math.round(599 / USD_TO_INR),
      originalPriceINR: 599,
      duration: '3 Month',
      discount: 'Save ₹100',
      features: [
        { text: 'Ads free movies and shows', included: true },
        { text: 'Watch on TV or Laptop', included: true },
        { text: 'Streamit Special', included: true },
        { text: 'Max video quality', included: true },
      ]
    },
    {
      id: 'basic',
      name: 'Basic',
      priceUSD: Math.round(199 / USD_TO_INR), // approx 2.5 USD
      priceINR: 199,
      duration: '1 Month',
      features: [
        { text: 'Ads free movies and shows', included: false },
        { text: 'Watch on TV or Laptop', included: true },
        { text: 'Streamit Special', included: true },
        { text: 'Max video quality', included: true },
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
    if (priceINR === 0) {
      alert("Free plan selected!");
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
        image: "/logo.png", // Add your logo path
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
              // Redirect to dashboard or success page
            } else {
              alert("❌ Payment verification failed!");
            }
          } catch (error) {
            console.error("Verification error:", error);
            alert("Payment verification failed!");
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: ""
        },
        theme: { 
          color: "#3399cc" 
        },
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
                  {plan.discount && (
                    <div className="pricing-plan-discount bg-primary p-2 text-center">
                      <span className="text-white">{plan.discount}</span>
                    </div>
                  )}
                  <div className="pricing-plan-header">
                    <h4 className="plan-name text-capitalize text-body mb-0">{plan.name}</h4>
                    {plan.originalPriceINR && (
                      <>
                        <span className="sale-price text-decoration-line-through">
                          ₹{Math.round(plan.originalPriceINR)}
                        </span>
                        <br />
                      </>
                    )}
                    {plan.priceINR > 0 ? (
                      <>
                        <span className="main-price text-primary">₹{Math.round(plan.priceINR)}</span>
                        <span className="font-size-18">/ {plan.duration}</span>
                      </>
                    ) : (
                      <span className="main-price text-primary">Free</span>
                    )}
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
