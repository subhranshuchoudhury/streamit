import React, { Fragment, memo, useEffect, useState } from "react";

//react-bootstrap
import { Row, Col, Container, Nav, Tab, Form } from "react-bootstrap";

// Next-Link
import Link from 'next/link'

//components
import ReviewComponent from "@/components/ReviewComponent";
import { Swiper, SwiperSlide } from "swiper/react";
import RatingStar from "@/components/rating-star";

//function
import { generateImgPath } from "@/StaticData/data"; // Assuming this is a local utility

//utilities
import { useEnterExit } from "@/utilities/usePage";

//swiper
import { Navigation } from "swiper";
import pb from "@/lib/pocketbase";
import { ClientProvider } from "@/providers/client.provider";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { Season, TVShow } from "@/types/pb.types";
import { formatTime } from "@/helper/ms-to-hm";

// Helper to get correct PocketBase file URL
const getPbImageUrl = (
    record: { collectionId: string, id: string },
    filename: string
) => {
    if (!record || !filename) return '';
    return `${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/${record.collectionId}/${record.id}/${filename}`;
};


const ShowsDetailPage = () => {

    const router = useRouter();
    const { slug } = router.query;

    // State to manage the selected season
    const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);

    useEnterExit();

    const getSeries = async (slug: string) => {
        if (!slug) return;
        try {
            // Use the correct type `TVShow` for a single record
            const response = await pb.collection('tv_shows').getFirstListItem<TVShow>(`slug="${slug}"`, {
                expand: "seasons,seasons.episodes"
            });
            return response;
        } catch (error) {
            console.error("Error fetching series data:", error);
            throw new Error('Failed to fetch TV Show');
        }
    };

    const {
        data: show, // Renamed to `show` for clarity
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["series", slug],
        queryFn: () => getSeries(String(slug)),
        enabled: !!slug, // Query runs only when slug is available
    });

    // Effect to set the initial season once data is loaded
    useEffect(() => {
        if (show && show?.expand?.seasons?.length > 0) {
            setSelectedSeason(show.expand.seasons[0]);
        }
    }, [show]);

    // Handle loading and error states
    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>Error fetching data. Please try again.</div>;
    if (!show) return <div>Show not found.</div>;

    const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const seasonId = e.target.value;
        const season = show.expand.seasons.find(s => s.id === seasonId) || null;
        setSelectedSeason(season);
    };

    const episodesToDisplay = selectedSeason?.expand?.episodes || [];


    return (
        <Fragment>
            <div className="tv-show-detail">
                <Container fluid>
                    <div
                        className="overlay-wrapper iq-main-slider "
                        style={{
                            background: `url(${getPbImageUrl(show, show.thumbnail)})`,
                            backgroundSize: "cover",
                            backgroundRepeat: "no-repeat",
                        }}
                    >
                        <div className="banner-caption">
                            <div className="trending-info p-0">
                                <h1 className="texture-text big-font text-uppercase mt-2">
                                    {show.title}
                                </h1>
                                <div className="ratting-start p-0 m-0 list-inline text-warning d-flex align-items-center justify-content-left">
                                    <RatingStar count={Math.floor(show.rating)} count1={show.rating % 1 >= 0.5 ? 1 : 0} starColor="text-warning" />
                                    <span className="text-white ms-4 me-1">{show.rating.toFixed(1)}</span>
                                    <img
                                        src={generateImgPath("/assets/images/movies/imdb-logo.svg")}
                                        alt="imdb-logo"
                                        className="img-fluid ms-2"
                                    />
                                </div>
                                <ul className="p-0 mt-2 list-inline d-flex flex-wrap movie-tag">
                                    {show.genres?.split(',').map((item, index) => (
                                        <li className="trending-list" key={index}>
                                            <Link
                                                href={`/tv-shows/${show.slug}`}
                                                className="text-primary text-uppercase font-size-18"
                                            >
                                                {item.trim()}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                                <div className="d-flex flex-wrap align-items-center gap-3 font-size-20 mb-3 fw-500 text-white">
                                    <span>{show.expand?.seasons?.length} Seasons</span>
                                    <span>{new Date(show.created).getFullYear()}</span>
                                </div>
                                <p className="line-count-2 my-3">{show.detail}</p>
                            </div>
                            <div className="position-relative my-4">
                                <Link
                                    href={`/tv-shows/${show.slug}/season/${selectedSeason?.season_no}/episode/1`}
                                    className="d-flex align-items-center gap-3"
                                >
                                    <div className="play-button">
                                        <i className="fa-solid fa-play"></i>
                                    </div>
                                    <h4 className="text-white fw-bold m-0">
                                        Watch Now S{selectedSeason?.season_no} E1
                                    </h4>
                                </Link>
                            </div>

                            <ul className="iq-blogtag list-unstyled d-flex flex-wrap align-items-center gap-3 p-0">
                                <li className="iq-tag-title text-primary mb-0">
                                    <i className="fa fa-tags" aria-hidden="true"></i> Tags:{" "}
                                </li>
                                {show.tags?.split(',').map((item, index) => (
                                    <li key={index}>
                                        <Link href={`/tv-shows/${show.slug}`} className="title text-capitalize">
                                            {item.trim()}
                                        </Link>
                                        {/* Don't add comma for the last item */}
                                        {index < show.tags.split(',').length - 1 && <span className="text-secondary">,</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </Container>
            </div>
            <div className="show-detail section-padding">
                <Container fluid>
                    <div className="show-movie-section">
                        <div className="iq-custom-select d-inline-block">
                            <Form.Select name="seasonSelect" className="form-select" onChange={handleSeasonChange} value={selectedSeason?.id}>
                                {show.expand?.seasons.map((season) => (
                                    <option key={season.id} value={season.id}>
                                        Season {season.season_no}
                                    </option>
                                ))}
                            </Form.Select>
                        </div>
                    </div>
                    <div className="show-custom-tab">
                        <Tab.Container defaultActiveKey="first">
                            <Nav className="iq-custom-tab tab-bg-fill nav nav-pills text-center list-inline my-4">
                                <Nav.Item>
                                    <Nav.Link eventKey="first">Episodes</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="second">Description</Nav.Link>
                                </Nav.Item>
                                {/* <Nav.Item>
                                    <Nav.Link eventKey="third">Rate & Review</Nav.Link>
                                </Nav.Item> */}
                            </Nav>
                            <Tab.Content>
                                <Tab.Pane className=" fade show" eventKey="first">
                                    <Row className="list-inline p-0 mb-0">
                                        {episodesToDisplay.sort(
                                            (a, b) => a.episode_no - b.episode_no
                                        ).map((item, index) => (
                                            <Col lg={3} sm={12} md={6} key={index}>
                                                <div className="episode-block">
                                                    <div className="block-image position-relative">
                                                        <Link href={
                                                            `/tv-shows/${show.slug}/season/${selectedSeason?.season_no}/episode/${item.episode_no}`
                                                        }>
                                                            <img
                                                                src={getPbImageUrl(item, item.thumbnail)}
                                                                alt="showImg"
                                                                className="img-fluid img-zoom"
                                                                loading="lazy"
                                                            />
                                                        </Link>
                                                        <div className="episode-number">
                                                            S{selectedSeason?.season_no}E{item.episode_no}
                                                        </div>
                                                        <div className="episode-play">
                                                            <Link href={
                                                                `/tv-shows/${show.slug}/season/${selectedSeason?.season_no}/episode/${item.episode_no}`
                                                            }>
                                                                <i className="fa-solid fa-play"></i>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                    <div className="epi-desc p-3">
                                                        <div className="d-flex align-items-center justify-content-between mb-3">
                                                            <span className="border-gredient-left text-white rel-date">
                                                                {new Date(item.created).toLocaleDateString()}
                                                            </span>
                                                            <span className="text-primary run-time">
                                                                {formatTime(item.duration)}
                                                            </span>
                                                        </div>
                                                        <Link href={
                                                            `/tv-shows/${show.slug}/season/${selectedSeason?.season_no}/episode/${item.episode_no}`
                                                        }>
                                                            <h5 className="epi-name text-white mb-0">
                                                                {item.title}
                                                            </h5>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </Col>
                                        ))}
                                    </Row>
                                </Tab.Pane>
                                <Tab.Pane className=" fade" eventKey="second">
                                    <p>{show.detail}</p>
                                </Tab.Pane>
                                {/* <Tab.Pane className=" fade" eventKey="third">
                                    <ReviewComponent />
                                </Tab.Pane> */}
                            </Tab.Content>
                        </Tab.Container>
                    </div>
                </Container>
            </div>
            {/* Cast & Crew Section Removed as it's not in the API response type */}
            {/* If you have cast/crew data, you can add this section back and populate it similarly */}
        </Fragment>
    );
};

ShowsDetailPage.displayName = "ShowsDetailPage";

const RQShowsDetailPage = () => {
    return <ClientProvider>
        <ShowsDetailPage />
    </ClientProvider>
};

RQShowsDetailPage.displayName = "RQShowsDetailPage";
export default RQShowsDetailPage;