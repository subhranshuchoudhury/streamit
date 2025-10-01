import React from "react";

const ContactUs = () => {
  return (
    <div className="min-vh-100 bg-white">
      {/* Header Banner */}
      <div className="bg-light border-bottom">
        <div className="container py-3">
          {/* Replaced flex classes with d-flex and gap */}
          <div className="d-flex align-items-center gap-2">
            <p className="small text-muted mb-0">
              This page complies with RBI guidelines for payment gateway
              integration
            </p>
          </div>
        </div>
      </div>

      {/* Page Title Header - Added based on request */}
      <div className="bg-white text-center py-5">
        <div className="container">
          <h1 className="display-4 fw-bold">Get in Touch</h1>
          <p className="lead text-muted">
            We'd love to hear from you. Please fill out the form below or use
            our contact details to reach out.
          </p>
        </div>
      </div>


      {/* Main Content */}
      <div className="container pb-5">
        {/* Replaced Tailwind grid with Bootstrap's row/col grid system */}
        {/* g-5 is Bootstrap's largest gap utility */}
        <div className="row g-5">
          {/* Company Information */}
          {/* lg:col-span-1 becomes col-lg-4 (1/3 of 12) */}
          <div className="col-lg-4">
            <div className="bg-light p-4 rounded-3 h-100">
              <h2 className="h4 fw-semibold text-dark mb-4 d-flex align-items-center">
                Business Information
              </h2>

              {/* Replaced space-y-4 by adding margin-bottom to children */}
              <div>
                <div className="mb-4">
                  <p className="fw-bold text-dark">Legal Entity Name</p>
                  <p className="text-secondary mb-0">CHATPATAMOVIES</p>
                </div>

                <div>
                  <p className="fw-bold text-dark">Contact Details</p>
                  {/* Replaced space-y-2 by adding margin-bottom to children */}
                  <div className="mt-2">
                    {/* <a
                      href="tel:8245674554"
                      className="d-flex align-items-center text-primary text-decoration-none mb-2"
                    >
                      <Phone size={16} className="me-2" />
                      +91 8245674554
                    </a> */}
                    <a
                      href="mailto:support@chatpatamovies.com"
                      className="d-flex align-items-center text-primary text-decoration-none"
                    >
                      support@chatpatamovies.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          {/* lg:col-span-2 becomes col-lg-8 (2/3 of 12) */}
          <div className="col-lg-8">
            <div className="border rounded-3 p-4 p-md-5">
              <h1 className="h2 fw-semibold text-dark mb-2">Contact Us</h1>
              <p className="text-muted mb-4">
                Have questions? We're here to help.
              </p>

              {/* Replaced space-y-6 by adding mb-3 to each form group */}
              <form>
                {/* Replaced form grid with Bootstrap's row/col grid */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Full Name*</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email Address*</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Subject*</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="What is this regarding?"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">Message*</label>
                  <textarea
                    rows={4}
                    className="form-control"
                    placeholder="How can we help you?"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-100 btn btn-primary btn-lg fw-semibold"
                >
                  Send Message
                </button>
              </form>

              <div className="mt-4 pt-4 border-top">
                <p className="small text-muted mb-0">
                  By submitting this form, you agree to our{" "}
                  <a href="/terms-&-conditions" className="text-primary">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy-policy" className="text-primary">
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;