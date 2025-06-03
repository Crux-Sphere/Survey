const moment = require("moment");
const CallRating = require("../../models/callRating");
const User = require("../../models/user");
const Role = require("../../models/role");

const mongoose = require("mongoose");

const getKaryakartaMatchCondition = async (isKaryakarta) => {
  if (!isKaryakarta) return [];

  const karyakartaRoles = await Role.find({ category: "karyakarta" });
  const karyakartaRoleIds = karyakartaRoles.map(role => role._id);
  const users = await User.find({ role: { $in: karyakartaRoleIds } });
  const userIds = users.map(user => new mongoose.Types.ObjectId(user._id));

  return [{ $match: { user_id: { $in: userIds } } }];
};


exports.getTotalCallRatings = async ({ isKaryakarta = false } = {}) => {
  const aggregation = [{ $count: "totalRatings" }];

  if (isKaryakarta) {
    const karyakartaRoles = await Role.find({ category: "karyakarta" });
    const karyakartaRoleIds = karyakartaRoles.map(role => role._id);
    const users = await User.find({ role: { $in: karyakartaRoleIds } });
    const userIds = users.map(user => new mongoose.Types.ObjectId(user._id));
    aggregation.unshift({
      $match: {
        user_id: { $in: userIds }
      }
    });
  }

  return await CallRating.aggregate(aggregation);
};


// Helper function to get Recent Call Ratings (last 5 ratings)
exports.getRecentCallRatings = async ({ isKaryakarta = false } = {}) => {
  const matchStage = await getKaryakartaMatchCondition(isKaryakarta);

  const aggregation = [
    ...matchStage,
    { $sort: { createdAt: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "user99",
        localField: "user_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
  ];

  return await CallRating.aggregate(aggregation);
};

// Helper function to get Rating Count (Good, Bad, Great)
exports.getRatingCount = async ({ isKaryakarta = false } = {}) => {
  const matchStage = await getKaryakartaMatchCondition(isKaryakarta);

  const aggregation = [
    ...matchStage,
    {
      $group: {
        _id: "$rating",
        count: { $sum: 1 },
      },
    },
  ];

  return await CallRating.aggregate(aggregation);
};


exports.overallDailyRatingCount = async ({ isKaryakarta = false } = {}) => {
  const matchStage = await getKaryakartaMatchCondition(isKaryakarta);

  const aggregation = [
    ...matchStage,
    {
      $match: {
        createdAt: {
          $gte: moment().subtract(7, "days").startOf("day").toDate(),
          $lte: moment().endOf("day").toDate(),
        },
      },
    },
    {
      $project: {
        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      },
    },
    {
      $group: {
        _id: "$date",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
  ];

  return await CallRating.aggregate(aggregation);
};

exports.overallWeeklyRatingCount = async ({ isKaryakarta = false } = {}) => {
  const matchStage = await getKaryakartaMatchCondition(isKaryakarta);

  return await CallRating.aggregate([
    ...matchStage,
    {
      $match: {
        createdAt: {
          $gte: moment().subtract(5, "weeks").startOf("week").toDate(),
          $lte: moment().endOf("week").toDate(),
        },
      },
    },
    {
      $project: {
        week: { $isoWeek: "$createdAt" },
      },
    },
    {
      $group: {
        _id: "$week",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
  ]);
};

// overall monthly rating count
exports.overallMonthlyRatingCount = async ({ isKaryakarta = false } = {}) => {
  const matchStage = await getKaryakartaMatchCondition(isKaryakarta);

  return await CallRating.aggregate([
    ...matchStage,
    {
      $match: {
        createdAt: {
          $gte: moment().subtract(6, "months").startOf("month").toDate(),
          $lte: moment().endOf("month").toDate(),
        },
      },
    },
    {
      $project: {
        month: { $month: "$createdAt" },
        year: { $year: "$createdAt" },
      },
    },
    {
      $group: {
        _id: { month: "$month", year: "$year" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
  ]);
};

// getGoodDailyRatingCount
exports.getGoodDailyRatingCount = async ({ isKaryakarta = false } = {}) => {
  const matchStage = await getKaryakartaMatchCondition(isKaryakarta);

  return await CallRating.aggregate([
    ...matchStage,
    { $match: { rating: "positive" } },
    {
      $match: {
        createdAt: {
          $gte: moment().subtract(7, "days").startOf("day").toDate(),
          $lte: moment().endOf("day").toDate(),
        },
      },
    },
    {
      $project: {
        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      },
    },
    {
      $group: {
        _id: "$date",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
  ]);
};

// getGoodWeeklyRatingCount
exports.getGoodWeeklyRatingCount = async ({ isKaryakarta = false } = {}) => {
  const matchStage = await getKaryakartaMatchCondition(isKaryakarta);

  return await CallRating.aggregate([
    ...matchStage,
    { $match: { rating: "positive" } },
    {
      $match: {
        createdAt: {
          $gte: moment().subtract(5, "weeks").startOf("week").toDate(),
          $lte: moment().endOf("week").toDate(),
        },
      },
    },
    {
      $project: {
        week: { $isoWeek: "$createdAt" },
      },
    },
    {
      $group: {
        _id: "$week",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
  ]);
};

// getGoodMonthlyRatingCount
exports.getGoodMonthlyRatingCount = async ({ isKaryakarta = false } = {}) => {
  const matchStage = await getKaryakartaMatchCondition(isKaryakarta);

  return await CallRating.aggregate([
    ...matchStage,
    { $match: { rating: "positive" } },
    {
      $match: {
        createdAt: {
          $gte: moment().subtract(6, "months").startOf("month").toDate(),
          $lte: moment().endOf("month").toDate(),
        },
      },
    },
    {
      $project: {
        month: { $month: "$createdAt" },
        year: { $year: "$createdAt" },
      },
    },
    {
      $group: {
        _id: { month: "$month", year: "$year" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
  ]);
};

// getBadDailyRatingCount
exports.getBadDailyRatingCount = async ({ isKaryakarta = false } = {}) => {
  const matchStage = await getKaryakartaMatchCondition(isKaryakarta);

  return await CallRating.aggregate([
    ...matchStage,
    { $match: { rating: "negative" } },
    {
      $match: {
        createdAt: {
          $gte: moment().subtract(7, "days").startOf("day").toDate(),
          $lte: moment().endOf("day").toDate(),
        },
      },
    },
    {
      $project: {
        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      },
    },
    {
      $group: {
        _id: "$date",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
  ]);
};

// getBadWeeklyRatingCount
exports.getBadWeeklyRatingCount = async ({ isKaryakarta = false } = {}) => {
  const matchStage = await getKaryakartaMatchCondition(isKaryakarta);

  return await CallRating.aggregate([
    ...matchStage,
    { $match: { rating: "negative" } },
    {
      $match: {
        createdAt: {
          $gte: moment().subtract(5, "weeks").startOf("week").toDate(),
          $lte: moment().endOf("week").toDate(),
        },
      },
    },
    {
      $project: {
        week: { $isoWeek: "$createdAt" },
      },
    },
    {
      $group: {
        _id: "$week",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
  ]);
};

// getBadMonthlyRatingCount
exports.getBadMonthlyRatingCount = async ({ isKaryakarta = false } = {}) => {
  const matchStage = await getKaryakartaMatchCondition(isKaryakarta);

  return await CallRating.aggregate([
    ...matchStage,
    { $match: { rating: "negative" } },
    {
      $match: {
        createdAt: {
          $gte: moment().subtract(6, "months").startOf("month").toDate(),
          $lte: moment().endOf("month").toDate(),
        },
      },
    },
    {
      $project: {
        month: { $month: "$createdAt" },
        year: { $year: "$createdAt" },
      },
    },
    {
      $group: {
        _id: { month: "$month", year: "$year" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
  ]);
};

// getGreatDailyRatingCount
exports.getGreatDailyRatingCount = async ({ isKaryakarta = false } = {}) => {
  const matchStage = await getKaryakartaMatchCondition(isKaryakarta);

  return await CallRating.aggregate([
    ...matchStage,
    { $match: { rating: "neutral" } },
    {
      $match: {
        createdAt: {
          $gte: moment().subtract(7, "days").startOf("day").toDate(),
          $lte: moment().endOf("day").toDate(),
        },
      },
    },
    {
      $project: {
        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      },
    },
    {
      $group: {
        _id: "$date",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
  ]);
};

// getGreatWeeklyRatingCount
exports.getGreatWeeklyRatingCount = async ({ isKaryakarta = false } = {}) => {
  const matchStage = await getKaryakartaMatchCondition(isKaryakarta);

  return await CallRating.aggregate([
    ...matchStage,
    { $match: { rating: "neutral" } },
    {
      $match: {
        createdAt: {
          $gte: moment().subtract(5, "weeks").startOf("week").toDate(),
          $lte: moment().endOf("week").toDate(),
        },
      },
    },
    {
      $project: {
        week: { $isoWeek: "$createdAt" },
      },
    },
    {
      $group: {
        _id: "$week",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
  ]);
};

// getGreatMonthlyRatingCount
exports.getGreatMonthlyRatingCount = async ({ isKaryakarta = false } = {}) => {
  const matchStage = await getKaryakartaMatchCondition(isKaryakarta);

  return await CallRating.aggregate([
    ...matchStage,
    { $match: { rating: "neutral" } },
    {
      $match: {
        createdAt: {
          $gte: moment().subtract(6, "months").startOf("month").toDate(),
          $lte: moment().endOf("month").toDate(),
        },
      },
    },
    {
      $project: {
        month: { $month: "$createdAt" },
        year: { $year: "$createdAt" },
      },
    },
    {
      $group: {
        _id: { month: "$month", year: "$year" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
  ]);
};

  
