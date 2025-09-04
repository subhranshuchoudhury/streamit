import { Fragment, memo, useState } from "react";
import { useRouter } from "next/router"; // Import useRouter for redirection
import { Col, Container, Row } from "react-bootstrap";
import Link from "next/link";
import { useBreadcrumb } from "@/utilities/usePage";
import pb from "@/lib/pocketbase";

const PricingPage = () => {
  useBreadcrumb("Pricing Plan");
  const router = useRouter(); // Initialize useRouter
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    Free: false,
    Premium: false,
    Basic: false
  });

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js  ";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (planType: string, price: number) => {
    // Check if user is authenticated
    if (!pb.authStore.isValid || !pb.authStore.record) {
      router.push("/auth/login"); // Redirect to /auth/login if not logged in
      return;
    }

    // Set loading state for the specific plan
    setLoadingStates(prev => ({ ...prev, [planType]: true }));
    
    try {
      const res = await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: "plan_RD1vrLMOPOxx0f",
          customer_id: pb.authStore.record?.id,
          plan_type: planType,
          amount: price,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create subscription");
      }

      const subscription = await res.json();

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Razorpay SDK failed to load");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscription.id,
        name: "Streamit",
        description: `Subscribe for ${planType} - ₹${price}`,
        handler: async (response: any) => {
          setIsSubscribed(true);
          alert("Subscription successful!");
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
    } catch (error) {
      console.error("Subscription error:", error);
      alert("An error occurred during subscription. Please try again.");
    } finally {
      // Reset loading state for the specific plan
      setLoadingStates(prev => ({ ...prev, [planType]: false }));
    }
  };

  return (
    <Fragment>
      <style jsx>{`
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
      `}</style>
      
      {isSubscribed ? (
        <div className="alert alert-success text-center mx-3 mb-4">
          <h4>🎉 Premium Item Visible: Here's the exclusive content!</h4>
        </div>
      ) : (
        <div className="alert alert-info text-center mx-3 mb-4">
          📺 Subscribe to view exclusive content and unlock all features!
        </div>
      )}
      
      <div className="section-padding">
        <Container>
          <Row className="justify-content-center">
            <Col lg="4" md="6" className="mb-4">
              <div className="pricing-card">
                <div className="plan-header">
                  <h4 className="plan-name">Basic</h4>
                  <div className="price-container">
                    <span className="currency">₹</span>
                    <span className="main-price">99</span>
                    <div className="period">per month</div>
                  </div>
                </div>
                <div className="features-list">
                  <ul>
                    <li>
                      <i className="fas fa-check check-icon"></i>
                      <span className="feature-text">Limited movies and shows</span>
                    </li>
                    <li>
                      <i className="fas fa-times times-icon"></i>
                      <span className="feature-text">Watch on TV or Laptop</span>
                    </li>
                    <li>
                      <i className="fas fa-times times-icon"></i>
                      <span className="feature-text">Streamit Special</span>
                    </li>
                    <li>
                      <i className="fas fa-times times-icon"></i>
                      <span className="feature-text">Max video quality</span>
                    </li>
                  </ul>
                </div>
                <div className="subscribe-footer">
                  <button 
                    className="subscribe-btn free-btn" 
                    onClick={() => handleSubscribe('Free', 99)}
                    disabled={loadingStates.Free}
                  >
                    {loadingStates.Free ? 'Processing...' : 'Subscribe for ₹99/month'}
                  </button>
                </div>
              </div>
            </Col>
            
            <Col lg="4" md="6" className="mb-4">
              <div className="pricing-card premium-card">
                <div className="premium-badge">
                  Most Popular - Save 25%
                </div>
                <div className="plan-header">
                  <h4 className="plan-name">Premium</h4>
                  <div className="price-container">
                    <span className="sale-price">₹249</span>
                    <div>
                      <span className="currency">₹</span>
                      <span className="main-price">199</span>
                    </div>
                    <div className="period">per month</div>
                  </div>
                </div>
                <div className="features-list">
                  <ul>
                    <li>
                      <i className="fas fa-check check-icon"></i>
                      <span className="feature-text">Ads free movies and shows</span>
                    </li>
                    <li>
                      <i className="fas fa-check check-icon"></i>
                      <span className="feature-text">Watch on TV or Laptop</span>
                    </li>
                    <li>
                      <i className="fas fa-check check-icon"></i>
                      <span className="feature-text">Streamit Special</span>
                    </li>
                    <li>
                      <i className="fas fa-check check-icon"></i>
                      <span className="feature-text">4K Ultra HD quality</span>
                    </li>
                  </ul>
                </div>
                <div className="subscribe-footer">
                  <button 
                    className="subscribe-btn premium-btn" 
                    onClick={() => handleSubscribe('Premium', 199)}
                    disabled={loadingStates.Premium}
                  >
                    {loadingStates.Premium ? 'Processing...' : 'Subscribe for ₹199/month'}
                  </button>
                </div>
              </div>
            </Col>
            
            <Col lg="4" md="6" className="mb-4">
              <div className="pricing-card">
                <div className="plan-header">
                  <h4 className="plan-name">Ultra Premium</h4>
                  <div className="price-container">
                    <span className="currency">₹</span>
                    <span className="main-price">349</span>
                    <div className="period">per month</div>
                  </div>
                </div>
                <div className="features-list">
                  <ul>
                    <li>
                      <i className="fas fa-times times-icon"></i>
                      <span className="feature-text">Ads free movies and shows</span>
                    </li>
                    <li>
                      <i className="fas fa-check check-icon"></i>
                      <span className="feature-text">Watch on TV or Laptop</span>
                    </li>
                    <li>
                      <i className="fas fa-check check-icon"></i>
                      <span className="feature-text">Streamit Special</span>
                    </li>
                    <li>
                      <i className="fas fa-check check-icon"></i>
                      <span className="feature-text">HD video quality</span>
                    </li>
                  </ul>
                </div>
                <div className="subscribe-footer">
                  <button 
                    className="subscribe-btn basic-btn" 
                    onClick={() => handleSubscribe('Basic', 349)}
                    disabled={loadingStates.Basic}
                  >
                    {loadingStates.Basic ? 'Processing...' : 'Subscribe for ₹349/month'}
                  </button>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </Fragment>
  );
};

PricingPage.displayName = "PricingPage";
export default PricingPage;