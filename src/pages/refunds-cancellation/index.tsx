import { useBreadcrumb } from '@/utilities/usePage';
import React, { Fragment, memo } from 'react';

// react-bootstrap
import { Container } from 'react-bootstrap';

const RefundPolicy = memo(() => {
  useBreadcrumb('Refund & Cancellation');
  return (
    <Fragment>
      <div className="section-padding">
        <Container>
          <div className="title-box">
            <h4 className="mb-4">Refund & Cancellation Policy</h4>
            <p>
              CHATPATAMOVIES believes in helping its customers as far as possible, and has therefore a liberal cancellation policy.
            </p>
          </div>
          <div className="title-box">
            <h5 className="mb-3">Cancellation Policy</h5>
            <ul>
              <li className="mb-2">
                Cancellations will be considered only if the request is made immediately after placing the order. However, the cancellation request may not be entertained if the orders have been communicated to the vendors/merchants and they have initiated the process of shipping them.
              </li>
              <li className="mb-2">
                CHATPATAMOVIES does not accept cancellation requests for perishable items like flowers, eatables etc. However, refund/replacement can be made if the customer establishes that the quality of product delivered is not good.
              </li>
            </ul>
          </div>
          <div className="title-box">
            <h5 className="mb-3">Damaged or Defective Items</h5>
            <p>Report any damaged or defective items to our Customer Service team within the same day of receipt.</p>
            <ul>
              <li className="mb-2">
                The request will be entertained once the merchant has checked and determined the same at their end.
              </li>
              <li className="mb-2">
                If the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within the same day of receiving the product.
              </li>
               <li className="mb-2">
                For products with manufacturer warranty, please refer the issue directly to them.
              </li>
            </ul>
          </div>
           <div className="title-box">
            <h5 className="mb-3">Refund Processing</h5>
            <p>
              In case of any Refunds approved by CHATPATAMOVIES, it'll take&nbsp;<strong>9-15 Days</strong>&nbsp;for the refund to be processed to the end customer.
            </p>
             <p className="mb-0">
              For any queries regarding our cancellation and refund policy, please contact our customer service team.
            </p>
          </div>
        </Container>
      </div>
    </Fragment>
  );
});

RefundPolicy.displayName = 'RefundPolicy';
export default RefundPolicy;
