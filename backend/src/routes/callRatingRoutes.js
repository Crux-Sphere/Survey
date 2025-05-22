const express = require("express");
const router = express.Router();
const callRatingController = require("../controllers/callRatingController")

router.post("/create",callRatingController.createCallRating)
router.post("/update",callRatingController.updateCallRating)
router.get("/call-rating",callRatingController.getCallRatingById)
router.get("/call-ratings",callRatingController.getAllCallRatings)
router.get("/dashboard",callRatingController.getDashboardData)
router.get("/userPerformance",callRatingController.getUserCallRatings)

module.exports = router;
