import { Fragment, memo } from "react";
import Link from 'next/link'

interface Props {
  link: string,
  watchlistLink: string,
  image: string,
  title: string,
  movieTime: string
}

const CardStyle = memo((props: Props) => {
  return (
    <Fragment>
      <div className="iq-card card-hover" style={{ height: "100%" }}>
        <div className="block-images position-relative w-100" 
          style={{ 
            height: "100%", 
            display: "flex", 
            flexDirection: "column",
            transition: "all 0.3s ease"
          }}
        >
          <div className="img-box w-100" 
            style={{ 
              flex: "0 0 80%", 
              height: "80%",
              transition: "all 0.3s ease"
            }}
          >
            <Link
              href={props.link}
              className="position-absolute top-0 bottom-0 start-0 end-0"
            ></Link>
            <img
              src={props.image}
              alt="movie-card"
              className="img-fluid object-cover w-100 d-block border-0"
              style={{ 
                height: "100%", 
                objectFit: "cover",
                transition: "all 0.3s ease"
              }}
            />
          </div>
          <div style={{ flex: "0 0 20%", height: "20%" }}>
            <div className="card-description with-transition">
              <div className="cart-content">
                <div className="content-left">
                  <h5 className="iq-title text-capitalize">
                    <Link href={props.link}>{props.title}</Link>
                  </h5>
                  <div className="movie-time d-flex align-items-center my-2">
                    <span className="movie-time-text font-normal">{props.movieTime}</span>
                  </div>
                </div>
                <div className="watchlist">
                  <Link className="watch-list-not" href={props.watchlistLink}>
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="icon-10"
                    >
                      <path
                        d="M12 4V20M20 12H4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                    <span className="watchlist-label">Watchlist</span>
                  </Link>
                </div>
              </div>
            </div>
            <div className="block-social-info align-items-center">
              {/* ...social info code remains unchanged... */}
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
});

CardStyle.displayName = "CardStyle";
export default CardStyle;
