import { useBreadcrumb } from '@/utilities/usePage';
import React, { Fragment, memo } from 'react';

// react-bootstrap
import { Container } from 'react-bootstrap';

const PrivacyPolicy = memo(() => {
    useBreadcrumb('Privacy Policy');
  
  return (
    <Fragment>
      <div className="section-padding">
        <Container>
          <div className="title-box">
            <h4 className="mb-4">Privacy Policy</h4>
            <p>
              This privacy policy sets out how CHATPATAMOVIES uses and protects any information that you give us when you visit our website and/or agree to purchase from us.
            </p>
            <p>
              CHATPATAMOVIES is committed to ensuring that your privacy is protected. Should we ask you to provide certain information by which you can be identified when using this website, you can be assured that it will only be used in accordance with this privacy statement.
            </p>
            <p>
              CHATPATAMOVIES may change this policy from time to time by updating this page. You should check this page periodically to ensure that you adhere to these changes.
            </p>
          </div>
          <div className="title-box">
            <h5 className="mb-3">What We Collect</h5>
            <p>We may collect the following information:</p>
            <ul>
              <li className="mb-2">Name</li>
              <li className="mb-2">Contact information including email address</li>
              <li className="mb-2">Demographic information such as postcode, preferences and interests, if required</li>
              <li>Other information relevant to customer surveys and/or offers</li>
            </ul>
          </div>
          <div className="title-box">
            <h5 className="mb-3">What We Do with the Information We Gather</h5>
            <p>We require this information to understand your needs and provide you with a better service, and in particular for the following reasons:</p>
            <ul>
                <li className="mb-2">Internal record keeping.</li>
                <li className="mb-2">We may use the information to improve our products and services.</li>
                <li className="mb-2">We may periodically send promotional emails about new products, special offers or other information which we think you may find interesting using the email address which you have provided.</li>
                <li>From time to time, we may also use your information to contact you for market research purposes. We may contact you by email, phone, fax or mail. We may use the information to customise the website according to your interests.</li>
            </ul>
          </div>
          <div className="title-box">
            <h5 className="mb-3">Security</h5>
            <p>
              We are committed to ensuring that your information is secure. In order to prevent unauthorised access or disclosure we have put in suitable physical, electronic and managerial procedures to safeguard and secure the information we collect online.
            </p>
          </div>
          <div className="title-box">
            <h5 className="mb-3">How We Use Cookies</h5>
            <p>
              A cookie is a small file which asks permission to be placed on your computer's hard drive. Once you agree, the file is added and the cookie helps analyze web traffic or lets you know when you visit a particular site. Cookies allow web applications to respond to you as an individual. The web application can tailor its operations to your needs, likes and dislikes by gathering and remembering information about your preferences.
            </p>
            <p>
              We use traffic log cookies to identify which pages are being used. This helps us analyze data about webpage traffic and improve our website in order to tailor it to customer needs. We only use this information for statistical analysis purposes and then the data is removed from the system.
            </p>
            <p>
              Overall, cookies help us provide you with a better website, by enabling us to monitor which pages you find useful and which you do not. A cookie in no way gives us access to your computer or any information about you, other than the data you choose to share with us.
            </p>
             <p>
              You can choose to accept or decline cookies. Most web browsers automatically accept cookies, but you can usually modify your browser setting to decline cookies if you prefer. This may prevent you from taking full advantage of the website.
            </p>
          </div>
          <div className="title-box">
            <h5 className="mb-3">Controlling Your Personal Information</h5>
            <p>You may choose to restrict the collection or use of your personal information in the following ways:</p>
            <ul>
                <li className="mb-2">Whenever you are asked to fill in a form on the website, look for the box that you can click to indicate that you do not want the information to be used by anybody for direct marketing purposes.</li>
                <li className="mb-2">If you have previously agreed to us using your personal information for direct marketing purposes, you may change your mind at any time by writing to or emailing us at&nbsp;
                  <a href="mailto:chatpatamoviehandle.in@gmail.com">chatpatamoviehandle.in@gmail.com</a>.
                </li>
                <li className="mb-2">We will not sell, distribute or lease your personal information to third parties unless we have your permission or are required by law to do so. We may use your personal information to send you promotional information about third parties which we think you may find interesting if you tell us that you wish this to happen.</li>
                <li>If you believe that any information we are holding on you is incorrect or incomplete, please write to us at our&nbsp;<strong>official mailing address</strong>&nbsp;or email us at&nbsp;
                  <a href="mailto:chatpatamoviehandle.in@gmail.com">chatpatamoviehandle.in@gmail.com</a>&nbsp;as soon as possible. We will promptly correct any information found to be incorrect.
                </li>
            </ul>
          </div>
        </Container>
      </div>
    </Fragment>
  );
});

PrivacyPolicy.displayName = 'PrivacyPolicy';
export default PrivacyPolicy;
