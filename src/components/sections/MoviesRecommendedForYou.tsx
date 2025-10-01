import { useState, Fragment, memo } from "react";

//components
import SectionSlider from "../slider/SectionSlider";
import CardStyle from "../cards/CardStyle";

//static data
import { recommendedforYou } from "../../StaticData/data";

const MoviesRecommendedForYou = memo(()=>  {
  const [title] = useState("Movies Recommended For You");

  return (
    <Fragment>
      <SectionSlider
        title={title}
        list={recommendedforYou}
        className="popular-movies-block streamit-block"
        slidesPerView={6}
      >
        {(data) => (
          <CardStyle
            image={data.image}
            title={data.title}
            movieTime={data.movieTime}
            watchlistLink="/play-list"
            link={`/${data.type}/${data.slug}`}
          />
        )}
      </SectionSlider>
    </Fragment>
  );
})

MoviesRecommendedForYou.displayName = 'MoviesRecommendedForYou';
export default MoviesRecommendedForYou;
