import { Fragment, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Col, Container, Row, Spinner } from "react-bootstrap"; // Import Spinner
import { useBreadcrumb } from "@/utilities/usePage";
import pb from "@/lib/pocketbase";
import Swal from "sweetalert2";

// Define an interface for the plan object for better type safety
interface Plan {
  id: string;
  name: string;
  price: number;
  actual_price: number; // Optional actual price for showing discounts
  features: { text: string; available: boolean }[];
  rzp_plan_id: string;
  is_subscription: boolean;
  detail: string;
  button_title: string;
}

interface User {
  id: string;
  plan_expiry?: string; // Optional plan expiry date
  plan_name?: string; // Added plan_name for the active card display
  [key: string]: any; // Other user fields
}

const PricingPage = () => {
  useBreadcrumb("Pricing");
  const router = useRouter();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [User, setUser] = useState<User | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  
  // New state to manage the initial page load
  const [pageLoading, setPageLoading] = useState(true);

  const loadPlans = async () => {
    try {
      // Fetch plans sorted by price in ascending order
      const fetchedPlans = await pb.collection("plans").getFullList<Plan>({ sort: "position" });
      console.log("Available Plans:", fetchedPlans);
      setPlans(fetchedPlans);
    } catch (error) {
      console.error("Failed to load plans:", error);
      // Optionally, set an error state to show a message to the user
    }
  };

  const loadUser = async () => {
    try {
      if (pb.authStore.isValid && pb.authStore.record) {
        const user = await pb.collection("users").getOne(pb.authStore.record?.id);
        setUser(user as User);
      }
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  }

  useEffect(() => {
    const fetchInitialData = async () => {
      setPageLoading(true); // Start loading
      try {
        // Fetch user and plans data in parallel for efficiency
        await Promise.all([loadUser(), loadPlans()]);
      } catch (error) {
        console.error("Error fetching initial page data:", error);
        // Handle error, maybe show a persistent error message
      } finally {
        setPageLoading(false); // Stop loading regardless of success or failure
      }
    };

    fetchInitialData();
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (plan_id: string) => {
    if (!pb.authStore.isValid || !pb.authStore.record) {
      router.push("/auth/login");
      return;
    }

    setLoadingStates(prev => ({ ...prev, [plan_id]: true }));

    try {
      const res = await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id,
          customer_id: pb.authStore.record?.id,
          plan_name: plans.find(p => p.rzp_plan_id === plan_id)?.name || 'Unknown Plan'
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create payment subscription");
      }

      const subscription = await res.json();
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        Swal.fire({
          icon: 'error',
          title: 'Payment Gateway Error',
          text: 'Please check your internet connection and try again.',
          confirmButtonText: 'OK'
        });
        setLoadingStates(prev => ({ ...prev, [plan_id]: false }));
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscription.id,
        name: "Chatpata Movies",
        handler: async (response: any) => {
          const { razorpay_payment_id, razorpay_subscription_id } = response;
          try {
            const verifyRes = await fetch('/api/verify-subscription', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId: razorpay_payment_id,
                subscriptionId: razorpay_subscription_id,
                userId: pb.authStore.record?.id
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setIsSubscribed(true);
              Swal.fire({
                icon: 'success',
                title: 'Subscription Successful',
                text: 'Your subscription is now active!',
                confirmButtonText: 'Great!'
              });
              loadUser(); // Refresh user data to get updated plan info
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Verification Failed',
                text: verifyData.message || 'Subscription verification failed. Please contact support.',
                confirmButtonText: 'OK'
              });
            }
          } catch (error) {
            console.error('Verification error:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'An error occurred during verification. Please contact support.',
              confirmButtonText: 'OK'
            });
            setIsSubscribed(true);
          }
        },
        prefill: {
          name: pb.authStore.record?.name,
          email: pb.authStore.record?.email,
        },
        theme: { color: "#F37254" },
      };

      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error("Subscription error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Subscription Error',
        text: error.message || 'Failed to initiate subscription. Please try again later.',
        confirmButtonText: 'OK'
      });
      setIsSubscribed(false);
    } finally {
      setLoadingStates(prev => ({ ...prev, [plan_id]: false }));
    }
  };


  const handleOrderPayment = async (rzp_plan_id: string) => {
    if (!pb.authStore.isValid || !pb.authStore.record) {
      router.push("/auth/login");
      return;
    }

    const selectedPlan = plans.find(p => p.rzp_plan_id === rzp_plan_id);
    if (!selectedPlan) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Selected plan could not be found.' });
      return;
    }

    setLoadingStates(prev => ({ ...prev, [rzp_plan_id]: true }));

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: selectedPlan.id,
          customer_id: pb.authStore.record?.id,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create payment order");
      }

      const order = await res.json();

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        Swal.fire({
          icon: 'error',
          title: 'Payment Gateway Error',
          text: 'Could not load payment script. Please check your internet connection.',
        });
        setLoadingStates(prev => ({ ...prev, [rzp_plan_id]: false }));
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Chatpata Movies",
        description: `Payment for ${selectedPlan.name}`,
        order_id: order.id,
        handler: async (response: any) => {
          const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;
          try {
            const verifyRes = await fetch('/api/verify-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id,
                razorpay_order_id,
                razorpay_signature,
                userId: pb.authStore.record?.id
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              Swal.fire({
                icon: 'success',
                title: 'Payment Successful!',
                text: `Your purchase of the ${selectedPlan.name} plan is complete.`,
              });
              loadUser();
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Verification Failed',
                text: verifyData.error || 'Payment verification failed. Please contact support.',
              });
            }
          } catch (error) {
            console.error('Verification API error:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'An error occurred during verification. Please contact support.',
            });
          }
        },
        prefill: {
          name: pb.authStore.record?.name,
          email: pb.authStore.record?.email,
        },
        theme: { color: "#F37254" },
      };

      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error: any) {
      console.error("Payment error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Payment Error',
        text: error.message || 'Failed to initiate payment. Please try again.',
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [rzp_plan_id]: false }));
    }
  };

  const getButtonClass = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes('premium')) {
      return 'premium-btn';
    }
    if (name.includes('basic')) {
      return 'basic-btn';
    }
    return 'free-btn';
  };

  return (
    <Fragment>

      <style jsx>{`
        /* --- ALL YOUR EXISTING STYLES --- */
        .pricing-card {
          border: 2px solid #333;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          color: #ffffff;
        }
        
        .pricing-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
          border-color: #e50914;
        }
        
        .premium-card {
          border: 3px solid #e50914;
          transform: scale(1.05);
          background: linear-gradient(135deg, #221111 0%, #1a1a1a 100%);
          position: relative;
          z-index: 1;
        }
        
        .premium-badge {
          background: linear-gradient(135deg, #e50914 0%, #b8070f 100%);
          color: white;
          padding: 10px 0;
          text-align: center;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          font-size: 14px;
          box-shadow: 0 2px 10px rgba(229, 9, 20, 0.3);
        }
        
        .plan-header {
          padding: 30px 20px 20px;
          text-align: center;
          background: transparent;
        }
        
        .plan-name {
          font-size: 28px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 15px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .price-container {
          margin-bottom: 20px;
        }
        
        .currency {
          font-size: 24px;
          font-weight: 600;
          color: #e50914;
          vertical-align: top;
        }
        
        .main-price {
          font-size: 48px;
          font-weight: 800;
          color: #e50914;
          line-height: 1;
        }
        
        .sale-price {
          font-size: 20px;
          color: #aaa;
          margin-right: 10px;
          text-decoration: line-through;
        }
        
        .period {
          font-size: 16px;
          color: #bbb;
          font-weight: 500;
        }
        
        .features-list {
          padding: 0 30px 30px;
        }
        
        .features-list ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .features-list li {
          padding: 12px 0;
          display: flex;
          align-items: center;
          border-bottom: 1px solid #333;
        }
        
        .features-list li:last-child {
          border-bottom: none;
        }
        
        .features-list i {
          width: 20px;
          height: 20px;
          margin-right: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 12px;
        }
        
        .check-icon {
          background: #27ae60;
          color: white;
        }
        
        .times-icon {
          background: #e74c3c;
          color: white;
        }
        
        .feature-text {
          font-size: 16px;
          font-weight: 500;
          color: #ffffff;
        }
        
        .subscribe-footer {
          padding: 0 30px 30px;
        }
        
        .subscribe-btn {
          width: 100%;
          padding: 15px 25px;
          background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%);
          color: white;
          border: 2px solid #444;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
          position: relative;
          overflow: hidden;
        }
        
        .subscribe-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transition: left 0.5s;
        }
        
        .subscribe-btn:hover::before {
          left: 100%;
        }
        
        .subscribe-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.6);
          border-color: #666;
          background: linear-gradient(135deg, #1a1a1a 0%, #000000 50%, #000000 100%);
        }
        
        .subscribe-btn:active {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
        }
        
        .subscribe-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        .free-btn {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #000000 100%);
          border: 2px solid #333;
        }
        
        .free-btn:hover {
          background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 50%, #000000 100%);
          border-color: #555;
        }
        
        .premium-btn {
          background: linear-gradient(135deg, #e50914 0%, #b8070f 100%);
          border: 2px solid #ff2a33;
          box-shadow: 0 6px 20px rgba(229, 9, 20, 0.4);
        }
        
        .premium-btn:hover {
          background: linear-gradient(135deg, #ff2a33 0%, #e50914 50%, #b8070f 100%);
          border-color: #ff5c65;
          box-shadow: 0 10px 30px rgba(229, 9, 20, 0.5);
        }
        
        .basic-btn {
          background: linear-gradient(135deg, #111111 0%, #222222 50%, #000000 100%);
          border: 2px solid #333;
        }
        
        .basic-btn:hover {
          background: linear-gradient(135deg, #222222 0%, #111111 50%, #000000 100%);
          border-color: #555;
        }
        
        .alert {
          border-radius: 8px;
          border: none;
          color: #ffffff;
        }
        
        .alert-success {
          background: linear-gradient(135deg, #0a3d1f 0%, #1a5c2f 100%);
        }
        
        .alert-info {
          background: linear-gradient(135deg, #0d2b3e 0%, #1a3d55 100%);
        }
          .active-plan-card {
          border: 3px solid #27ae60; /* Using the green check color */
          background: linear-gradient(135deg, #102d21 0%, #1a1a1a 100%);
        }
        .active-plan-badge {
          background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
          color: white;
          padding: 10px 0;
          text-align: center;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
      `}</style>

      <div className="section-padding">
        <Container>
          {/* USER'S CURRENT PLAN CARD */}
          {User && User.plan_expiry && (
            <Row className="justify-content-center mb-5">
              <Col lg="8" md="10">
                <div className="pricing-card active-plan-card">
                  <div className="active-plan-badge">
                    Your Current Plan
                  </div>
                  <div className="plan-header d-flex justify-content-between align-items-center px-4">
                    <div>
                      <h4 className="plan-name">
                        {User.plan_name ? User.plan_name : 'Active'}
                      </h4>
                      <p className="period mb-0">Your subscription is active until {
                        new Date(User.plan_expiry).toLocaleDateString()
                      }.</p>
                    </div>
                    <div className="subscribe-footer p-0">
                      <button className="subscribe-btn">
                        {
                          new Date(User.plan_expiry) > new Date() ? (
                            <>
                              <i className="fas fa-check-circle me-2"></i> Active
                            </>
                          ) : (
                            <>
                              <i className="fas fa-times-circle me-2"></i> Expired
                            </>
                          )
                        }
                      </button>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          )}

          {/* === CONDITIONAL RENDERING FOR LOADER === */}
          {pageLoading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '40vh' }}>
              <Spinner animation="border" variant="danger" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <Row className="justify-content-center">
              {plans.map((plan) => (
                <Col lg="4" md="6" className="mb-4" key={plan.id}>
                  <div className={`pricing-card ${plan.name === 'Premium' ? 'premium-card' : ''}`}>
                    {plan.name === 'Premium' && (
                      <div className="premium-badge">
                        Most Popular
                      </div>
                    )}
                    <div className="plan-header">
                      <h4 className="plan-name">{plan.name}</h4>
                    {/* <span className="sale-price text-decoration-line-through">₹{plan.price}</span> */}
                      <div className="price-container">
                        {plan.price && plan.price > plan.actual_price ? (
                          <span className="sale-price">₹{plan.price}</span>
                        ) : null}
                        <div>
                          <span className="currency">₹</span>
                          <span className="main-price">{plan.actual_price}</span>
                        </div>
                        <div className="period">{plan.detail}</div>
                      </div>
                    </div>
                    <div className="features-list">
                      <ul>
                        {plan.features.map((feature, index) => (
                          <li key={index}>
                            <i className={feature.available ? 'fas fa-check check-icon' : 'fas fa-times times-icon'}></i>
                            <span className="feature-text">{feature.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="subscribe-footer">
                      <button
                        className={`subscribe-btn ${getButtonClass(plan.name)}`}
                        onClick={() => {
                          if (plan.is_subscription) {
                            handleSubscribe(plan.rzp_plan_id)
                          } else {
                            handleOrderPayment(plan.rzp_plan_id)
                          }
                        }}
                        disabled={loadingStates[plan.rzp_plan_id]}
                      >
                        {loadingStates[plan.rzp_plan_id] ? 'Processing...' : plan.button_title}
                      </button>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </div>
    </Fragment>
  );
};

PricingPage.displayName = "PricingPage";
export default PricingPage;