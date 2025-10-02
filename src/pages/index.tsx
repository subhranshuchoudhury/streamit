import { memo } from "react";

// hero slider
import MovieHeroSlider from "@/components/slider/MovieHeroSlider";

// section
import PopularMovies from "@/components/sections/PopularMovies";
import SpecialsLatestMovies from "@/components/sections/Specials&LatestMovies";
import MoviesRecommendedForYou from "@/components/sections/MoviesRecommendedForYou";

import { useEnterExit } from "@/utilities/usePage";
import Link from "next/link";

// Import the CSS file you will create in the next step

const Movies = memo(() => {
    useEnterExit()
    return (
        <>
            {/* Your existing page content */}
            <div className="main-content">
                <MovieHeroSlider />
                <PopularMovies />
                <SpecialsLatestMovies />
                <MoviesRecommendedForYou />
            </div>

            {/* The new floating buttons container */}
            <div className="floating-buttons-container">
                <Link href={"/extra/pricing-plan"} className="floating-button subscribe-btn">
                    Subscribe
                </Link>
                <button className="floating-button support-btn">
                    Support Chat
                </button>
            </div>
        </>
    );
});

Movies.displayName = "Movies";
export default Movies;