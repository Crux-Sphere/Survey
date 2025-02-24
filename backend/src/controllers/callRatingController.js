const CallRating = require("../models/callRating");
const moment = require("moment");
const {
  getBadDailyRatingCount,
  getBadMonthlyRatingCount,
  getBadWeeklyRatingCount,
  getGoodDailyRatingCount,
  getGoodMonthlyRatingCount,
  getGoodWeeklyRatingCount,
  getGreatDailyRatingCount,
  getGreatMonthlyRatingCount,
  getGreatWeeklyRatingCount,
  getRatingCount,
  getRecentCallRatings,
  getTotalCallRatings,
  overallDailyRatingCount,
  overallMonthlyRatingCount,
  overallWeeklyRatingCount,
} = require("../utils/helper/call-rating");

// Create a new CallRating
exports.createCallRating = async (req, res) => {
  console.log('create call rating');
  try {
    const { user_id, response_id, rating, comment } = req.body;
    const newCallRating = new CallRating({
      user_id,
      response_id,
      rating,
      comment,
    });
    await newCallRating.save();
    res.status(201).json({
      success: true,
      message: "Call Rating created successfully",
      data: newCallRating,
    });
  } catch (err) {
    res.status(500).json({
      success: true,
      message: "Error creating Call Rating",
      error: err.message,
    });
  }
};

exports.getAllCallRatings = async (req, res) => {
  try {
    console.log("Hitting all call ratings");

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filters
    const ratingFilter = req.query.rating; // "positive", "neutral", "negative"
    const dateFilter = req.query.date; // "YYYY-MM-DD"

    console.log("query is -->",req.query)
    let matchStage = {}; // Default filter

    // Apply rating filter
    if (ratingFilter) {
      matchStage.rating = ratingFilter;
    }

    // Apply date filter (only match documents from selected date)
    if (dateFilter) {
      const startOfDay = new Date(dateFilter);
      startOfDay.setUTCHours(0, 0, 0, 0); // Ensure UTC midnight
    
      const endOfDay = new Date(startOfDay);
      endOfDay.setUTCHours(23, 59, 59, 999); // End of UTC day
    
      matchStage.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    console.log("match stage is -->",matchStage)

    // Aggregation Pipeline
    const callRatings = await CallRating.aggregate([
      { $match: matchStage }, // Apply filters
      { $sort: { createdAt: -1 } }, // Sort by latest
      { $skip: skip }, // Pagination skip
      { $limit: limit }, // Limit results
      {
        $lookup: {
          from: "user99",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    ]);

    // Get total count after filtering
    const totalCallRatings = await CallRating.countDocuments(matchStage);
    const totalPages = Math.ceil(totalCallRatings / limit);

    res.status(200).json({
      success: true,
      data: callRatings,
      totalCallRatings,
      currentPage: page,
      totalPages,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error retrieving Call Ratings",
      error: err.message,
    });
  }
};


// Read a single CallRating by ID
exports.getCallRatingById = async (req, res) => {
  try {
    const callRating = await CallRating.findById(req.query.id).exec();

    if (!callRating) {
      return res
        .status(404)
        .json({ success: true, message: "Call Rating not found" });
    }

    res.status(200).json({
      success: true,
      data: callRating,
    });
  } catch (err) {
    res.status(500).json({
      success: true,
      message: "Error retrieving Call Rating",
      error: err.message,
    });
  }
};

// Update a CallRating by ID
exports.updateCallRating = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const updatedCallRating = await CallRating.findByIdAndUpdate(
      req.params.id,
      { rating, comment },
      { new: true } // Return the updated document
    );

    if (!updatedCallRating) {
      return res.status(404).json({ message: "Call Rating not found" });
    }

    res.status(200).json({
      message: "Call Rating updated successfully",
      data: updatedCallRating,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating Call Rating", error: err.message });
  }
};

// Delete a CallRating by ID
exports.deleteCallRating = async (req, res) => {
  try {
    const deletedCallRating = await CallRating.findByIdAndDelete(req.query.id);

    if (!deletedCallRating) {
      return res.status(404).json({ message: "Call Rating not found" });
    }

    res.status(200).json({ message: "Call Rating deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting Call Rating", error: err.message });
  }
};


exports.getDashboardData = async (req, res) => {
  try {
    // Total Call Ratings Pipeline
    const totalCallRatingsData = await getRatingCount();
    const recentCallRatingsData = await getRecentCallRatings();
    const totalRatingCountData = await getTotalCallRatings();
    const dailyOverallRatingData = await overallDailyRatingCount();
    const weeklyOverallRatingData = await overallWeeklyRatingCount();
    const monthlyOverallRatingData = await overallMonthlyRatingCount();
    const dailyPositiveRatingData = await getGoodDailyRatingCount();
    const weeklyPositiveRatingData = await getGoodWeeklyRatingCount();
    const monthlyPositiveRatingData = await getGoodMonthlyRatingCount();
    const dailyNegativeRatingData = await getBadDailyRatingCount();
    const weeklyNegativeRatingData = await getBadWeeklyRatingCount();
    const monthlyNegativeRatingData = await getBadMonthlyRatingCount();
    const dailyNeutralRatingData = await getGreatDailyRatingCount();
    const weeklyNeutralRatingData = await getGreatWeeklyRatingCount();
    const monthlyNeutralRatingData = await getGreatMonthlyRatingCount();

    // Return the aggregated data in one response
    return res.status(200).json({
      success: true,
      data: {
        totalCallRatings: totalCallRatingsData,
        recentCallRatings: recentCallRatingsData,
        ratingCount: totalRatingCountData,
        overallDailyRatingCount: dailyOverallRatingData,
        overallWeeklyRatingCount: weeklyOverallRatingData,
        overallMonthlyRatingCount: monthlyOverallRatingData,
        positiveDailyRatingCount: dailyPositiveRatingData,
        positiveWeeklyRatingCount: weeklyPositiveRatingData,
        positiveMonthlyRatingCount: monthlyPositiveRatingData,
        negativeDailyRatingCount: dailyNegativeRatingData,
        negativeWeeklyRatingCount: weeklyNegativeRatingData,
        negativeMonthlyRatingCount: monthlyNegativeRatingData,
        neutralDailyRatingCount: dailyNeutralRatingData,
        neutralWeeklyRatingCount: weeklyNeutralRatingData,
        neutralMonthlyRatingCount: monthlyNeutralRatingData,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

// exports.getCallRatings = async (req, res) => {
//   try {
//     //adding pagination
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 10;
//     const skip = (page - 1) * limit;
    
//     const callRatings = await CallRating.find().limit(limit).skip(skip).exec();

//     res.status(200).json({
//       success: true,
//       data: callRatings,
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: true,
//       message: "Error retrieving Call Ratings",
//       error: err.message,
//     });
//   }
// }

