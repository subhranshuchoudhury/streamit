import { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper";
import "swiper/css";
import "swiper/css/navigation";

import CardStyle from "../cards/CardStyle";
import pb from "@/lib/pocketbase";
import { MovieType } from "@/types/pb.types";

// Fetch movies from PocketBase
const fetchMovies = async () => {
  try {
    const records = await pb.collection("movies").getFullList<MovieType>(200);
    return records;
  } catch (err) {
    console.error("Error fetching movies:", err);
    return [];
  }
};

const MoviesRecommendedForYou = memo(() => {
  const { data: movies, isLoading, isError } = useQuery({
    queryKey: ["moviesRecommended"],
    queryFn: fetchMovies,
  });

  if (isLoading) return <p>Loading recommended movies...</p>;
  if (isError) return <p>Failed to load recommended movies.</p>;
  if (!movies || movies.length === 0) return <p>No movies found.</p>;

  return (
    <div
      className="recommended-block"
      style={{
        margin: "2rem 0",
        padding: "1.5rem",
      }}
    >
      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: 600,
          marginBottom: "1rem",
          padding: "0.5rem 1rem",
        }}
      >
        Movies Recommended For You
      </h2>

      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={20}
        slidesPerView={4}
        breakpoints={{
          0: { slidesPerView: 1 },
          576: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
          1400: { slidesPerView: 6 },
        }}
        style={{
          padding: "1rem 0",
        }}
      >
        {movies.map((movie) => (
          <SwiperSlide key={movie.id} style={{ padding: "0.5rem" }}>
            <CardStyle
              image={
                movie.thumbnail
                  ? `${pb.baseURL}/api/files/${movie.collectionId}/${movie.id}/${movie.thumbnail}`
                  : "/placeholder.png"
              }
              title={movie.title}
              movieTime={movie.duration ? String(movie.duration) : "0"}
              watchlistLink="/play-list"
              link={`/movies/detail?id=${movie.id}`}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
});

MoviesRecommendedForYou.displayName = "MoviesRecommendedForYou";

export default MoviesRecommendedForYou;
