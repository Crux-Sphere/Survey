const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/getUser", userController.getUser);
router.get("/getAllUsers", userController.getAllUsers);
router.post("/addUsers", userController.addUsers);
router.post("/addMultipleUsers", userController.addMultipleUsers);
router.post("/updateUser", userController.updateUser);
router.post("/updateUsers", userController.updateUsers);
router.post("/uploadProfilePicture", userController.uploadProfilePicture);
router.get("/getSupervisorCollectors", userController.getSupervisorCollectors);
router.post("/assignBooth", userController.assignBoothToUsers);
router.get("/getAssignedBooth", userController.getAssignedAcBooths);

// karyakarta
router.post(
  "/importKaryakartas",
  upload.single("file"),
  userController.importKaryakartas,
);
router.post("/createKaryakarta", userController.createKaryakarta);
router.post("/updateKaryakarta", userController.updateKaryakarta);
router.get("/getAllKaryakarta", userController.getAllKaryakarta);
router.get("/getKaryakarta", userController.getKaryakarta);
router.get("/getPannaPramukh", userController.getPannaPramukh);
router.get("/getBoothAdhyaksh", userController.getBoothAdhyaksh);
router.get("/karyakarta-dashboard", userController.getKaryakartaDashboard);
router.post(
  "/updateMultipleKaryakarta",
  userController.updateMultipleKaryakarta,
);
router.post("/getUsersByAcList", userController.getUsersByAcList);


// notification settings
router.post("/saveToken", userController.saveToken);
router.get("/assignedSamplingSurveys", userController.getUserSamplingSurveys);
router.get("/getUsersWorkData", userController.getUsersWorkData);
router.get("/downloadWorkData", userController.downloadWorkData);

module.exports = router;
