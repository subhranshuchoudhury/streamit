import React from "react";

const RefundPolicy = () => {
  return (
    // Replaced min-h-screen with min-vh-100 and bg-gray-50 with bg-light
    <div className="min-vh-100 bg-light">
      {/* Header */}
      {/* Replaced border-b with border-bottom */}
      <div className="bg-white border-bottom">
        {/* Replaced max-w-4xl mx-auto... with Bootstrap's container */}
        <div className="container py-5">
          {/* Replaced flex items-center space-x-2 with d-flex, align-items-center, and gap */}
          <div className="d-flex align-items-center gap-2">
            {/* Replaced color class with text-primary and set icon size */}
            {/* Replaced typography classes with Bootstrap equivalents */}
            <h1 className="h2 fw-semibold text-dark mb-0 mt-5">
              Cancellation & Refund Policy
            </h1>
          </div>
          <div className="d-flex align-items-center mt-2 text-muted small">
            {/* Replaced mr-2 with me-2 */}
            Last updated on 13-02-2025 20:20:51
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-5">
        {/* Card styling with Bootstrap classes */}
        <div className="bg-white rounded-3 shadow-sm p-5">
          {/* Converted text color and margin */}
          <p className="text-secondary mb-5">
            CHATPATAMOVIES believes in helping its customers as far as
            possible, and has therefore a liberal cancellation policy.
          </p>

          {/* Policy Details */}
          {/* Replaced space-y-6 by adding margin-bottom to child elements */}
          <div>
            {/* Cancellation Section */}
            <div className="mb-5">
              <h2 className="h4 fw-semibold text-dark mb-4">
                Cancellation Policy
              </h2>
              {/* Replaced space-y-4 by adding mb-3 to list items */}
              <ul className="list-unstyled text-secondary">
                {/* Replaced flex items-start with Bootstrap's d-flex */}
                <li className="d-flex align-items-start mb-3">
                  <span className="me-2">•</span>
                  <p className="mb-0">
                    Cancellations will be considered only if the request is made
                    immediately after placing the order. However, the
                    cancellation request may not be entertained if the orders
                    have been communicated to the vendors/merchants and they
                    have initiated the process of shipping them.
                  </p>
                </li>
                <li className="d-flex align-items-start">
                  <span className="me-2">•</span>
                  <p className="mb-0">
                    CHATPATAMOVIES does not accept cancellation requests for
                    perishable items like flowers, eatables etc. However,
                    refund/replacement can be made if the customer establishes
                    that the quality of product delivered is not good.
                  </p>
                </li>
              </ul>
            </div>

            {/* Damaged/Defective Items */}
            <div className="mb-5">
              <h2 className="h4 fw-semibold text-dark mb-4">
                Damaged or Defective Items
              </h2>
              {/* Replaced custom div with Bootstrap's alert component */}
              <div className="alert alert-primary d-flex align-items-start mb-4" role="alert">
                <div className="small">
                  Report any damaged or defective items to our Customer
                  Service team within the same day of receipt.
                </div>
              </div>
              {/* Replaced space-y-4 by adding mb-3 to list items */}
              <ul className="list-unstyled text-secondary">
                <li className="d-flex align-items-start mb-3">
                  <span className="me-2">•</span>
                  <p className="mb-0">
                    The request will be entertained once the merchant has checked
                    and determined the same at their end.
                  </p>
                </li>
                <li className="d-flex align-items-start mb-3">
                  <span className="me-2">•</span>
                  <p className="mb-0">
                    If the product received is not as shown on the site or as per
                    your expectations, you must bring it to the notice of our
                    customer service within the same day of receiving the
                    product.
                  </p>
                </li>
                <li className="d-flex align-items-start">
                  <span className="me-2">•</span>
                  <p className="mb-0">
                    For products with manufacturer warranty, please refer the
                    issue directly to them.
                  </p>
                </li>
              </ul>
            </div>

            {/* Refund Timeline */}
            {/* Replaced custom div with a simple styled card */}
            <div className="bg-light rounded-3 p-4">
              <h2 className="h5 fw-semibold text-dark mb-3">
                Refund Processing
              </h2>
              <p className="text-secondary mb-0">
                In case of any Refunds approved by CHATPATAMOVIES, it'll take{" "}
                <span className="fw-bold">9-15 Days</span> for the refund to be
                processed to the end customer.
              </p>
            </div>
          </div>

          {/* Footer Note */}
          {/* Replaced spacing and border classes */}
          <div className="mt-5 pt-4 border-top">
            <p className="small text-muted mb-0">
              For any queries regarding our cancellation and refund policy,
              please contact our customer service team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;