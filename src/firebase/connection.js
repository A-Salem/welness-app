import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

import { config } from "../config";

let {
  FIREBASE_APP_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGEBUCKET,
  FIREBASE_MESSAGING_SENDEDR_ID,
  FIREBASE_APP_ID
} = config;

const firebaseConfig = {
  apiKey: FIREBASE_APP_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGEBUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDEDR_ID,
  appId: FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

async function getVideos() {
  const videosCollectionRef = collection(db, "videos");
  let data = await getDocs(videosCollectionRef);
  data = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
  return data.sort((firstVideo, secondVideo) => secondVideo.timestamp - firstVideo.timestamp);
}

function upload(uploadArgs) {
  const {video, thumbnail, setUploadPercentage, setVideos, setVideoPreview} = uploadArgs;
  const storage = getStorage();
  const videosStorageRef = ref(storage, `videos/${video.name}`);
  const imagesStorageRef = ref(storage, `thumbnails/${thumbnail.name}`);
  let thumbnailURL;

  // upload thumbnail
  const thumbnailUploadTask = uploadBytesResumable(imagesStorageRef, thumbnail);

  // upload video
  const videoUploadTask = uploadBytesResumable(videosStorageRef, video);


  videoUploadTask.on("state_changed",
    (snapshot) => {
      let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log("Upload is " + progress + "% done");
      setUploadPercentage(parseInt(progress));
      switch (snapshot.state) {
        case "paused":
          console.log("Upload is paused");
          break;
        case "running":
          console.log("Upload is running");
          break;
        default:
          break;
      }
    },
    (error) => {
      alert("Upload failed!, try again later");
      console.log("Upload failed!, try again later");
    },
    () => {
      getDownloadURL(videoUploadTask.snapshot.ref).then(async (videoURL) => {
        console.log("Video available at", videoURL);
        saveUploadInfo(videoURL, thumbnailURL);
        setUploadPercentage(0);
        setVideos(await getVideos());
        setVideoPreview("");
      });
    }
  );

  thumbnailUploadTask.on("state_changed",
      (snapshot) => {},
      (error) => {
        alert("Uploading the thumbnail failed!");
        console.log("Uploading the thumbnail failed!");
      },
      () => {
        getDownloadURL(thumbnailUploadTask.snapshot.ref).then((thumbnailDownloadURL) => {
          console.log("Thumbnail available at", thumbnailDownloadURL);
          thumbnailURL = thumbnailDownloadURL;
        });
      }
  );
};

function saveUploadInfo(videoURL, thumbnailURL) {
  const videosCollectionRef = collection(db, "videos");

  addDoc(videosCollectionRef, {
    id: uuidv4(),
    thumbUrl: thumbnailURL,
    videoUrl: videoURL,
    timestamp: new Date().getTime()
  });
}

export { getVideos, upload };