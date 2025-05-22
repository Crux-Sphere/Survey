const CallRating = require("../models/callRating");
const moment = require("moment");
const mongoose = require("mongoose");
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
  console.log("create call rating");
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
    const userId = req.query.userId;  

    // Filters
    const ratingFilter = req.query.rating; // "positive", "neutral", "negative"
    const dateFilter = req.query.date; // "YYYY-MM-DD"

    console.log("query is -->", req.query);
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
    if(userId){
      matchStage.user_id = new mongoose.Types.ObjectId(String(userId));
    }

    console.log("match stage is -->", matchStage);

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

exports.getUserCallRatings = async (req, res) => {
  try {
    const userId = req.query.userId;
    const mode = req.query.mode || "daily"; // daily, weekly, or monthly
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const callRatings = await CallRating.find({ user_id: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user_id");

    const totalCallRatings = await CallRating.countDocuments({
      user_id: userId,
    });

    // Counting positive, negative, and neutral calls
    const positiveCalls = await CallRating.countDocuments({
      user_id: userId,
      rating: "positive",
    });
    const negativeCalls = await CallRating.countDocuments({
      user_id: userId,
      rating: "negative",
    });
    const neutralCalls = await CallRating.countDocuments({
      user_id: userId,
      rating: "neutral",
    });

    // Datewise stats based on mode
    const dateGroupFormat =
      mode === "monthly" ? "%Y-%m" : mode === "weekly" ? "%Y-%U" : "%Y-%m-%d";

    const datewiseStats = await CallRating.aggregate([
      { $match: { user_id: new mongoose.Types.ObjectId(String(userId)) } },
      {
        $group: {
          _id: {
            $dateToString: { format: dateGroupFormat, date: "$createdAt" },
          },
          positive: {
            $sum: { $cond: [{ $eq: ["$rating", "positive"] }, 1, 0] },
          },
          negative: {
            $sum: { $cond: [{ $eq: ["$rating", "negative"] }, 1, 0] },
          },
          neutral: { $sum: { $cond: [{ $eq: ["$rating", "neutral"] }, 1, 0] } },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        callRatings,
        totalCallRatings,
        positiveCalls,
        negativeCalls,
        neutralCalls,
        datewiseStats,
      },
      currentPage: page,
      totalPages: Math.ceil(totalCallRatings / limit),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error retrieving Call Ratings",
      error: err.message,
    });
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
