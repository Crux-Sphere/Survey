const Survey = require("../models/survey");

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

exports.saveSurvey = async (req, res) => {
  try {
    const {
      created_by,
      name,
      header_text,
      access_pin,
      ac_no,
      booth_no,
      background_location_capture,
      thank_time_duration,
      questions,
    } = req.body;
    console.log(req.body);
    let welcome_image, thankyou_image;
    if (req.files && req.files.welcome_image) {
      welcome_image = req.files.welcome_image.data;
    } else {
      welcome_image = null;
    }

    if (req.files && req.files.thankyou_image) {
      thankyou_image = req.files.thankyou_image.data;
    } else {
      thankyou_image = null;
    }

    const survey = new Survey({
      created_by,
      name,
      header_text,
      access_pin,
      ac_no,
      booth_no,
      background_location_capture,
      welcome_image,
      thankyou_image,
      thank_time_duration,
    });
    if (questions && Array.isArray(questions) && questions.length > 0) {
      survey.questions = questions;
    }
    await survey.save();

    return res
      .status(201)
      .json({ success: true, message: "Survey created successfully", survey });
  } catch (error) {
    console.log("error is-->", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteSurvey = async (req, res) => {
  try {
    console.log("delete route hitting");
    const { id, created_by } = req.body;

    const survey = await Survey.findOneAndDelete({ _id: id, created_by });

    if (!survey) {
      return res
        .status(404)
        .json({ success: false, message: "Survey not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Survey deleted successfully" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getSurvey = async (req, res) => {
  try {
    console.log("get single user hitting");
    const id = req.query._id;
    const survey = await Survey.findById(id);
    if (!survey) {
      return res
        .status(404)
        .json({ success: false, message: "Survey not found" });
    }

    //*** This is the logic for randomisation , that may be added in case when we request the actual forms ***//
    // const questions = survey.questions;

    // const questionsToRandomize = [];
    // const originalOrder = [];

    // questions.forEach((question) => {
    //   if (question.randomize) {
    //     questionsToRandomize.push(question);
    //     originalOrder.push(null);
    //   } else {
    //     originalOrder.push(question);
    //   }
    // });

    // const shuffledQuestions = shuffleArray(questionsToRandomize);

    // let shuffledIndex = 0;
    // const finalQuestions = originalOrder.map((question) => {
    //   if (question === null) {
    //     return shuffledQuestions[shuffledIndex++];
    //   }
    //   return question;
    // });

    return res.status(200).json({
      success: true,
      // data: { ...survey, questions: finalQuestions },
      data: survey,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllSurvey = async (req, res) => {
  try {
    const {
      filter = "", // Default filter to an empty string
      page = 1,
      limit = 10,
      sortBy = "name",
      sortOrder = "asc",
      created_by,
      published,
      user_id,
    } = req.query;
    console.log(req.query);

    const order = sortOrder === "asc" ? 1 : -1;
    const skip = (page - 1) * limit;
    const sortOptions = {};

    if (sortBy === "name") {
      sortOptions.name = order;
    } else if (sortBy === "createdAt") {
      sortOptions.createdAt = order;
    }

    const searchConditions = [];

    if (filter && filter.trim()) {
      searchConditions.push({ name: { $regex: filter, $options: "i" } });
    }

    if (created_by) {
      searchConditions.push({ created_by });
    }

    if (
      published !== undefined &&
      published !== "" &&
      published !== "undefined"
    ) {
      searchConditions.push({ published: published === "true" });
    }

    const findOptions =
      searchConditions.length > 0 ? { $and: searchConditions } : {};

    const total = await Survey.countDocuments(findOptions);

    const surveys = await Survey.find(findOptions)
      .skip(skip)
      .limit(Number(limit))
      .sort(sortOptions)
      .collation({ locale: "en", strength: 2 });

    if (surveys.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No surveys found" });
    }
    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      surveys,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
exports.getSurveysByAcAndBooth = async (req, res) => {
  try {
    const {
      filter = "", 
      page = 1,
      limit = 10,
      ac_no,
      booth_no,
      sortBy = "name",
      sortOrder = "asc",
      created_by,
      published,
      user_id,
    } = req.query;

    if(!booth_no || !ac_no){
      return res.status(400).json({
        success:false,
        message: "Both ac_no and booth_no are required."
      })
    }
    const findOptions = {booth_no,ac_no};
    const order = sortOrder === "asc" ? 1 : -1;
    const skip = (page - 1) * limit;
    const sortOptions = {};

    if (sortBy === "name") {
      sortOptions.name = order;
    } else if (sortBy === "createdAt") {
      sortOptions.createdAt = order;
    }

    const searchConditions = [];

    if (filter && filter.trim()) {
      searchConditions.push({ name: { $regex: filter, $options: "i" } });
    }

    if (created_by) {
      searchConditions.push({ created_by });
    }

    if (
      published !== undefined &&
      published !== "" &&
      published !== "undefined"
    ) {
      searchConditions.push({ published: published === "true" });
    }
    if(searchConditions.length > 0 ){
      findOptions.$and = searchConditions
    }
    console.log(findOptions)
    const total = await Survey.countDocuments(findOptions);

    const surveys = await Survey.find(findOptions)
      .skip(skip)
      .limit(Number(limit))
      .sort(sortOptions)
      .collation({ locale: "en", strength: 2 });

    if (surveys.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No surveys found" });
    }
    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      surveys,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateSurvey = async (req, res) => {
  try {
    const id = req.query._id;
    const {
      created_by,
      name,
      header_text,
      access_pin,
      background_location_capture,
      questions,
      thank_time_duration,
      published,
      response_count,
    } = req.body;

    let updateFields = {};

    if (name !== undefined && name !== null) updateFields.name = name;
    if (header_text !== undefined && header_text !== null)
      updateFields.header_text = header_text;
    if (access_pin !== undefined && access_pin !== null)
      updateFields.access_pin = access_pin;
    if (
      background_location_capture !== undefined &&
      background_location_capture !== null
    )
      updateFields.background_location_capture = background_location_capture;
    if (questions !== undefined && questions !== null)
      updateFields.questions = questions;
    if (thank_time_duration !== undefined && thank_time_duration !== null)
      updateFields.thank_time_duration = thank_time_duration;
    if (published !== undefined && published !== null)
      updateFields.published = published;
    if (response_count !== undefined && response_count !== null)
      updateFields.response_count = response_count;

    if (req.files && req.files.welcome_image) {
      console.log("Welcome image found");
      updateFields.welcome_image = req.files.welcome_image.data;
    } else if (req.body.welcome_image === "") {
      // If the frontend sends an empty array for welcome_image, delete it
      console.log("Deleting welcome image");
      updateFields.welcome_image = null;
    } else {
      console.log("No changes to welcome image");
    }

    // Handle thankyou_image: Update, retain, or delete
    if (req.files && req.files.thankyou_image) {
      console.log("Thankyou image found");
      updateFields.thankyou_image = req.files.thankyou_image.data;
    } else if (req.body.thankyou_image === "") {
      // If the frontend sends an empty array for thankyou_image, delete it
      console.log("Deleting thankyou image");
      updateFields.thankyou_image = null;
    } else {
      console.log("No changes to thankyou image");
    }

    const result = await Survey.findOneAndUpdate(
      { _id: id, created_by },
      updateFields,
      { new: true },
    );

    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Survey not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Survey updated successfully",
      survey: result,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, message: error.message });
  }
};
