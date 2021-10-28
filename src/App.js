import { useEffect, useState } from "react";
import { getThumbnails } from "video-metadata-thumbnails";

import { getVideos, upload } from "./firebase/connection";
import Progress from "./components/Progress";
import Upload from "./components/Upload";
import Videos from "./components/Videos";

import "./App.css";


function App() {
  const [videos, setVideos] = useState([]);
  const [video, setVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [uploadPercentage, setUploadPercentage] = useState(0);

  useEffect(() => {
    async function listVideos() {
      const vids = await getVideos();
      setVideos(vids);
    };

    listVideos();
  }, []);

  const handleUpload = async (event) => {
    event.preventDefault();
    if (video) {
      const uploadArgs = {video, thumbnail, setUploadPercentage, setVideos, setVideoPreview};
      upload(uploadArgs);
    } else {
      alert("Select video first please");
    }
  };

  const onChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // show the selected video preview
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        setVideoPreview(fileReader.result);
      };
      fileReader.readAsDataURL(file);
      
      // Get a thumbnail from the video
      const thumb = await getThumbnails(file, {
        quality: 1,
        interval: 20
      });
      let image = thumb[0];
      const imgReader = await new FileReader();
      imgReader.onload = (e) => {
        const blob = new Blob([imgReader.result], {
          type: "octet/stream"
        });
        const fileOfBlob = new File([blob], `${file.name.split(".")[0]}Thumbnail`);
        // set the thumbnail in the state to be uploaded once capture BTN is clicked
        setThumbnail(fileOfBlob);
      };
      imgReader.readAsArrayBuffer(image.blob);

      // set the video in the state to be uploaded once capture BTN is clicked
      setVideo(file);
    }
  };

  return <div className="App">
    {/* Progress Bar for showing uploading state */}
    <Progress percentage={uploadPercentage} />

    {/* Upload Form */}
    <Upload handleUpload={handleUpload}  onChange={onChange}/>

    {/* Selected Video Preview */}
    <video name="media" className="playerDiv" autoPlay controls style={{display: videoPreview ? "inline-block" : "none"}} src={videoPreview}></video>

    {/* List of videos */}
    <Videos videos={videos} />

  </div>;
};

export default App;
