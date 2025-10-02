import { Fragment, memo, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from 'next/link';

// Import UI components
import { Row, Col, Container, Nav, Tab, Spinner, Alert, Button, Modal } from "react-bootstrap";
import { useMutation, useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";

// Components
import RatingStar from "@/components/rating-star";
import FsLightBox from "@/components/fslight-box";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper";

// Redux
import { useSelector } from "react-redux";
import { theme_scheme_direction } from "@/store/setting/selectors";

// Utils, Libs & Types
import pb from "@/lib/pocketbase";
import { useEnterExit } from "@/utilities/usePage";
import { generateImgPath } from "@/StaticData/data";
import { ClientProvider } from "@/providers/client.provider";
import { formatTime } from "@/helper/ms-to-hm";
import { fetchStreamSource } from "@/helper/fetch-stream-details";
import { TVShow, Season, Episode } from "@/types/pb.types";

// Helper to get correct PocketBase file URL
const getPbImageUrl = (
    record: { collectionId: string, id: string },
    filename: string
) => {
    if (!record || !filename) return '';
    return `${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/${record.collectionId}/${record.id}/${filename}`;
};


// --- START: Pricing Plan Modal Component ---

// Define interfaces for plan and user for type safety
interface Plan {
    id: string;
    name: string;
    price: number;
    actual_price: number;
    features: { text: string; available: boolean }[];
    rzp_plan_id: string;
    is_subscription: boolean;
    detail: string;
    button_title: string;
}

interface User {
    id: string;
    plan_expiry?: string;
    plan_name?: string;
    [key: string]: any;
}

const PricingPlansModal = ({ show, onHide, onPurchaseSuccess }: { show: boolean, onHide: () => void, onPurchaseSuccess: () => void }) => {
    const router = useRouter();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        const loadPlans = async () => {
            if (show) { // Only load plans when modal is shown
                setPageLoading(true);
                try {
                    const fetchedPlans = await pb.collection("plans").getFullList<Plan>({ sort: "position" });
                    setPlans(fetchedPlans);
                } catch (error) {
                    console.error("Failed to load plans:", error);
                } finally {
                    setPageLoading(false);
                }
            }
        };
        loadPlans();
    }, [show]);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async (plan: Plan) => {
        if (!pb.authStore.isValid || !pb.authStore.record) {
            router.push("/auth/login"); // Should not happen if modal logic is correct, but as a fallback
            return;
        }

        setLoadingStates(prev => ({ ...prev, [plan.rzp_plan_id]: true }));

        const apiEndpoint = plan.is_subscription ? "/api/create-subscription" : "/api/create-order";
        const body = {
            plan_id: plan.is_subscription ? plan.rzp_plan_id : plan.id,
            customer_id: pb.authStore.record.id,
            plan_name: plan.name,
        };

        try {
            const res = await fetch(apiEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Failed to create payment");
            }

            const paymentData = await res.json();
            const scriptLoaded = await loadRazorpayScript();

            if (!scriptLoaded) {
                throw new Error("Could not load payment gateway. Please check your connection.");
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                name: "Chatpata Movies",
                description: `Payment for ${plan.name}`,
                ...(plan.is_subscription
                    ? { subscription_id: paymentData.id }
                    : { order_id: paymentData.id, amount: paymentData.amount, currency: paymentData.currency }
                ),
                handler: async (response: any) => {
                    const verificationEndpoint = plan.is_subscription ? '/api/verify-subscription' : '/api/verify-order';
                    const verificationBody = {
                        userId: pb.authStore.record?.id,
                        ...response
                    };

                    try {
                        const verifyRes = await fetch(verificationEndpoint, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(verificationBody),
                        });
                        const verifyData = await verifyRes.json();

                        if (verifyData.success) {
                            Swal.fire({
                                icon: 'success',
                                title: 'Payment Successful!',
                                text: `Your ${plan.name} plan is now active. Enjoy!`,
                                timer: 2000,
                                showConfirmButton: false
                            });
                            onPurchaseSuccess(); // Trigger success callback
                        } else {
                            throw new Error(verifyData.message || 'Payment verification failed.');
                        }
                    } catch (error: any) {
                         Swal.fire({ icon: 'error', title: 'Verification Error', text: error.message });
                    }
                },
                prefill: {
                    name: pb.authStore.record?.name,
                    email: pb.authStore.record?.email,
                },
                theme: { color: "#E50914" },
            };

            // @ts-ignore
            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error: any) {
            Swal.fire({ icon: 'error', title: 'Payment Error', text: error.message });
        } finally {
            setLoadingStates(prev => ({ ...prev, [plan.rzp_plan_id]: false }));
        }
    };

    return (
        <>
            <style jsx>{`
                /* --- Pink Themed Pricing Cards --- */
                .pricing-modal-body {
                    background-color: #fdf2f8; /* Light Pink Background */
                }
                .pricing-card {
                    border: 2px solid #f8bbd0; /* Soft Pink Border */
                    border-radius: 16px;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    background: #ffffff;
                    box-shadow: 0 4px 25px rgba(0, 0, 0, 0.05);
                    color: #5c203b; /* Dark Pink Text */
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }
                .pricing-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 12px 40px rgba(233, 30, 99, 0.15);
                    border-color: #e91e63;
                }
                .premium-card {
                    border: 3px solid #e91e63; /* Main Pink */
                    transform: scale(1.05);
                    position: relative;
                    z-index: 1;
                }
                .premium-badge {
                    background: linear-gradient(135deg, #ec407a 0%, #d81b60 100%);
                    color: white;
                    padding: 8px 0;
                    font-weight: bold;
                    font-size: 14px;
                }
                .plan-header { padding: 25px 20px 15px; text-align: center; }
                .plan-name { font-size: 24px; font-weight: 700; color: #ad1457; }
                .price-container { margin-bottom: 15px; }
                .currency { font-size: 22px; font-weight: 600; color: #e91e63; vertical-align: super; }
                .main-price { font-size: 44px; font-weight: 800; color: #e91e63; }
                .sale-price { font-size: 18px; color: #9c5a75; text-decoration: line-through; }
                .period { font-size: 15px; color: #883b5d; font-weight: 500; }
                .features-list { padding: 0 25px 25px; flex-grow: 1; }
                .features-list ul { list-style: none; padding: 0; margin: 0; }
                .features-list li { padding: 10px 0; display: flex; align-items: center; border-bottom: 1px solid #fce4ec; }
                .features-list li:last-child { border-bottom: none; }
                .features-list i { margin-right: 12px; }
                .check-icon { color: #4caf50; }
                .times-icon { color: #f44336; }
                .feature-text { font-size: 15px; font-weight: 500; }
                .subscribe-footer { padding: 0 25px 25px; }
                .subscribe-btn {
                    width: 100%;
                    padding: 14px;
                    background: linear-gradient(135deg, #ec407a 0%, #c2185b 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(233, 30, 99, 0.3);
                }
                .subscribe-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 25px rgba(233, 30, 99, 0.4);
                }
                .subscribe-btn:disabled { opacity: 0.6; cursor: not-allowed; }
            `}</style>

            <Modal show={show} onHide={onHide} centered size="lg" backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>
                        💖 Unlock Your Entertainment
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="pricing-modal-body p-4 p-md-5">
                    <div className="text-center mb-4">
                        <h4 className="mb-1 text-dark-pink">Choose Your Plan</h4>
                        <p className="text-muted">You need an active plan to watch this video. Select one to continue!</p>
                    </div>

                    {pageLoading ? (
                        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                            <Spinner animation="border" variant="primary" />
                        </div>
                    ) : (
                        <Row className="justify-content-center">
                            {plans.map((plan) => (
                                <Col lg="6" md="6" className="mb-4 d-flex" key={plan.id}>
                                    <div className={`pricing-card ${plan.name.toLowerCase().includes('premium') ? 'premium-card' : ''}`}>
                                        {plan.name.toLowerCase().includes('premium') && <div className="premium-badge">Most Popular</div>}
                                        <div className="plan-header">
                                            <h4 className="plan-name">{plan.name}</h4>
                                            <div className="price-container">
                                                {plan.actual_price && plan.actual_price > plan.price && (
                                                    <span className="sale-price">₹{plan.actual_price}</span>
                                                )}
                                                <div>
                                                    <span className="currency">₹</span>
                                                    <span className="main-price">{plan.price}</span>
                                                </div>
                                                <div className="period">{plan.detail}</div>
                                            </div>
                                        </div>
                                        {/* <div className="features-list">
                                            <ul>
                                                {plan.features.map((feature, index) => (
                                                    <li key={index}>
                                                        <i className={feature.available ? 'fas fa-check-circle check-icon' : 'fas fa-times-circle times-icon'}></i>
                                                        <span className="feature-text">{feature.text}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div> */}
                                        <div className="subscribe-footer">
                                            <button
                                                className="subscribe-btn"
                                                onClick={() => handlePayment(plan)}
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
                </Modal.Body>
            </Modal>
        </>
    );
};
// --- END: Pricing Plan Modal Component ---



const EpisodePage = memo(() => {
    useEnterExit();
    const router = useRouter();

    const { slug: seriesSlug, 'season-slug': seasonSlug, 'episode-slug': episodeSlug } = router.query;
    const themeSchemeDirection = useSelector(theme_scheme_direction);

    // State for loaders and modals
    const [isIframeLoading, setIsIframeLoading] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showPricingModal, setShowPricingModal] = useState(false); // New state for pricing modal

    const fetchSeriesData = async (slug: string) => {
        if (!slug) return;
        return pb.collection('tv_shows').getFirstListItem<TVShow>(`slug="${slug}"`, {
            expand: "seasons,seasons.episodes"
        });
    };

    const { data: series, isLoading, isError } = useQuery({
        queryKey: ["series", seriesSlug],
        queryFn: () => fetchSeriesData(String(seriesSlug)),
        enabled: !!seriesSlug,
    });

    const { currentSeason, currentEpisode, otherEpisodes, nextEpisode } = useMemo(() => {
        // ... (no changes in this useMemo block)
        const defaultState = { currentSeason: null, currentEpisode: null, otherEpisodes: [], nextEpisode: null };
        if (!series?.expand?.seasons || !seasonSlug || !episodeSlug) {
            return defaultState;
        }
        const seasonNum = parseInt(String(seasonSlug), 10);
        const episodeNum = parseInt(String(episodeSlug), 10);
        const season = series.expand.seasons.find((s: Season) => s.season_no === seasonNum);
        if (!season || !season.expand?.episodes) return defaultState;
        const sortedEpisodes = [...season.expand.episodes].sort((a: Episode, b: Episode) => a.episode_no - b.episode_no);
        const currentEpisodeIndex = sortedEpisodes.findIndex((e: Episode) => e.episode_no === episodeNum);
        if (currentEpisodeIndex === -1) return defaultState;
        const episode = sortedEpisodes[currentEpisodeIndex];
        const next = sortedEpisodes[currentEpisodeIndex + 1] || null;
        const others = sortedEpisodes.filter((e: Episode) => e.episode_no !== episodeNum);
        return { currentSeason: season, currentEpisode: episode, otherEpisodes: others, nextEpisode: next };
    }, [series, seasonSlug, episodeSlug]);

    const { mutate, data: streamSource, error: streamSourceError, isPending: streamLoading } = useMutation({
        mutationFn: fetchStreamSource,
        onError: (error: any) => {
            // If the error is 401 (Unauthorized), show the login modal
            if (error?.status === 401) {
                setShowLoginModal(true);
            }
            // If the error is 403 (Forbidden/No Plan), show the pricing modal
            else if (error?.status === 403) {
                setShowPricingModal(true);
            }
        },
    });

    useEffect(() => {
        if (currentEpisode && currentEpisode.video_id && currentEpisode.library_id) {
            setIsIframeLoading(true);
            mutate({ video_id: currentEpisode.video_id, library_id: currentEpisode.library_id });
        }
    }, [currentEpisode, mutate]);

    const handleGoogleSignIn = async () => {
        // ... (no changes in this function)
        try {
            await pb.collection("users").authWithOAuth2({ provider: "google" });
            if (pb.authStore.isValid) {
                setShowLoginModal(false);
                if (currentEpisode && currentEpisode.video_id && currentEpisode.library_id) {
                    setIsIframeLoading(true);
                    mutate({ video_id: currentEpisode.video_id, library_id: currentEpisode.library_id });
                }
            }
        } catch (err) {
            console.error("Google Sign-In Error:", err);
        }
    };

    // New handler for when a purchase is successful
    const handlePurchaseSuccess = () => {
        setShowPricingModal(false); // Close the pricing modal
        // Retry fetching the stream source now that the user has a plan
        if (currentEpisode && currentEpisode.video_id && currentEpisode.library_id) {
            setIsIframeLoading(true);
            mutate({ video_id: currentEpisode.video_id, library_id: currentEpisode.library_id });
        }
    };

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
                <Spinner animation="border" variant="primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    if (isError) {
        return (
            <Container className="py-5">
                <Alert variant="danger" className="text-center">
                    <Alert.Heading>Failed to Load Series Data</Alert.Heading>
                    <p>We couldn't find the TV series you're looking for. It might be unavailable or the link may be incorrect.</p>
                    <Button variant="primary" onClick={() => router.push("/tv-shows")}>
                        Back to Shows
                    </Button>
                </Alert>
            </Container>
        );
    }
    
    // This function now only handles generic errors, as 401 and 403 trigger modals.
    const renderStreamError = () => {
        if (!streamSourceError) return null;
        // @ts-ignore
        const message = streamSourceError.message || "An unexpected error occurred.";
        return (
            <Alert variant="danger" className="text-center m-0">
                <Alert.Heading>Sorry! 😢</Alert.Heading>
                <p>{message}</p>
                <Button variant="primary" onClick={() => router.reload()}>
                    Play
                </Button>
            </Alert>
        );
    };

    return (
        <Fragment>
            {/* Login Modal */}
            <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Login to watch videos</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center p-4 bg-light-pink text-dark-pink">
                    <p className="mb-4 fs-5 fw-semibold">
                        💖 Just one step away! <br />
                        Sign in to unlock your video.
                    </p>
                    <div className="d-grid">
                        <Button onClick={handleGoogleSignIn} className="d-flex align-items-center justify-content-center btn-pink">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="me-2">
                                <path d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#FBC02D"></path>
                                <path d="M3.15283 7.3455L6.43833 9.755C7.32733 7.554 9.48033 6 11.9998 6C13.5293 6 14.9208 6.577 15.9803 7.5195L18.8088 4.691C17.0228 3.0265 14.6338 2 11.9998 2C8.15883 2 4.82783 4.1685 3.15283 7.3455Z" fill="#E53935"></path>
                                <path d="M12.0002 22.0001C14.5832 22.0001 16.9302 21.0116 18.7047 19.4041L15.6097 16.7851C14.6057 17.5456 13.3577 18.0001 12.0002 18.0001C9.39916 18.0001 7.19066 16.3416 6.35866 14.0271L3.09766 16.5396C4.75266 19.7781 8.11366 22.0001 12.0002 22.0001Z" fill="#4CAF50"></path>
                                <path d="M21.8055 10.0415L21.7975 10H21H12V14H17.6515C17.2555 15.1185 16.536 16.083 15.608 16.7855C15.6085 16.785 15.609 16.785 15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#1565C0"></path>
                            </svg>
                            <span>Sign in with Google</span>
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
            
            {/* NEW Pricing Plans Modal */}
            <PricingPlansModal
                show={showPricingModal}
                onHide={() => setShowPricingModal(false)}
                onPurchaseSuccess={handlePurchaseSuccess}
            />

            <div className="iq-main-slider site-video">
                <Container fluid>
                    <Row>
                        <Col lg="12">
                            <div className="video-container" style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
                                {(streamLoading || (isIframeLoading && !streamSourceError)) && (
                                    <div className="d-flex justify-content-center align-items-center" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 }}>
                                        <Spinner animation="border" variant="primary" />
                                    </div>
                                )}
                                {streamSource?.source && !streamSourceError && (
                                    <iframe
                                        src={streamSource.source}
                                        onLoad={() => setIsIframeLoading(false)}
                                        loading="lazy"
                                        style={{ border: 0, position: "absolute", top: 0, height: "100%", width: "100%", opacity: isIframeLoading ? 0 : 1, transition: 'opacity 0.3s ease-in-out' }}
                                        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                                        allowFullScreen
                                    ></iframe>
                                )}
                                {/* Error Display (hidden when modals are active) */}
                                {!streamLoading && streamSourceError && !showLoginModal && !showPricingModal && (
                                    <div className="d-flex justify-content-center align-items-center p-md-5 p-3" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                                        {renderStreamError()}
                                    </div>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
            
            {/* --- REST OF THE PAGE JSX (No changes below this line) --- */}

            <div className="details-part">
                <Container fluid>
                    <div className="trending-info mt-4 pt-0 pb-4">
                        <Row>
                            <Col md={9} className="col-12 mb-auto">
                                <div className="d-md-flex">
                                    <h2 className="trending-text fw-bold texture-text text-uppercase mt-0">{series?.title}</h2>
                                    <div className="slider-ratting d-flex align-items-center gap-2 ms-md-3 ms-0">
                                        {series?.rating && (
                                            <>
                                                <RatingStar count={Math.floor(series.rating)} count1={series.rating % 1 > 0 ? 1 : 0} starColor="text-primary" />
                                                <span className="text-white">
                                                    {series?.rating.toFixed(1)}
                                                    <img src={generateImgPath("/assets/images/movies/imdb-logo.svg")} alt="imdb-logo" className="img-fluid ms-2" />
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <ul className="p-0 mt-2 list-inline d-flex flex-wrap movie-tag">
                                    <li className="font-size-18">S{currentSeason?.season_no} E{currentEpisode?.episode_no}</li>
                                    <li className="font-size-18">{currentEpisode?.title}</li>
                                    <li className="font-size-18">{formatTime(currentEpisode?.duration || 0)}</li>
                                </ul>
                            </Col>
                            {series?.trailer && series.trailer.length > 0 &&
                                <FsLightBox sources={[series.trailer]} image={getPbImageUrl(series, series?.thumbnail)} />
                            }
                        </Row>
                    </div>
                    <div className="content-details trending-info">
                        <Tab.Container defaultActiveKey="first">
                            <Nav className="iq-custom-tab tab-bg-gredient-center d-flex nav nav-pills align-items-center text-center mb-5 justify-content-center list-inline">
                                <Nav.Item>
                                    <Nav.Link eventKey="first">Description</Nav.Link>
                                </Nav.Item>
                            </Nav>
                            <Tab.Content>
                                <Tab.Pane className=" fade show" eventKey="first">
                                    <p>{currentEpisode?.detail}</p>
                                </Tab.Pane>
                            </Tab.Content>
                        </Tab.Container>
                    </div>
                </Container>
            </div>

            {nextEpisode && (
                <div className="next-episode-block">
                    <Container fluid>
                        <div className="d-flex align-items-center justify-content-between px-3 pt-2 my-4">
                            <h5 className="main-title text-capitalize mb-0">Next Episode</h5>
                        </div>
                        <div className="episode-block-wrapper" style={{ maxWidth: '400px', padding: '0 15px' }}>
                            <div className="episode-block">
                                <div className="block-image position-relative">
                                    <Link replace href={`/tv-shows/${seriesSlug}/season/${currentSeason?.season_no}/episode/${nextEpisode.episode_no}`}>
                                        <img src={getPbImageUrl(nextEpisode, nextEpisode.thumbnail)} alt="showImg" className="img-fluid img-zoom" loading="lazy" />
                                    </Link>
                                    <div className="episode-number">E{nextEpisode.episode_no}</div>
                                    <div className="episode-play">
                                        <Link replace href={`/tv-shows/${seriesSlug}/season/${currentSeason?.season_no}/episode/${nextEpisode.episode_no}`}>
                                            <i className="fa-solid fa-play"></i>
                                        </Link>
                                    </div>
                                </div>
                                <div className="epi-desc p-3">
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                        <span className="border-gredient-left text-white rel-date">{new Date(nextEpisode.created).toLocaleDateString()}</span>
                                        <span className="text-primary run-time">{formatTime(nextEpisode.duration)}</span>
                                    </div>
                                    <Link replace href={`/tv-shows/${seriesSlug}/season/${currentSeason?.season_no}/episode/${nextEpisode.episode_no}`}>
                                        <h5 className="epi-name text-white mb-0">{nextEpisode.title}</h5>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Container>
                </div>
            )}

            <div className="recommended-block">
                <Container fluid>
                    <div className="overflow-hidden">
                        <div className="d-flex align-items-center justify-content-between px-3 pt-2 my-4">
                            <h5 className="main-title text-capitalize mb-0">More Episodes</h5>
                        </div>
                        <div className="card-style-slider">
                            <Swiper
                                key={String(themeSchemeDirection)}
                                dir={String(themeSchemeDirection)}
                                className="position-relative swiper-card"
                                modules={[Navigation]}
                                loop={false}
                                spaceBetween={5}
                                navigation={{ prevEl: ".swiper-button-prev", nextEl: ".swiper-button-next", }}
                                breakpoints={{ 0: { slidesPerView: 1, }, 576: { slidesPerView: 2, }, 768: { slidesPerView: 3, }, 1025: { slidesPerView: 4, } }}
                            >
                                {otherEpisodes.map((item: Episode, index: number) => (
                                    <SwiperSlide key={index}>
                                        <div className="episode-block">
                                            <div className="block-image position-relative">
                                                <Link replace href={`/tv-shows/${seriesSlug}/season/${currentSeason?.season_no}/episode/${item.episode_no}`}>
                                                    <img src={getPbImageUrl(item, item.thumbnail)} alt="showImg" className="img-fluid img-zoom" loading="lazy" />
                                                </Link>
                                                <div className="episode-number">E{item.episode_no}</div>
                                                <div className="episode-play">
                                                    <Link replace href={`/tv-shows/${seriesSlug}/season/${currentSeason?.season_no}/episode/${item.episode_no}`}>
                                                        <i className="fa-solid fa-play"></i>
                                                    </Link>
                                                </div>
                                            </div>
                                            <div className="epi-desc p-3">
                                                <div className="d-flex align-items-center justify-content-between mb-3">
                                                    <span className="border-gredient-left text-white rel-date">{new Date(item.created).toLocaleDateString()}</span>
                                                    <span className="text-primary run-time">{formatTime(item.duration)}</span>
                                                </div>
                                                <Link replace href={`/tv-shows/${seriesSlug}/season/${currentSeason?.season_no}/episode/${item.episode_no}`}>
                                                    <h5 className="epi-name text-white mb-0">{item.title}</h5>
                                                </Link>
                                            </div>
                                        </div>
                                    </SwiperSlide>
                                ))}
                                <div className="swiper-button swiper-button-next"></div>
                                <div className="swiper-button swiper-button-prev"></div>
                            </Swiper>
                        </div>
                    </div>
                </Container>
            </div>
        </Fragment>
    );
});

EpisodePage.displayName = "EpisodePage";

const RQEpisodePage = () => (
    <ClientProvider>
        <EpisodePage />
    </ClientProvider>
);

RQEpisodePage.displayName = "RQEpisodePage";
export default RQEpisodePage;