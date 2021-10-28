import React from "react";
import PropTypes from "prop-types";

const Videos = ({ videos }) => {
  return (
      <div className="videos">
        {videos.map((video) => {
          return <div key={video.id}>
            <video className="playerDiv" name="media" controls poster={video.thumbUrl}>
              <source className="videoSrc" src={video.videoUrl} />
            </video>
          </div>;
        })}
      </div>
  );
};

Videos.propTypes = {
  videos: PropTypes.array.isRequired
};

export default Videos;