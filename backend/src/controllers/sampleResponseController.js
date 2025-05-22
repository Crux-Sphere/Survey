const Response = require("../models/response");
const SampleResponse = require("../models/sampleResponse");
const Survey = require("../models/survey");
const User = require("../models/user");
const mongoose = require("mongoose");

//helper functions /////////////---------------------------------------------------------------------------------------------------------------
async function getSortedResponses(surveyId) {
  try {
    const responses = await Response.find({ survey_id: surveyId }).sort({
      createdAt: -1,
      name: 1,
    });
    return responses;
  } catch (error) {
    console.error("Error fetching sorted responses:", error);
    throw new Error("Failed to fetch responses");
  }
}

function groupResponses(responses, sampleSize) {
  const groups = [];
  for (let i = 0; i < responses.length; i += sampleSize) {
    groups.push(responses.slice(i, i + sampleSize));
  }
  return groups;
}

function assignToCollector(groups, sampleMethod, index = 0) {
  const sampleResponses = [];
  try {
    groups.forEach((group) => {
      let selectedResponse;

      if (sampleMethod === "random") {
        // Randomly pick a response from the group
        const randomIndex = Math.floor(Math.random() * group.length);
        selectedResponse = group[randomIndex];
      } else if (sampleMethod === "index" && group[index]) {
        // Pick the response at a specific index (default is 0, but admin can choose)
        selectedResponse = group[index];
      }

      if (selectedResponse) {
        sampleResponses.push(selectedResponse);
      }
    });
  } catch (error) {
    console.error("Error assigning responses to collector:", error);
    throw new Error("Failed to assign responses");
  }

  return sampleResponses;
}

async function createSampleResponses(
  surveyId,
  userId,
  sampleResponses,
  groupId,
  samplingMethod,
  samplingSize,
) {
  try {
    const sampleResponseDocs = sampleResponses.map((response) => ({
      survey_id: surveyId,
      user_id: userId, // Survey collector (admin selects this)
      response_id: response._id,
      group_id: groupId,
      sampling_method: samplingMethod, // Add sampling method
      sampling_size: samplingSize, // Add sampling size
    }));

    // Save all sample responses
    await SampleResponse.insertMany(sampleResponseDocs);
  } catch (error) {
    console.error("Error creating sample responses:", error);
    throw new Error("Failed to create sample responses");
  }
}

//main controllers /////////////---------------------------------------------------------------------------------------------------------------

exports.assignResponsesToCollector = async (req, res) => {
  const { surveyId, userId, sampleSize, sampleMethod, index = 0 } = req.body;
  console.log("bopdy is ---->", req.body);

  // Input validation
  if (!surveyId || !userId || !sampleSize || !sampleMethod) {
    return res.status(400).json({
      success: false,
      message:
        "Missing required parameters: surveyId, userId, sampleSize, or sampleMethod",
    });
  }

  try {
    // Step 1: Get sorted responses
    const responses = await getSortedResponses(surveyId);
    if (responses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No responses found for the given survey ID",
      });
    }

    console.log(responses.length, "--->responses found");

    // Step 2: Group responses into the specified sample size
    const groups = groupResponses(responses, Number(sampleSize));
    console.log(groups.length, "--->groups formed");

    console.log("groups", groups);

    // Step 3: Assign responses based on the selected method (random or index)
    const sampleResponses = assignToCollector(groups, sampleMethod, index);

    // Step 4: add sample survey to survey collector's assigned sample surveys field
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (!user.assigned_sample_surveys.includes(surveyId)) {
      user.assigned_sample_surveys.push(surveyId);
    }
    await user.save();

    console.log("sampleResponses", sampleResponses);

    if (sampleResponses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No valid responses found to assign",
      });
    }

    // Step 4: Create sample response records and assign them to the survey collector
    const groupId = `group_${Date.now()}`; // Unique group ID for this batch
    await createSampleResponses(
      surveyId,
      userId,
      sampleResponses,
      groupId,
      sampleMethod, // Pass sampling method
      sampleSize, // Pass sampling size
    );

    return res.status(200).json({
      success: true,
      message: "Sample responses assigned successfully",
    });
  } catch (error) {
    console.error("Error in assigning responses to collector:", error);
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
    });
  }
};

exports.getSampleResponses = async (req, res) => {
  const { surveyId, groupId, userId, page = 1, limit = 10 } = req.query;
  console.log("query is -->", req.query);

  // Validate the surveyId
  if (!surveyId) {
    return res.status(400).json({
      success: false,
      message: "Survey ID is required",
    });
  }

  try {
    // Build the query based on the provided filters
    const filterQuery = { survey_id: surveyId };

    let selectedGroupId = groupId; // Track the groupId to send in the response
    let selectedGroupDetails = null; // To store additional details like sampling method and sample size

    // If no groupId is provided, find the latest groupId for the survey
    if (!groupId) {
      const latestGroup = await SampleResponse.findOne({ survey_id: surveyId })
        .sort({ group_id: -1 }) // Sort to get the latest group
        .select("group_id sampling_method sampling_size user_id") // Fetch additional details
        .populate("user_id"); // Populate user_id to get the collector's name

      if (latestGroup) {
        filterQuery.group_id = latestGroup.group_id;
        selectedGroupId = latestGroup.group_id;
        selectedGroupDetails = {
          sampling_method: latestGroup.sampling_method,
          sample_size: latestGroup.sampling_size,
          collector_name: latestGroup.user_id?.name || "Unknown Collector",
        };
      }
    } else {
      filterQuery.group_id = groupId;

      // Fetch group details if groupId is provided
      const selectedGroup = await SampleResponse.findOne({
        survey_id: surveyId,
        group_id: groupId,
      })
        .select("sampling_method sampling_size user_id")
        .populate("user_id");

      if (selectedGroup) {
        selectedGroupDetails = {
          sampling_method: selectedGroup.sampling_method,
          sample_size: selectedGroup.sampling_size,
          collector_name: selectedGroup.user_id?.name || "Unknown Collector",
        };
      }
    }

    if (userId) {
      filterQuery.user_id = userId;
    }

    // Convert page and limit to integers and calculate skip
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Fetch total count of responses for the filters
    const totalResponses = await SampleResponse.countDocuments(filterQuery);

    // Fetch filtered sample responses with pagination
    const sampleResponses = await SampleResponse.find(filterQuery)
      .populate("response_id") // Populate the response details
      .populate("user_id") // Populate user_id to get the collector's name for each response
      .skip(skip) // Skip records for pagination
      .limit(limitNum); // Limit the number of records

    return res.status(200).json({
      success: true,
      message: "Filtered sample responses fetched successfully",
      data: sampleResponses,
      group_id: selectedGroupId,
      group_details: selectedGroupDetails, // Include sampling method and sample size
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalResponses / limitNum),
        totalResponses,
      },
    });
  } catch (error) {
    console.error("Error filtering sample responses:", error);
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
    });
  }
};

exports.getSampleSurveys = async (req, res) => {
  try {
    console.log("route hitting");
    const {
      name,
      filter = "", // Default filter to an empty string
      page = 1,
      limit = 10,
      sortBy = "name",
      sortOrder = "asc",
      published,
      user_id,
    } = req.query;

    console.log("wuery is -- >",req.query)

    const order = sortOrder === "asc" ? 1 : -1;
    const skip = (page - 1) * limit;
    const sortOptions = {};

    if (sortBy === "name") {
      sortOptions.name = order;
    } else if (sortBy === "createdAt") {
      sortOptions.createdAt = order;
    }

    const searchConditions = [{ sampling: true }];

    if (filter && filter.trim()) {
      searchConditions.push({ name: { $regex: filter, $options: "i" } });
    }

    if (name) {
      searchConditions.push({ name: { $regex: name, $options: "i" } });
    }

    if (
      published !== undefined &&
      published !== "" &&
      published !== "undefined"
    ) {
      // searchConditions.push({ published: published === "true" });
        if(published === "Published"){
          searchConditions.push({ published: true });
        }else if(published === "Unpublished"){
          searchConditions.push({ published: false });
        }
    }

    const findOptions = searchConditions.length > 0 ? { $and: searchConditions } : {};
    console.log("find options are --->", findOptions);
  
    const totalSurveys = await Survey.countDocuments(findOptions);
    const sampleSurveys = await Survey.find(findOptions)
      .skip(skip)
      .limit(Number(limit))
      .sort(sortOptions)
      .collation({ locale: "en", strength: 2 });

    console.log(sampleSurveys);

    if (sampleSurveys.length === 0) {
      return res.status(404).json({ success: false, message: "No surveys found" });
    }

    return res.status(200).json({
      success: true,
      data: sampleSurveys,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalSurveys / limit),
        totalSurveys,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred. Please try again later.",
    });
  }
};

exports.getGroupsWithSurveyCollectors = async (req, res) => {
  const { survey_id, user_id } = req.query; // Assuming survey_id and user_id are passed as query parameters

  if (!survey_id) {
    return res.status(400).json({ message: "Survey ID is required" });
  }

  try {
    const matchStage = {
      survey_id: new mongoose.Types.ObjectId(String(survey_id)), // Match the specified survey_id
    };

    // Include user_id in the match condition if it's provided
    if (user_id) {
      matchStage.user_id = new mongoose.Types.ObjectId(String(user_id));
    }

    const groupsWithCollectors = await SampleResponse.aggregate([
      {
        $match: matchStage,
      },
      {
        $lookup: {
          from: "user99", // Collection name for User99
          localField: "user_id",
          foreignField: "_id",
          as: "survey_collector",
        },
      },
      {
        $unwind: "$survey_collector", // Extract the single collector object
      },
      {
        $group: {
          _id: "$group_id", // Group by group_id
          survey_collector: { $first: "$survey_collector.name" }, // Get the collector's name (adjust the field as needed)
        },
      },
      {
        $project: {
          _id: 0, // Exclude default _id
          group_id: "$_id", // Rename _id to group_id
          survey_collector: 1, // Include only survey_collector
        },
      },
    ]);

    return res.status(200).json({ success: true, data: groupsWithCollectors });
  } catch (error) {
    console.error("Error fetching groups with survey collectors:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

exports.deleteSampling = async (req, res) => {
  const { surveyId, groupId, mode } = req.body;
  try {
    if (mode === "survey") {
      const survey = await Survey.findById(surveyId);
      if (!survey) {
        return res
          .status(404)
          .json({ success: false, message: "Survey not found" });
      }
      survey.sampling = false;
      await survey.save();
      await SampleResponse.deleteMany({ survey_id: surveyId });
      return res
        .status(200)
        .json({ success: true, message: "Sample survey deleted!" });
    } else if (mode === "group") {
      await SampleResponse.deleteMany({
        survey_id: surveyId,
        group_id: groupId,
      });
      return res
        .status(200)
        .json({ success: true, message: "Sample group deleted!" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error });
  }
};

