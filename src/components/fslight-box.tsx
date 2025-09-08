import React, { memo, Fragment, useState } from "react";

// // react-bootstrap
import { Col } from "react-bootstrap";

// Next-Link
import Link from 'next/link'

//react fslight-box
import FsLightbox from "fslightbox-react";

interface Props {
  image: string,
  sources?: string[]
}
const FsLightBox = memo((props: Props) => {
  const [toggler, setToggler] = useState(false);
  return (
    <Fragment>
      <Col
        onClick={() => setToggler(!toggler)}
        md="3"
        className="trailor-video  col-12 mt-lg-0 mt-4 mb-md-0 mb-1 text-lg-right"
      >
        <Link
          href="#"
          className="video-open playbtn block-images position-relative playbtn_thumbnail"
        >
          <img
            src={props.image}
            className="attachment-medium-large size-medium-large wp-post-image"
            alt=""
            loading="lazy"
          />
          <span className="content btn btn-transparant iq-button">
            <i className="fa fa-play me-2 text-white"></i>
            <span>Watch Trailer</span>
          </span>
        </Link>
      </Col>
      <>
        {/* @ts-ignore */}
        <FsLightbox
          maxYoutubeVideoDimensions={{ width: 700, height: 400 }}
          exitFullscreenOnClose={true}
          toggler={toggler}
          sources={props.sources}
        />
      </>
    </Fragment>
  );
});
FsLightBox.displayName = "FsLightBox";
export default FsLightBox;
