const MediaResponse = require("../models/mediaResponse");
const Responses = require("../models/response");
const Family = require("../models/family");
const mongoose = require("mongoose");
const Survey = require("../models/survey");
const { downloadExcel } = require("../utils/utils");
const CallRecordings = require("../models/callrecording");

const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const User = require("../models/user");

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

exports.saveResponse = async (req, res) => {
  console.log("here it works");
  console.log(req.file.path);
  try {
    const {
      survey_id,
      user_id,
      responses,
      media_responses,
      location_data,
      name,
      ac_no,
      booth_no,
      house_no,
      // last_name,
      phone_no,
      family_id,
      save_mode,
    } = req.body;
    parsedResponses = JSON.parse(responses);
    console.log("responses are-->", parsedResponses);
    parsedLocationData = JSON.parse(location_data);
    console.log("location data are-->", parsedLocationData);

    if (media_responses) {
      Object.entries(media_responses).map(([key, value]) => {
        const mediaBuffer = Buffer.from(value.data, "base64");
        const mediaResponse = new MediaResponse({
          userId: user_id,
          surveyId: survey_id,
          type: value.type,
          data: mediaBuffer,
        });
        mediaResponse.save();

        for (let response of responses) {
          if (response.question_id == key) {
            response.response = mediaResponse._id;
          }
        }
      });
    }

    let responseToSave = {
      survey_id,
      user_id,
      responses: parsedResponses,
      location_data: parsedLocationData,
      ac_no,
      booth_no,
      house_no,
      name,
      // last_name,
      phone_no,
    };

    let createdNewFamily = false;
    if (save_mode === "new_family") {
      const alreadyExists = await Family.findOne({
        survey_id,
        ac_no,
        booth_no,
        house_no,
        // last_name,
      });

      console.log("already exists", alreadyExists);

      if (alreadyExists) {
        responseToSave.family_id = alreadyExists._id;
      } else {
        const newFamily = await Family.create({
          survey_id,
          ac_no,
          booth_no,
          house_no,
          // last_name,
        });
        createdNewFamily = true;
        responseToSave.family_id = newFamily._id;
      }
    } else if (family_id) {
      responseToSave.family_id = family_id;
    }
    responseToSave.audio_recording_path = req.file.path;
    const response = new Responses(responseToSave);
    await response.save();

    if (createdNewFamily) {
      await Family.updateOne(
        { _id: responseToSave.family_id },
        { $set: { family_head: response._id } },
      );
    }

    const survey = await Survey.findOneAndUpdate(
      { _id: survey_id },
      {
        $inc: { response_count: 1 },
      },
    );
    if (!survey) {
      return res
        .status(404)
        .json({ success: false, message: "Survey not found" });
    }

    return res
      .status(201)
      .json({ success: true, message: "Response created successfully" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// exports.saveResponses = async (req, res) => {
//   try {
//     const responsesArray = req.body;

//     if (!Array.isArray(responsesArray) || responsesArray.length === 0) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid input data" });
//     }

//     // Save responses
//     await Responses.insertMany(responsesArray);
//     console.dir(responsesArray, { depth: null });

//     // Extract and process family data
//     const familiesToSave = responsesArray.map((response) => {
//       const acNo = response.ac_no || null;
//       const boothNo = response.booth_no || null;
//       const houseNo = response.responses.find(
//         (r) => r.question === "C_HOUSE_NO"
//       )?.response;

//       if (acNo && boothNo && houseNo) {
//         return {
//           survey_id: response.survey_id,
//           ac_no: acNo,
//           booth_no: boothNo,
//           house_no: houseNo,
//         };
//       }
//       return null;
//     });

//     // Remove invalid or duplicate family entries from processing
//     const uniqueFamilies = Array.from(
//       new Map(
//         familiesToSave
//           .filter(Boolean)
//           .map((family) => [
//             `${family.ac_no}-${family.booth_no}-${family.house_no}`,
//             family,
//           ])
//       ).values()
//     );

//     // Save families, ensuring no duplicates
//     for (const family of uniqueFamilies) {
//       const existingFamily = await Family.findOne({
//         survey_id: family.survey_id,
//         ac_no: family.ac_no,
//         booth_no: family.booth_no,
//         house_no: family.house_no,
//       });

//       if (!existingFamily) {
//         await Family.create(family);
//       }
//     }
//     console.log(
//       `${responsesArray.length} responses saved successfully, families processed.`
//     );
//     return res.status(201).json({
//       success: true,
//       message: `${responsesArray.length} responses saved successfully, families processed.`,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(400).json({ success: false, message: error.message });
//   }
// };
exports.saveResponses = async (req, res) => {
  try {
    const responsesArray = req.body;

    if (!Array.isArray(responsesArray) || responsesArray.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid input data" });
    }

    // Cache to store already processed families
    const familyCache = new Map();

    for (const response of responsesArray) {
      const acNo = response.ac_no || null;
      const boothNo = response.booth_no || null;
      const houseNo = response.responses.find(
        (r) => r.question === "C_HOUSE_NO",
      )?.response;

      let familyId = null;

      if (acNo && boothNo && houseNo) {
        const uniqueKey = `${acNo}-${boothNo}-${houseNo}`;

        // Check if the family is already in the cache
        if (familyCache.has(uniqueKey)) {
          familyId = familyCache.get(uniqueKey);
        } else {
          const familyData = {
            survey_id: response.survey_id,
            ac_no: acNo,
            booth_no: boothNo,
            house_no: houseNo,
          };

          // Check if the family exists in the database
          let family = await Family.findOne(familyData);

          if (!family) {
            // Create the family if it doesn't exist
            family = await Family.create(familyData);
          }

          // Cache the family ID
          familyId = family._id;
          familyCache.set(uniqueKey, familyId);
        }
      }

      // Add family_id to the response
      response.family_id = familyId;
    }

    // Save all responses with the family_id field populated
    await Responses.insertMany(responsesArray);

    console.log(
      `${responsesArray.length} responses saved successfully with family IDs.`,
    );
    return res.status(201).json({
      success: true,
      message: `${responsesArray.length} responses saved successfully with family IDs.`,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getCount = async (req, res) => {
  try {
    const surveyId = req.query.surveyId;
    const response = await Responses.find({ surveyId });
    if (!response) {
      return res
        .status(404)
        .json({ success: "false", message: "Response not found" });
    } else {
      return res.status(201).json({ success: "true", data: response.length });
    }
  } catch (error) {
    return res.status(400).json({ success: "false", message: error.message });
  }
};

exports.getAllResponses = async (req, res) => {
  try {
    const {
      download,
      surveyId,
      userId,
      startDate,
      endDate,
      filters,
      statusFilter,
      searchText,
      page = 1,
      limit = 4,
    } = req.query;
    console.log("query is------>", req.query);
    const selectedSurvey = await Survey.findById(surveyId);
    const question_type_map = {};
    selectedSurvey.questions.forEach((surv) => {
      const key = surv.question_id;
      const val = surv.type;
      question_type_map[key] = val;
    });
    console.log("quesyion map ----->", question_type_map);
    const matchStage = {};

    matchStage.survey_id = new mongoose.Types.ObjectId(String(surveyId));

    console.log("statusFilter ---------->", statusFilter);
    if (statusFilter) {
      matchStage.status = statusFilter;
    }

    console.log("user id ---------->", userId);
    if (userId) {
      const userData = await User.findById(userId).populate("role");
      let isNotCollector = false;
      userData.role.forEach((role) => {
        if (
          role.name === "District President" ||
          role.name === "Shakti Kendra"
        ) {
          isNotCollector = true;
        }
      });
      if (isNotCollector) {
        const { ac_list } = userData;
        const filterCriteria = ac_list.flatMap(({ ac_no, booth_numbers }) =>
          booth_numbers.map((booth_no) => ({ ac_no, booth_no })),
        );

        if (filterCriteria.length > 0) {
          matchStage.$or = filterCriteria;
        }
      } else {
        matchStage.user_id = new mongoose.Types.ObjectId(String(userId));
      }
    }

    if (searchText) {
      matchStage.$or = [
        { name: { $regex: searchText, $options: "i" } },
        { ac_no: { $regex: searchText, $options: "i" } },
        { booth_no: { $regex: searchText, $options: "i" } },
        { house_no: { $regex: searchText, $options: "i" } },
      ];
    }

    if (startDate && endDate) {
      // Validate if the dates are valid
      if (isNaN(new Date(startDate)) || isNaN(new Date(endDate))) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid date range." });
      }

      // Convert startDate and endDate to Date objects
      const startUtcDate = new Date(startDate);
      startUtcDate.setUTCHours(0, 0, 0, 0); // Start of the day at 12:00 AM UTC

      const endUtcDate = new Date(endDate);
      endUtcDate.setUTCHours(23, 59, 59, 999); // End of the day at 11:59 PM UTC

      console.log(startUtcDate);
      console.log(endUtcDate);

      // Filter based on createdAt being within the range
      matchStage.createdAt = {
        $gte: startUtcDate,
        $lte: endUtcDate,
      };
    }
    const responseFilters = [];
    console.log("filters are-->", filters);
    if (filters) {
      filters.forEach(({ question, operator, response: answer }) => {
        const filter = {
          question_id: Number(question),
        };
        switch (operator) {
          case "contains":
            filter.response = { $regex: answer, $options: "i" };
            break;
          case "equals":
            filter.response = answer;
            break;
          case "not equals":
            filter.response = { $ne: answer };
            break;
          case "starts with":
            filter.response = { $regex: `^${answer}`, $options: "i" };
            break;
          case "ends with":
            filter.response = { $regex: `${answer}$`, $options: "i" };
            break;
          // case "=":
          //   filter.response = question_type_map[question] === 'Date' ? new Date(answer) : Number(answer);
          //   break;
          case "=":
            if (question_type_map[question] === "Date") {
              const answerDate = new Date(answer);
              const startOfDay = new Date(answerDate);
              startOfDay.setUTCHours(0, 0, 0, 0);
              const endOfDay = new Date(answerDate);
              endOfDay.setUTCHours(23, 59, 59, 999);
              filter.response = { $gte: startOfDay, $lte: endOfDay };
            } else {
              filter.response = Number(answer);
            }
            break;

          case "!=":
            filter.response = { $ne: Number(answer) };
            break;
          case "<":
            filter.response =
              question_type_map[question] === "Date"
                ? { $lt: new Date(answer) }
                : { $lt: Number(answer) };
            break;
          case "<=":
            filter.response =
              question_type_map[question] === "Date"
                ? { $lte: new Date(answer) }
                : { $lt: Number(answer) };
            break;
          case ">":
            filter.response =
              question_type_map[question] === "Date"
                ? { $gt: new Date(answer) }
                : { $gt: Number(answer) };
            break;
          case ">=":
            filter.response =
              question_type_map[question] === "Date"
                ? { $gte: new Date(answer) }
                : { $gte: Number(answer) };
            break;
        }
        responseFilters.push(filter);
      });
    }
    console.log("respons filters: " + JSON.stringify(responseFilters, null, 2));
    if (responseFilters) console.log("respons filters: " + responseFilters[0]);

    const aggregationPipeline = [
      { $match: matchStage },
      { $unwind: "$responses" },
      {
        $project: {
          _id: 1,
          user_id: 1,
          survey_id: 1,
          family_id: 1,
          ac_no: 1,
          booth_no: 1,
          house_no: 1,
          name: 1,
          // last_name: 1,
          location_data: 1,
          createdAt: 1,
          audio_recording_path: 1,
          "responses.question_id": 1,
          "responses.question_type": 1,
          "responses.question": 1,
          "responses.response": {
            $cond: {
              if: {
                $in: [
                  "$responses.question_type",
                  ["Number Input", "Phone Number"],
                ],
              },
              then: {
                $cond: {
                  if: {
                    $regexMatch: {
                      input: { $toString: "$responses.response" },
                      regex: new RegExp(
                        escapeRegex("$responses.response"),
                        "i",
                      ),
                    },
                  },
                  then: { $toDouble: "$responses.response" },
                  else: "$responses.response",
                },
              },
              else: {
                $cond: {
                  if: { $in: ["$responses.question_type", ["Date"]] },
                  then: {
                    $dateFromString: {
                      dateString: "$responses.response",
                      onError: "$responses.response",
                    },
                  },
                  else: "$responses.response",
                },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          user_id: { $first: "$user_id" },
          family_id: { $first: "$family_id" },
          ac_no: { $first: "$ac_no" },
          booth_no: { $first: "$booth_no" },
          house_no: { $first: "$house_no" },
          name: { $first: "$name" },
          // last_name: { $first: "$last_name" },
          location_data: { $first: "$location_data" },
          survey_id: { $first: "$survey_id" },
          createdAt: { $first: "$createdAt" },
          responses: { $push: "$responses" },
          audio_recording_path: { $first: "$audio_recording_path" },
        },
      },
    ];

    responseFilters.forEach((resp) =>
      console.log(resp.question_id, "-->", resp.response),
    );

    // Add additional match stage if there are filters
    if (responseFilters.length > 0) {
      aggregationPipeline.push({
        $match: {
          $and: responseFilters.map((response) => ({
            responses: {
              $elemMatch: {
                question_id: response.question_id,
                response: response.response,
              },
            },
          })),
        },
      });
    }

    // Sorting by createdAt in descending order
    aggregationPipeline.push({ $sort: { createdAt: -1 } });

    // Calculate total responses count
    console.log(JSON.stringify(aggregationPipeline, null, 2));
    const totalResponses = await Responses.aggregate([
      ...aggregationPipeline,
      { $count: "totalResponses" },
    ]);
    const totalCount =
      totalResponses.length > 0 ? totalResponses[0].totalResponses : 0;

    if (download) {
      const filteredResponse = await Responses.aggregate(aggregationPipeline);
      const fin = filteredResponse.map((f) =>
        Responses.findById(f._id)
          .populate("panna_pramukh_assigned")
          .populate("user_id")
          .populate("survey_id"),
      );

      const re = await Promise.all(fin);

      if (!filteredResponse) {
        return res
          .status(404)
          .json({ success: "false", message: "Response not found" });
      }
      await downloadExcel(re, res);
    } else {
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      aggregationPipeline.push({ $skip: skip }, { $limit: limitNum });

      const filteredResponse = await Responses.aggregate(aggregationPipeline);

      const fin = filteredResponse.map((f) =>
        Responses.findById(f._id).populate("panna_pramukh_assigned"),
      );
      const re = await Promise.all(fin);
      // console.log("res-->",re)

      if (!filteredResponse) {
        return res
          .status(404)
          .json({ success: "false", message: "Response not found" });
      } else {
        // Calculate total pages
        const totalPages = Math.ceil(totalCount / limitNum);

        return res.status(200).json({
          success: "true",
          // data: filteredResponse,
          data: re,
          totalResponses: totalCount,
          totalPages: totalPages,
        });
      }
    }
    // Pagination logic
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: "false", message: error.message });
  }
};

exports.getResponse = async (req, res) => {
  try {
    const responseId = req.query.responseId;
    const response = await Responses.findById(responseId);
    if (!response) {
      return res
        .status(404)
        .json({ success: "false", message: "Response not found" });
    } else {
      return res.status(201).json({ success: "true", data: response });
    }
  } catch (error) {
    return res.status(400).json({ success: "false", message: error.message });
  }
};

exports.getResponsesGroupedByFamily = async (req, res) => {
  try {
    const surveyId = req.query.surveyId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const groupedResponses = await Responses.aggregate([
      {
        $match: {
          survey_id: new mongoose.Types.ObjectId(surveyId),
        },
      },
      {
        $group: {
          _id: "$family_id",
          family_id: { $first: "$family_id" },
          survey_id: { $first: "$survey_id" },
          ac_no: { $first: "$ac_no" },
          booth_no: { $first: "$booth_no" },
          // last_name: { $first: "$last_name" },
          createdAt: { $first: "$createdAt" },
          responses: {
            $push: {
              _id: "$_id",
              user_id: "$user_id",
              name: "$name",
              responses: "$responses",
              location_data: "$location_data",
            },
          },
        },
      },
      {
        $unwind: {
          path: "$responses",
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      { $skip: skip },
      { $limit: limit },
    ]);

    const totalItems = await Responses.countDocuments({ survey_id: surveyId });
    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json({
      success: true,
      data: groupedResponses,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: groupedResponses.length,
      },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// exports.getSurveyResponses = async (req, res) => {
//   try {
//     const { search, sortOrder = "desc" } = req.query;
//     console.log("route is hitting --- >")

//     const pipeline = [
//       {
//         $group: {
//           _id: "$survey_id",
//           responseCount: { $sum: 1 },
//           latestResponseCreatedAt: { $max: "$createdAt" },
//         },
//       },
//       {
//         $lookup: {
//           from: "survey99",
//           localField: "_id",
//           foreignField: "_id",
//           as: "surveyDetails",
//         },
//       },
//       {
//         $unwind: "$surveyDetails",
//       },
//       {
//         $project: {
//           _id: 0,
//           survey_id: "$_id",
//           surveyName: "$surveyDetails.name",
//           ac_list:"$surveyDetails.ac_list",
//           responseCount: 1,
//           latestResponseCreatedAt: 1,
//           surveyCreatedAt: "$surveyDetails.createdAt",
//         },
//       },
//     ];

//     if (search) {
//       pipeline.push({
//         $match: {
//           surveyName: { $regex: search, $options: "i" },
//         },
//       });
//     }

//     pipeline.push({
//       $sort: {
//         latestResponseCreatedAt: sortOrder === "asc" ? 1 : -1,
//       },
//     });

//     const results = await Responses.aggregate(pipeline);
//     console.log("results are ----->",results);

//     return res.status(200).json({
//       success: true,
//       message: "Responses grouped by survey retrieved successfully",
//       data: results,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(400).json({ success: false, message: error.message });
//   }
// };

exports.getSurveyResponses = async (req, res) => {
  try {
    const { search, sortOrder = "desc", page = 1, limit = 10 } = req.query; // Default values for page and limit
    console.log("route is hitting --- >");

    const pageNumber = Math.max(1, parseInt(page, 10)); // Ensure page is at least 1
    const pageSize = Math.max(1, parseInt(limit, 10)); // Ensure limit is at least 1
    const skip = (pageNumber - 1) * pageSize;

    const pipeline = [
      {
        $group: {
          _id: "$survey_id",
          responseCount: { $sum: 1 },
          latestResponseCreatedAt: { $max: "$createdAt" },
        },
      },
      {
        $lookup: {
          from: "survey99",
          localField: "_id",
          foreignField: "_id",
          as: "surveyDetails",
        },
      },
      {
        $unwind: "$surveyDetails",
      },
      {
        $project: {
          _id: 0,
          survey_id: "$_id",
          surveyName: "$surveyDetails.name",
          ac_list: "$surveyDetails.ac_list",
          responseCount: 1,
          latestResponseCreatedAt: 1,
          surveyCreatedAt: "$surveyDetails.createdAt",
        },
      },
    ];

    if (search) {
      pipeline.push({
        $match: {
          surveyName: { $regex: search, $options: "i" },
        },
      });
    }

    pipeline.push(
      {
        $sort: {
          latestResponseCreatedAt: sortOrder === "asc" ? 1 : -1,
        },
      },
      {
        $skip: skip, // Skip the number of documents for pagination
      },
      {
        $limit: pageSize, // Limit the number of documents for pagination
      },
    );

    const results = await Responses.aggregate(pipeline);

    // Get the total count of matching documents for calculating total pages
    const countPipeline = pipeline.slice(0, -2); // Remove $skip and $limit stages for count
    countPipeline.push({
      $count: "totalCount",
    });
    const countResult = await Responses.aggregate(countPipeline);
    const totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return res.status(200).json({
      success: true,
      message: "Responses grouped by survey retrieved successfully",
      data: results,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalCount,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getSurveyResponseStats = async (req, res) => {
  try {
    const { survey_id, startDate, endDate, filters } = req.query;
    console.log("filters are -->", filters);

    if (!survey_id) {
      return res.status(400).json({ message: "Survey ID is required." });
    }

    // Basic match stage for survey and date filtering
    const matchStage = {
      survey_id: new mongoose.Types.ObjectId(String(survey_id)),
    };

    if (startDate && endDate) {
      if (isNaN(new Date(startDate)) || isNaN(new Date(endDate))) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid date range." });
      }
      const startUtcDate = new Date(startDate);
      startUtcDate.setUTCHours(0, 0, 0, 0);
      const endUtcDate = new Date(endDate);
      endUtcDate.setUTCHours(23, 59, 59, 999);
      matchStage.createdAt = { $gte: startUtcDate, $lte: endUtcDate };
    }

    // Create filters for the response questions if provided
    const responseFilters = [];
    if (filters) {
      filters.forEach(({ question, operator, response }) => {
        const filter = { question_id: Number(question) };
        switch (operator) {
          case "contains":
            filter.response = { $regex: response, $options: "i" };
            break;
          case "equals":
            filter.response = response;
            break;
          case "not equals":
            filter.response = { $ne: response };
            break;
          case "starts with":
            filter.response = { $regex: `^${response}`, $options: "i" };
            break;
          case "ends with":
            filter.response = { $regex: `${response}$`, $options: "i" };
            break;
          default:
            filter.response = response;
        }
        responseFilters.push(filter);
      });
    }

    const aggregationPipeline = [
      { $match: matchStage },
      { $unwind: "$responses" },
      {
        $project: {
          _id: 1,
          survey_id: 1,
          createdAt: 1,
          "responses.question_id": 1,
          "responses.question": 1,
          "responses.response": 1,
          "responses.question_type": 1,
        },
      },
      {
        $group: {
          _id: "$responses.question_id",
          question: { $first: "$responses.question" },
          question_type: { $first: "$responses.question_type" },
          responses: { $push: "$responses.response" },
          total_responses: { $sum: 1 },
        },
      },
      { $unwind: "$responses" },
      {
        $group: {
          _id: { question_id: "$_id", response_value: "$responses" },
          question: { $first: "$question" },
          question_type: { $first: "$question_type" },
          response_count: { $sum: 1 },
          total_responses: { $first: "$total_responses" },
        },
      },
      {
        $group: {
          _id: "$_id.question_id",
          question: { $first: "$question" },
          question_type: { $first: "$question_type" },
          total_responses: { $first: "$total_responses" },
          responses: {
            $push: {
              response_value: "$_id.response_value",
              count: "$response_count",
            },
          },
        },
      },
      {
        $sort: { _id: 1 }, // Sort questions by question_id in ascending order
      },
      {
        $project: {
          _id: 0,
          question_id: "$_id",
          question_type: 1,
          question: 1,
          total_responses: 1,
          responses: 1,
        },
      },
    ];

    // Apply response filters if any exist
    if (responseFilters.length > 0) {
      aggregationPipeline.push({
        $match: {
          $and: responseFilters.map((filter) => ({
            question_id: filter.question_id,
            responses: { $elemMatch: { response_value: filter.response } },
          })),
        },
      });
    }

    console.log(JSON.stringify(aggregationPipeline, null, 2));

    const stats = await Responses.aggregate(aggregationPipeline);
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error("Error fetching survey response stats:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.getMediaResource = async (req, res) => {
  console.log("get media resource called");
  try {
    const mediaId = req.query.mediaId;
    const media = await MediaResponse.findById(mediaId);
    if (!media) {
      return res
        .status(404)
        .json({ success: "false", message: "Media not found" });
    } else {
      return res.status(201).json({ success: "true", data: media });
    }
  } catch (error) {
    return res.status(400).json({ success: "false", message: error.message });
  }
};

exports.updateResponse = async (req, res) => {
  console.log("Updating response");
  try {
    const {
      response_id,
      survey_id,
      user_id,
      responses,
      media_responses,
      location_data,
      name,
      ac_no,
      booth_no,
      house_no,
      // last_name,
      status,
      family_id,
      save_mode,
    } = req.body;

    const updateFields = {};

    // Add fields to updateFields only if they are present in the request body
    if (survey_id) updateFields.survey_id = survey_id;
    if (user_id) updateFields.user_id = user_id;
    if (responses) updateFields.responses = responses;
    if (location_data) updateFields.location_data = location_data;
    if (name) updateFields.name = name;
    if (ac_no) updateFields.ac_no = ac_no;
    if (booth_no) updateFields.booth_no = booth_no;
    if (house_no) updateFields.house_no = house_no;
    // if (last_name) updateFields.last_name = last_name;
    if (status) updateFields.status = status;

    if (media_responses) {
      Object.entries(media_responses).map(([key, value]) => {
        const mediaBuffer = Buffer.from(value.data, "base64");
        const mediaResponse = new MediaResponse({
          userId: user_id,
          surveyId: survey_id,
          type: value.type,
          data: mediaBuffer,
        });
        mediaResponse.save();

        for (let response of responses) {
          if (response.question_id == key) {
            response.response = mediaResponse._id;
          }
        }
      });
    }

    // Perform the update
    const response = await Responses.findByIdAndUpdate(
      response_id,
      { $set: updateFields },
      { new: true },
    );

    if (!response) {
      return res
        .status(404)
        .json({ success: "false", message: "Response not found" });
    }

    return res
      .status(201)
      .json({ success: true, message: "Response Updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.markAsContacted = async (req, res) => {
  try {
    const { responsesIdsList } = req.body;
    for (let responseId of responsesIdsList) {
      const responseToUpdate = {
        contacted: true,
      };
      await Responses.findByIdAndUpdate(responseId, responseToUpdate, {
        new: true,
      });
    }
    return res
      .status(201)
      .json({ success: "true", message: "Response marked as contacted" });
  } catch (error) {
    return res.status(400).json({ success: "false", message: error.message });
  }
};

exports.saveRemark = async (req, res) => {
  try {
    const { response_id, remark_text } = req.body;

    const response = await Responses.findById(response_id);
    if (!response) {
      return res
        .status(404)
        .json({ success: "false", message: "Response not found" });
    }

    if (!response.remark_list) {
      response.remark_list = [];
    }
    response.remark_list.push({remark:remark_text});

    response.remark = remark_text;
    await response.save();

    return res
      .status(201)
      .json({ success: "true", message: "Remark saved successfully" });
  } catch (error) {
    return res.status(400).json({ success: "false", message: error.message });
  }
};

exports.saveCallRecording = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: "false", message: "No file uploaded" });
    }
    const { response_id, survey_id, created_by } = req.body;

    const recording = CallRecordings({
      file_path: req.file.path,
      duration: req.body.duration,
      response_id,
      survey_id,
      user_id: created_by,
    });
    await recording.save();

    const responseToUpdate = {
      call_recording: recording._id,
    };
    await Responses.findByIdAndUpdate(response_id, responseToUpdate, {
      new: true,
    });
    return res
      .status(201)
      .json({ success: "true", message: "Call recording saved successfully" });
  } catch (error) {
    return res.status(400).json({ success: "false", message: error.message });
  }
};

exports.downloadVoter = async (req, res) => {
  const { id } = req.query;
  try {
    const voterData = await Responses.findById(id);

    if (!voterData) {
      return res.status(404).send("Card not found");
    }

    console.log("voterData is --- >", voterData);

    // Render EJS Template with Data
    const templatePath = path.join(__dirname, "..", "views", "voterCard.ejs");
    const htmlContent = await ejs.renderFile(
      templatePath,
      voterData.toObject(),
    );

    // Use Puppeteer to Generate PDF
    console.log("launching puppeteer");
    const browser = await puppeteer.launch({
      args: ["--no-sandbox"],
    });
    console.log("puppeteer launched");
    const page = await browser.newPage();
    console.log("new page opened === >");
    await page.setContent(htmlContent, { waitUntil: "networkidle2" });
    console.log("content set ==== >");
    const pdfBuffer = await page.pdf({ format: "A4" });

    console.log("generated pdf buffer ==== >", pdfBuffer);

    await browser.close();

    console.log("closed browser === >");

    // Save the PDF to server
    const pdfDirectory = path.join(__dirname, "..", "pdfs"); // Ensure this directory exists
    const filePath = path.join(pdfDirectory, `card_${id}.pdf`);

    // Ensure the pdfs directory exists
    if (!fs.existsSync(pdfDirectory)) {
      fs.mkdirSync(pdfDirectory);
    }

    // Save PDF file to the server
    fs.writeFileSync(filePath, pdfBuffer);
    console.log(`PDF saved to: ${filePath}`);

    // Send PDF Response
    const processedBuffer = Buffer.from(pdfBuffer);
    res.setHeader("Content-Type", "application/pdf"); // Ensure it's PDF content type
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="card_${id}.pdf"`,
    ); // Set filename dynamically
    console.log("sending pdf buffer");

    const additionalData = {
      success: true,
      message: "PDF generated successfully",
      filename: `card_${id}.pdf`,
    };

    res.setHeader("X-Additional-Data", JSON.stringify(additionalData));

    res.send(processedBuffer);
    //res.send(htmlContent);

    // const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");
    // console.log("PDF Base64 string generated--->", pdfBase64);
    //
    // // Send Base64 PDF Response
    // res.status(200).json({
    //   success: true,
    //   file: pdfBase64,
    //   filename: `card_${id}.pdf`,
    // });
    // console.log("buffer sent ");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating PDF");
  }
};

exports.saveVoteStatus = async (req, res) => {
  try {
    const { response_id, vote_status } = req.body;
    const responseToUpdate = {
      vote_status: !vote_status,
    };
    const updatedResponse = await Responses.findByIdAndUpdate(
      response_id,
      responseToUpdate,
      {
        new: true,
      },
    );
    console.log("updatedResponse", updatedResponse.vote_status);
    return res
      .status(200)
      .json({ success: "true", message: "Vote status saved successfully" });
  } catch (error) {
    return res.status(400).json({ success: "false", message: error.message });
  }
};
