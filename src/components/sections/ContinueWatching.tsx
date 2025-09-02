import { FC, Fragment, memo, useState } from "react";

// Component
import SectionSlider from "../slider/SectionSlider";
import ContinueWatchCard from "../cards/ContinueWatchCard";

// Function
import { generateImgPath } from "../../StaticData/data";

// Import JSON directly
import continueWatchingData from "../../data/continueWatching.json";

const ContinueWatching: FC = memo(() => {
  const [title] = useState("Continue Watching");

  // Format data once
  const watching = continueWatchingData.map((item) => ({
    ...item,
    image: generateImgPath(item.image),
  }));

  return (
    <Fragment>
      <SectionSlider
        title={title}
        list={watching}
        className="continue-watching-block section-padding-top"
        slidesPerView={5}
      >
        {(data) => (
          <ContinueWatchCard
            imagePath={data.image}
            progressValue={data.value}
            dataLeftTime={data.leftTime}
            link="/movies/detail"
          />
        )}
      </SectionSlider>
    </Fragment>
  );
});

ContinueWatching.displayName = "ContinueWatching";
export default ContinueWatching;
