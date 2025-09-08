import React, { memo, Fragment, useState } from "react";

//react-bootstrap
import { Col, Row } from "react-bootstrap";

// Next-Link
import Link from "next/link";

// Next-Image
import Image from "next/image";

//react fslight-box
import FsLightbox from "fslightbox-react";

// swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper";

// Redux Selector / Action
import { useSelector } from "react-redux";
import { theme_scheme_direction } from "../../store/setting/selectors";

// img (These would likely come from your API in a real scenario)
import img1 from "../../../public//assets/images/movies/movie-banner-1.webp";
import img2 from "../../../public//assets/images/movies/movie-banner-2.webp";
import img3 from "../../../public//assets/images/movies/movie-banner-3.webp";
// import pb from "@/lib/pocketbase";

// 1. --- DYNAMIC DATA SOURCE (JSON Array) ---
// This array simulates the data you would fetch from your API.
const moviesData = [
  {
    id: 1,
    title: "The Elephant Dream",
    // image: `${pb.baseURL}/api/files/pbc_4044198014/l52yqqiqa92pfi5/maxresdefault_twnxeov35q.jpg`,
    image: img1,
    rating: 3.5,
    mpaRating: "PG",
    duration: "1hr : 44mins",
    releaseDate: "Feb 2018",
    description:
      "Dinosaurs are a diverse group of reptiles of the clade Dinosauria. They first appeared during the Triassic period, between 243 and 233.23 million years ago.",
    slug: "the-elephant-dream", // For dynamic routing
    trailerUrl: "/assets/images/video/trailer.mp4", // Movie-specific trailer
    type: "movie",
  },
  {
    id: 2,
    title: "The Peacky Blinders",
    image: img2,
    rating: 3.5,
    mpaRating: "G",
    duration: "2hr : 42mins",
    releaseDate: "Nov 2017",
    description:
      "The most brutal emperor in the history of the world. He was the founder of the most contiguous empire of the world i.e. the Mongol empire. He made an army by himself.",
    slug: "the-peacky-blinders",
    trailerUrl: "/assets/images/video/trailer.mp4", // Replace with actual trailer
    type: "tv-shows"
  }
];


const MovieHeroSlider = memo(() => {
  const themeSchemeDirection = useSelector(theme_scheme_direction);

  // State to hold the URL of the trailer to be played
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);

  // Function to open the lightbox with a specific URL
  const handleTrailerClick = (url: string) => {
    setTrailerUrl(url);
  };

  return (
    <Fragment>
      <section className="banner-container section-padding-bottom">
        <div className="movie-banner">
          <div id="banner-detail-slider" className="banner-container">
            <div className="movie-banner tvshows-slider">
              <Swiper
                key={String(themeSchemeDirection)}
                dir={String(themeSchemeDirection)}
                navigation={{
                  prevEl: ".swiper-banner-button-prev",
                  nextEl: ".swiper-banner-button-next",
                }}
                slidesPerView={1.2}
                modules={[Navigation]}
                loop={true}
                centeredSlides={true}
                className="swiper-banner-container mb-0"
              >
                {/* 2. --- MAPPING OVER THE DATA --- */}
                {/* We map over the moviesData array to dynamically create a SwiperSlide for each movie. */}
                {moviesData.map((movie) => (
                  <SwiperSlide key={movie.id}>
                    <div className="movie-banner-image">
                      <Image src={movie.image} alt="movie-banner-image" />
                    </div>
                    <div className="shows-content h-100">
                      <Row className="align-items-center h-100">
                        <Col lg="7" md="12">
                          <h1
                            className="texture-text big-font letter-spacing-1 line-count-1 text-uppercase RightAnimate-two"
                            data-animation-in="fadeInLeft"
                            data-delay-in="0.6"
                          >
                            {movie.title}
                          </h1>
                          <div
                            className="flex-wrap align-items-center fadeInLeft animated"
                            data-animation-in="fadeInLeft"
                            style={{ opacity: 1 }}
                          >
                            <div className="slider-ratting d-flex align-items-center gap-3">
                              <ul className="ratting-start p-0 m-0 list-inline text-primary d-flex align-items-center justify-content-left">
                                {/* You could also make the star ratings dynamic if needed */}
                                <li><i className="fas fa-star" aria-hidden="true"></i></li>
                                <li><i className="fas fa-star" aria-hidden="true"></i></li>
                                <li><i className="fas fa-star" aria-hidden="true"></i></li>
                                <li><i className="fa fa-star-half" aria-hidden="true"></i></li>
                              </ul>
                              <span className="text-white">{movie.rating}(lmdb)</span>
                            </div>
                            <div className="d-flex flex-wrap align-items-center gap-3 movie-banner-time">
                              <span className="badge bg-secondary p-2">
                                <i className="fa fa-eye"></i> {movie.mpaRating}
                              </span>
                              <span className="font-size-6"><i className="fa-solid fa-circle"></i></span>
                              <span className="trending-time font-normal">{movie.duration}</span>
                              <span className="font-size-6"><i className="fa-solid fa-circle"></i></span>
                              <span className="trending-year font-normal">{movie.releaseDate}</span>
                            </div>
                            <p
                              className="movie-banner-text line-count-3"
                              data-animation-in="fadeInUp"
                              data-delay-in="1.2"
                            >
                              {movie.description}
                            </p>
                          </div>
                          <div
                            className="iq-button"
                            data-animation-in="fadeInUp"
                            data-delay-in="1.2"
                          >
                            {/* 3. --- DYNAMIC LINK --- */}
                            <Link
                              href={`/${movie.type}/${movie.slug}`}
                              className="btn text-uppercase position-relative"
                            >
                              <span className="button-text">Play Now</span>
                              <i className="fa-solid fa-play"></i>
                            </Link>
                          </div>
                        </Col>
                        <Col lg="5" md="12" className="trailor-video iq-slider d-none d-lg-block">
                          {/* 4. --- DYNAMIC TRAILER HANDLER --- */}
                          <div onClick={() => handleTrailerClick(movie.trailerUrl)} className="video-open playbtn" style={{ cursor: 'pointer' }}>
                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="80px" height="80px" viewBox="0 0 213.7 213.7" enableBackground="new 0 0 213.7 213.7" xmlSpace="preserve">
                              <polygon className="triangle" fill="none" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" points="73.5,62.5 148.5,105.8 73.5,149.1 "></polygon>
                              <circle className="circle" fill="none" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" cx="106.8" cy="106.8" r="103.3"></circle>
                            </svg>
                            <span className="w-trailor text-uppercase">Watch Trailer</span>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </SwiperSlide>
                ))}

                <div className="swiper-banner-button-next">
                  <i className="iconly-Arrow-Right-2 icli arrow-icon"></i>
                </div>
                <div className="swiper-banner-button-prev">
                  <i className="iconly-Arrow-Left-2 icli arrow-icon"></i>
                </div>
              </Swiper>
            </div>
          </div>
        </div>
      </section>

      {/* 5. --- DYNAMIC LIGHTBOX --- */}
      {/* The lightbox now becomes active when trailerUrl is not null, and its source is dynamic. */}
      <FsLightbox
        toggler={!!trailerUrl}
        sources={trailerUrl ? [trailerUrl] : []}
        onClose={() => setTrailerUrl(null)} // Close and reset the state
      />
    </Fragment>
  );
});

MovieHeroSlider.displayName = "MovieHeroSlider";
export default MovieHeroSlider;