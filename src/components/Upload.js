import React from "react";
import PropTypes from "prop-types";

const Upload = ({ handleUpload,  onChange }) => {
  return (
      <div>
        <form onSubmit={handleUpload}>
          <label className="btn btn-info">
              Select <input type="file" onChange={onChange} hidden />
          </label>
          <button className="btn btn-success" type="submit">Capture</button>
        </form>
      </div>
  );
};

Upload.propTypes = {
  handleUpload: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired
};

export default Upload;