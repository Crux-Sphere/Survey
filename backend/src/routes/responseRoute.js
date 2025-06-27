const express = require("express");
const router = express.Router();
const responseController = require("../controllers/responseController");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");

const s3 = new S3Client({
  endpoint: process.env.ENDPOINT,
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
});



// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     if (req.path === "/saveCallRecording") {
//       cb(null, "./call_recordings/");
//     } else {
//       cb(null, "./uploads/");
//     }
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   },
// });

const storage = multerS3({
  s3: s3,
  bucket: process.env.BUCKET,
  acl: "public-read",
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: function (req, file, cb) {
    let folder = "uploads/"; // Default folder

    if (req.path === "/saveCallRecording") {
      folder = "call_recordings/";
    }

    // Generate a unique file name
    cb(null, `${folder}${Date.now()}-${file.originalname}`);
  },
});

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 200 * 1024 * 1024 }, // 200MB file size limit
// });
const upload = multer({ 
  storage: storage
 });



router.post(
  "/saveResponse",
  // upload.single("audio"),
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "audio", maxCount: 1 },
  ]),
  responseController.saveResponse
);

router.post(
  "/saveCallRecording",
  upload.single("audio"),
  responseController.saveCallRecording
);

router.get("/getAllResponses", responseController.getAllResponses);
router.get("/getResponse", responseController.getResponse);
//
router.get("/downloadVoter", responseController.downloadVoter);

router.post("/saveResponses", responseController.saveResponses);
router.get("/getCount", responseController.getCount);
router.get("/getAllSurveyResponses", responseController.getSurveyResponses);
router.get(
  "/getSurveyResponseStats",
  responseController.getSurveyResponseStats,
);
router.get("/getMediaResource", responseController.getMediaResource);
router.get(
  "/getGroupedByFamily",
  responseController.getResponsesGroupedByFamily,
);
router.post("/updateResponse", 
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "audio", maxCount: 1 },
  ]),
  responseController.updateResponse
);

router.post("/markAsContacted", responseController.markAsContacted);
router.post("/saveVoteStatus", responseController.saveVoteStatus);
router.post("/saveContactedStatus", responseController.saveContactedStatus);
router.post("/saveRemark", responseController.saveRemark);
router.post("/saveQualityRemark", responseController.saveQualityRemark);
router.post("/checkPhone", responseController.checkPhoneNo);

module.exports = router;
