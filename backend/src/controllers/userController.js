const mongoose = require("mongoose");
const Data = require("../models/data");
const ProfilePicture = require("../models/profilePicture");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const Role = require("../models/role");
const Response = require("../models/response");
const fs = require("fs");
const XLSX = require("xlsx");
const {
  sendNotificationToMultipleTokens,
  storeNotification,
} = require("../firebase");

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

exports.addUsers = async (req, res) => {
  try {
    const existingUser = await User.find({ email: req.body.email });
    console.log("body is --->", req.body);
    if (existingUser.length > 0) {
      console.log();
      return res.status(400).json({
        success: false,
        message: "Email is already registered",
      });
    }
    console.log("add user Request");
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    const data = { ...req.body };
    data.password = hashedPass;
    const user = new User(data);
    const result = await user.save();

    return res.status(201).json({
      success: true,
      message: "Users created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error adding users:", error);
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong" });
  }
};

exports.addMultipleUsers = async (req, res) => {
  try {
    const { userDetails, ...restOfBody } = req.body;
    // const createdUsers = [];

    for (const user of userDetails) {
      const newUser = new User({
        name: user[0],
        username: user[1],
        email: user[2],
        password: user[3],
        ...restOfBody,
      });
      const savedUser = await newUser.save();
      // createdUsers.push(savedUser);
    }

    return res.status(201).json({
      success: true,
      message: "Users created successfully",
      // data: createdUsers
    });
  } catch (error) {
    console.error("Error adding users:", error);
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { user_id, ...userData } = req.body;
    console.log("update user is hitting", req.body);
    console.log("userData is --->", userData);

    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Check if password exists and is not an empty string
    if (userData.password && userData.password.trim() !== "") {
      const hashedPass = await bcrypt.hash(userData.password, 10);
      userData.password = hashedPass;
    } else {
      // If password is empty, remove it from the userData
      delete userData.password;
    }

    // Update user without changing password if it's not provided or is empty
    const updatedUser = await User.findOneAndUpdate(
      { _id: user_id },
      { $set: userData },
      { new: true, runValidators: true },
    );

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser, // Optional: Include updated user data in the response
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Something went wrong while updating user",
    });
  }
};

exports.assignBoothToUsers = async (req, res) => {
  const { survey_id, userId, ac_list, editResponses } = req.body;
  console.log("assigning booth running");

  try {
    // Find the user by userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the survey is already in the user's assigned surveys
    if (!user.assigned_survey.includes(survey_id)) {
      user.assigned_survey.push(survey_id);
    }

    // Merge or update the ac_list for the specific survey
    const updatedAcList = [...user.ac_list]; // Clone the existing AC list
    console.log("existing ac list is --->", updatedAcList);
    console.log("new ac list is --->", ac_list);
    ac_list.forEach((newAc) => {
      const existingAcIndex = updatedAcList.findIndex(
        (existingAc) =>
          existingAc.ac_no === newAc.ac_no &&
          existingAc.survey_id.toString() === survey_id,
      );

      if (existingAcIndex !== -1) {
        // If AC already exists for the survey, update its booth numbers
        console.log("existing ac no found");
        const existingAc = updatedAcList[existingAcIndex];
        console.log("existing booth numbers --->", existingAc.booth_numbers);
        console.log("new booth numbers --->", newAc.booth_numbers);
        existingAc.booth_numbers = [
          ...new Set([...existingAc.booth_numbers, ...newAc.booth_numbers]),
        ];
        console.log(
          "updated ac list booth numbers--->",
          existingAc.booth_numbers,
        );
      } else {
        // If AC does not exist for the survey, add it
        console.log("existing ac no not found");
        updatedAcList.push({ ...newAc, survey_id });
      }
    });

    user.ac_list = updatedAcList;
    await user.save();

    if (editResponses) {
      // Build filter criteria for responses
      const filterCriteria = ac_list.flatMap(({ ac_no, booth_numbers }) =>
        booth_numbers.map((booth_no) => ({
          survey_id,
          ac_no,
          booth_no,
        })),
      );

      // Update responses in a single operation
      await Response.updateMany(
        { $or: filterCriteria },
        { $set: { user_id: userId } },
      );
    }

    return res.status(200).json({
      success: true,
      message: "Booths assigned to user and responses updated successfully",
    });
  } catch (error) {
    console.error("Error in assigning booths to users:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAssignedAcBooths = async (req, res) => {
  const { userId, survey_id } = req.query;
  console.log("assifgned rtoute hitting");
  console.log("quwery is --- >", req.query);

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    console.log("ac_list is", user.ac_list);
    const assignedAcBooths = user.ac_list.filter(
      (ac) => ac.survey_id.toString() === survey_id,
    );
    console.log("assignedAcBooths --- >", assignedAcBooths);
    return res.status(200).json({ success: true, assignedAcBooths });
  } catch (error) {
    console.error("Error fetching assigned ACs and booths:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateUsers = async (req, res) => {
  try {
    const { users } = req.body;
    console.log(users);

    let tokens = [];

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ error: "No users provided for update" });
    }

    const updatePromises = users.map(async (user) => {
      const fetchedUserData = await User.findById(user.user_id).select(
        "notification_token",
      );

      if (!user.user_id) {
        return Promise.reject(new Error("User ID is required for each user"));
      }

      let updateFields = {};

      if (user.name !== undefined) updateFields.name = user.name;
      if (user.email !== undefined) updateFields.email = user.email;
      if (user.phone_number !== undefined)
        updateFields.phone_number = user.phone_number;
      if (user.role !== undefined) updateFields.role = user.role;
      if (user.assigned_survey !== undefined) {
        updateFields.$addToSet = { assigned_survey: user.assigned_survey };
        await storeNotification({
          userId: user.user_id,
          title: "Survey Assigned",
          content: "A new survey is assigned to you",
          type: "survey",
        });
        if (fetchedUserData.notification_token) {
          tokens.push(fetchedUserData.notification_token);
        }
      }
      if (user.remove_survey !== undefined) {
        updateFields.$pull = { assigned_survey: user.remove_survey };
      }

      return User.findOneAndUpdate({ _id: user.user_id }, updateFields, {
        new: true,
        runValidators: true,
      });
    });

    const dbRes = await Promise.all(updatePromises);

    console.log("Tokens are ===>", tokens);
    sendNotificationToMultipleTokens(tokens, "A new survey is assigned to you");

    return res.status(200).json({
      success: true,
      message: "Users updated successfully",
      updatedUsers: dbRes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: error.message,
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    console.log(req.query);
    const _id = req.query.userId;
    const returnAssignedSurveys = req.query.assignedSurveys;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (returnAssignedSurveys) {
      const allUserSurveys = await User.findOne({ _id: _id })
        .populate("assigned_survey")
        .select("assigned_survey _id");

      const totalSurveys = allUserSurveys.assigned_survey.length;
      const totalPages = Math.ceil(totalSurveys / limit);

      const assignedSurveys = await User.findOne({ _id })
        .populate({
          path: "assigned_survey",
          options: {
            sort: { createdAt: -1 },
            skip,
            limit,
          },
        })
        .select("assigned_survey _id");

      const assignedSurveysWithCount = await Promise.all(
        assignedSurveys.assigned_survey.map(async (survey) => {
          const collectedCount = await Response.countDocuments({
            survey_id: survey._id,
            user_id: _id,
          });
          return { ...survey.toObject(), collected_count: collectedCount };
        }),
      );

      return res.status(200).json({
        success: true,
        data: {
          ...assignedSurveys.toObject(),
          assigned_survey: assignedSurveysWithCount,
        },
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalSurveys: totalSurveys,
          surveyPerPage: limit,
        },
      });
    }

    const user = await User.findOne({ _id: _id });
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ success: false, message: "error in getting user" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    console.log(req.query);
    let filter = req.query.filter || "";
    // let created_by = req.query.created_by;
    const getWithProfilePicture = Boolean(req.query.getWithProfilePicture);
    const role = req.query.role;
    const page = req.query.page !== "undefined" ? Number(req.query.page) : 1;
    const limit =
      req.query.limit !== "undefined" ? Number(req.query.limit) : 10;

    const userRoles = await Role.find({ category: "user" });
    const validUserRoleIds = userRoles.map((role) => role._id);

    const skip = (page - 1) * limit;

    const searchConditions = [];
    searchConditions.push({ name: { $regex: filter, $options: "i" } });
    searchConditions.push({ username: { $regex: filter, $options: "i" } });

    let query = {
      $and: [{ $or: searchConditions }], //{ created_by: created_by }
    };
    let roleExists = [];
    if (role) {
      roleExists = validUserRoleIds.filter(
        (ro) => ro.toString() === role.toString(),
      );
    }
    if (role && roleExists.length > 0) {
      query.$and.push({ role: { $in: [role] } });
    } else {
      query.$and.push({ role: { $in: validUserRoleIds } });
    }

    let users;

    if (getWithProfilePicture === "true") {
      users = await User.find(query).populate("profile_picture");
    } else {
      users = await User.find(query)
        .populate("role")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
    }

    const total = await User.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ success: false, message: "something went wrong" });
  }
};

exports.uploadProfilePicture = async (req, res) => {
  try {
    const { userId, type, imageData } = req.body;

    const imageBuffer = Buffer.from(imageData, "base64");

    const profilePicture = new ProfilePicture({
      type: type,
      data: imageBuffer,
    });
    await profilePicture.save();

    const user = await User.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { profile_picture: profilePicture._id } },
      { new: true },
    );

    return res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "something went wrong while uploading profile picture",
    });
  }
};

exports.getProfilePicture = async (req, res) => {
  try {
    // TODO: implement
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "something went wrong while fetching profile picture",
    });
  }
};

exports.getSupervisorCollectors = async (req, res) => {
  try {
    const { supervisor_id, name, page = 1, limit = 10 } = req.query;

    const filters = { supervisor: supervisor_id };
    if (name) filters.name = { $regex: name, $options: "i" };

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const collectors = await User.find(filters)
      .populate("role")
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const total = await User.countDocuments(filters);

    return res.status(200).json({
      success: true,
      data: collectors,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Something went wrong while fetching supervisor collectors",
    });
  }
};
// karyakarta API'S////////////////////////////////////////////////////

exports.importKaryakartas = async (req, res) => {
  try {
    // Check if a file is uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    console.log(req.file);
    // Parse the uploaded Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Validate if the file contains required fields
    const requiredFields = ["booth_no", "voter_serial_no", "username", "name", "caste", "mobile", "email", "password", "role", "user_status"];
    const missingFields = requiredFields.filter(
      (field) => !data[0] || !Object.keys(data[0]).includes(field),
    );
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields in Excel: ${missingFields.join(
          ", ",
        )}`,
      });
    }

    // Fetch valid roles for karyakartas
    const karyakartaRoles = await Role.find({ category: "karyakarta" });
    const roleNames = karyakartaRoles.map((role) => role.name); // Extract role names

    const createdKaryakartas = [];
    const errors = [];

    for (const row of data) {
      const { booth_no, voter_serial_no, username, name, caste, mobile, email, password, role, userStatus:user_status } = row;

      // Check if email already exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        errors.push({ email, message: "Email already exists" });
        continue;
      }

      // Check if role name is valid
      const roleExists = roleNames.includes(role);
      if (!roleExists) {
        errors.push({ email, message: `Invalid role name: ${role}` });
        continue;
      }

      // Find the role ID by role name
      const foundRole = karyakartaRoles.find((r) => r.name === role);
      const roleId = foundRole ? foundRole._id.toString() : null;

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create karyakarta data
      const karyakartaData = {
        booth_no, voter_serial_no, caste, phone_number:mobile,
        username,
        name,
        email,
        password: hashedPassword,
        role: [roleId], // Store the role ID
        userStatus: user_status || "active", // Default userStatus to 'active' if not provided
      };

      try {
        const newKaryakarta = await User.create(karyakartaData);
        createdKaryakartas.push(newKaryakarta);
      } catch (err) {
        errors.push({ email, message: "Error creating user", error: err });
      }
    }

    // Delete the uploaded file after processing
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      } else {
        console.log("File deleted successfully.");
      }
    });

    return res.status(200).json({
      success: true,
      message: "Import completed",
      created: createdKaryakartas.length,
      errors,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Error importing karyakartas",
    });
  }
};


exports.createKaryakarta = async (req, res) => {
  try {
    const {
      email,
      username,
      created_by,
      name,
      ac_no,
      booth_no,
      district,
      password,
      role,
      voter_serial_no, caste, phone_number
    } = req.body;
    const userExists = await User.find({ email: email });
    if (userExists.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }
    const karyakartaRoles = await Role.find({ category: "karyakarta" });
    const validRoles = karyakartaRoles.map((el) => el._id);
    console.log("ROLE ISS:", role);
    const roleExists = validRoles.filter(
      (el) => el.toString() === role.toString(),
    );

    if (roleExists.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }
    const hashedPass = await bcrypt.hash(password, 12);

    const excludeFieldsRoles = [
      "District President",
      "Shakti Kendra",
      "Booth Adhyaksh",
    ];
    const roleName = karyakartaRoles.find(
      (el) => el._id.toString() === role,
    )?.name;
    const karyakartaData = {
      email,
      username,
      created_by,
      name,
      district,
      password: hashedPass,
      role: [role],
      voter_serial_no,
      caste,
      phone_number: phone_number,
    };

    if (!excludeFieldsRoles.includes(roleName)) {
      karyakartaData.ac_no = ac_no;
      karyakartaData.booth_no = booth_no;
    }

    // Create the new Karyakarta
    const newKaryakarta = await User.create(karyakartaData);

    return res.status(200).json({
      success: true,
      message: "Karyakarta created successfully",
      data: newKaryakarta,
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json({
      success: false,
      message: "Error creating Karyakarta",
    });
  }
};

exports.updateMultipleKaryakarta = async (req, res) => {
  //for assigining data
  try {
    const { id, surveyId, responses } = req.body;
    console.log(req.body);
    const data = await Data.findOne({ survey_id: surveyId, user_id: id });
    console.log("data is --->", data);
    if (data) {
      console.log("data existed");
      const finalLength = data.responses.length + responses.length;
      if (finalLength > 60) {
        return res.status(500).json({
          success: false,
          message: "Cannot assign more than 60 responses.",
        });
      } else {
        data.responses = [...data.responses, ...responses];
        await data.save();
      }
    } else {
      if (responses.length > 60) {
        console.log("returned exceeded response");
        return res.status(500).json({
          success: false,
          message: "Cannot assign more than 60 responses.",
        });
      }
      console.log("new data created");
      await Data.create({ survey_id: surveyId, user_id: id, responses });
    }

    responses.forEach(async (response) => {
      await Response.findOneAndUpdate(
        { _id: response },
        { panna_pramukh_assigned: id },
      );
    });
    return res
      .status(200)
      .json({ success: true, message: "succeessfuly created data" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Error updating data",
    });
  }
};

exports.updateKaryakarta = async (req, res) => {
  try {
    const {
      id,
      email,
      username,
      created_by,
      name,
      ac_no,
      booth_no,
      district,
      password,
      role,
      status,
    } = req.body;
    console.log(req.body);
    const karyakartaRoles = await Role.find({ category: "karyakarta" });
    const validRoles = karyakartaRoles.map((el) => el._id);
    console.log("valid roles are -->", validRoles);
    const roleExists = validRoles.filter(
      (el) => el.toString() === role.toString(),
    );
    console.log("role exists->>>>", roleExists);
    if (roleExists.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const karyakarta = await User.findById(id);
    if (!karyakarta) {
      return res.status(404).json({
        success: false,
        message: "Karyakarta not found",
      });
    }

    karyakarta.email = email || karyakarta.email;
    karyakarta.username = username || karyakarta.username;
    karyakarta.created_by = created_by || karyakarta.created_by;
    karyakarta.name = name || karyakarta.name;
    karyakarta.ac_no = ac_no || karyakarta.ac_no;
    karyakarta.booth_no = booth_no || karyakarta.booth_no;
    karyakarta.district = district || karyakarta.district;
    karyakarta.status = status || karyakarta.status;
    if (password) {
      const hashedPass = await bcrypt.hash(password, 12);
      karyakarta.password = hashedPass;
    }
    if (role) {
      karyakarta.role = [role];
    }

    await karyakarta.save();

    return res.status(200).json({
      success: true,
      message: "Karyakarta updated successfully",
      data: karyakarta,
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json({
      success: false,
      message: "Error updating Karyakarta",
    });
  }
};

exports.getAllKaryakarta = async (req, res) => {
  try {
    let filter = req.query.filter || "";

    const role = req.query.role;
    const page = req.query.page !== "undefined" ? Number(req.query.page) : 1;
    const limit =
      req.query.limit !== "undefined" ? Number(req.query.limit) : 10;
    // const validRoles = ["Panna Pramukh", "Booth Adhyaksh", "Mandal Adhyaksh"];

    const validRoles = await Role.find({ category: "karyakarta" });
    const validRoleIds = validRoles.map((r) => r._id);
    console.log("valid roles are -->", validRoleIds);

    const skip = (page - 1) * limit;

    const searchConditions = [];
    searchConditions.push({ name: { $regex: filter, $options: "i" } });
    searchConditions.push({ username: { $regex: filter, $options: "i" } });

    let query = { $and: [{ $or: searchConditions }] };

    let roleExists = [];
    if (role) {
      roleExists = validRoleIds.filter(
        (ro) => ro.toString() === role.toString(),
      );
    }

    if (role && roleExists.length > 0) {
      query.$and.push({ role: { $in: [role] } });
    } else {
      query.$and.push({ role: { $in: validRoles } });
    }

    const karyakartas = await User.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("role");
    const total = await User.countDocuments(query);
    console.log("total is -- >", total);
    return res.status(200).json({
      success: true,
      message: "Karyakarta fetched",
      count: karyakartas.length,
      totalPages: Math.ceil(total / limit),
      data: karyakartas,
    });
  } catch (e) {
    return res.status(400).json({
      success: false,
      message: "Error creating Karyakarta",
    });
  }
};

exports.getKaryakarta = async (req, res) => {
  try {
    const { id } = req.query;
    const karyakarta = await User.findById(id);
    return res.status(200).json({ success: true, data: karyakarta });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching karyakarta" });
  }
};

exports.getUsersByAcList = async (req, res) => {
  try {
    const { ac_list } = req.body;

    // Find the role ID for "Panna Pramukh"
    const pannaPramukhRole = await Role.findOne({
      name: "Panna Pramukh",
    });

    if (!pannaPramukhRole) {
      return res
        .status(404)
        .json({ success: false, message: "Panna Pramukh role not found" });
    }

    let query = { role: pannaPramukhRole._id };

    // If `ac_list` is provided, construct the `$or` conditions
    if (ac_list && ac_list.length > 0) {
      const conditions = ac_list.map(({ ac_no, booth_numbers }) => ({
        $and: [
          { ac_no: ac_no }, // Match the `ac_no`
          { booth_no: { $in: booth_numbers } }, // Ensure `booth_no` is in the corresponding list
        ],
      }));

      query.$or = conditions;
    }

    console.log("Query:", JSON.stringify(query, null, 2));

    // Fetch users based on the query
    const users = await User.find(query);

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getPannaPramukh = async (req, res) => {
  try {
    console.log("get panna pramukh");
    console.log(req.query);
    const { ac_no, booth_no } = req.query;
    let filter = req.query.filter || "";
    const page = req.query.page !== "undefined" ? Number(req.query.page) : 1;
    const limit =
      req.query.limit !== "undefined" ? Number(req.query.limit) : 10;

    const skip = (page - 1) * limit;

    if (!ac_no || !booth_no) {
      return res.status(400).json({
        success: false,
        message: "Invalid ac_no or booth_no",
      });
    }

    const pannaPramukhRole = await Role.findOne({
      name: "Panna Pramukh",
    });

    const query = { ac_no, booth_no, role: { $in: [pannaPramukhRole._id] } };

    const searchConditions = [];
    searchConditions.push({ name: { $regex: filter, $options: "i" } });
    searchConditions.push({ username: { $regex: filter, $options: "i" } });

    query.$and = [{ $or: searchConditions }];

    const users = await User.find(query).skip(skip).limit(limit);
    return res.status(200).json({
      success: true,
      message: "Panna Pramukh fetched",
      data: users,
    });
  } catch (e) {
    return res.status(400).json({
      success: false,
      message: "Error fetching Panna Pramukh",
    });
  }
};
exports.getBoothAdhyaksh = async (req, res) => {
  try {
    const { ac_no, booth_no } = req.query;
    let filter = req.query.filter || "";
    const page = req.query.page !== "undefined" ? Number(req.query.page) : 1;
    const limit =
      req.query.limit !== "undefined" ? Number(req.query.limit) : 10;

    const skip = (page - 1) * limit;

    if (!ac_no || !booth_no) {
      return res.status(400).json({
        success: false,
        message: "Invalid ac_no or booth_no",
      });
    }
    const BoothAdhyakshRole = await Role.findOne({
      name: "Booth Adhyaksh",
    });

    const query = { ac_no, booth_no, role: { $in: [BoothAdhyakshRole._id] } };

    const searchConditions = [];
    searchConditions.push({ name: { $regex: filter, $options: "i" } });
    searchConditions.push({ username: { $regex: filter, $options: "i" } });

    query.$and = [{ $or: searchConditions }];

    const users = await User.find(query).skip(skip).limit(limit);
    return res.status(200).json({
      success: true,
      message: "Booth adhyaksh fetched",
      data: users,
    });
  } catch (e) {
    return res.status(400).json({
      success: false,
      message: "Error fetching Panna Pramukh",
    });
  }
};

exports.saveToken = async (req, res) => {
  try {
    const { userId, token } = req.body;
    const user = await User.findById(userId);
    user.notification_token = token;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Token saved",
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json({
      success: false,
      message: "Error saving token",
    });
  }
};

exports.getUserSamplingSurveys = async (req, res) => {
  try {
    const { user_id } = req.query;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const allUserSurveys = await User.findById(user_id)
      .populate("assigned_sample_surveys")
      .select("assigned_sample_surveys _id");

    const totalSurveys = allUserSurveys.assigned_sample_surveys.length;
    const totalPages = Math.ceil(totalSurveys / limit);

    const assignedSampleSurveys = await User.findById(user_id)
      .populate({
        path: "assigned_sample_surveys",
        options: {
          sort: { createdAt: -1 },
          skip,
          limit,
        },
      })
      .select("assigned_sample_surveys _id");

    const assignedSampleSurveysWithCount = await Promise.all(
      assignedSampleSurveys.assigned_sample_surveys.map(async (survey) => {
        const collectedCount = await Response.countDocuments({
          survey_id: survey._id,
          user_id: user_id,
        });
        return { ...survey.toObject(), collected_count: collectedCount };
      }),
    );

    return res.status(200).json({
      success: true,
      data: {
        ...assignedSampleSurveys.toObject(),
        assigned_sample_surveys: assignedSampleSurveysWithCount,
      },
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalSurveys: totalSurveys,
        surveyPerPage: limit,
      },
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json({
      success: false,
      message: "Error fetching user sampling surveys",
    });
  }
};

exports.getKaryakartaDashboard = async(req,res) => {
  try {
      // Total Call Ratings Pipeline
      const totalCallRatingsData = await getRatingCount({isKaryakarta: true});
      const recentCallRatingsData = await getRecentCallRatings({isKaryakarta: true});
      const totalRatingCountData = await getTotalCallRatings({isKaryakarta: true});
      const dailyOverallRatingData = await overallDailyRatingCount({isKaryakarta: true});
      const weeklyOverallRatingData = await overallWeeklyRatingCount({isKaryakarta: true});
      const monthlyOverallRatingData = await overallMonthlyRatingCount({isKaryakarta: true});
      const dailyPositiveRatingData = await getGoodDailyRatingCount({isKaryakarta: true});
      const weeklyPositiveRatingData = await getGoodWeeklyRatingCount({isKaryakarta: true});
      const monthlyPositiveRatingData = await getGoodMonthlyRatingCount({isKaryakarta: true});
      const dailyNegativeRatingData = await getBadDailyRatingCount({isKaryakarta: true});
      const weeklyNegativeRatingData = await getBadWeeklyRatingCount({isKaryakarta: true});
      const monthlyNegativeRatingData = await getBadMonthlyRatingCount({isKaryakarta: true});
      const dailyNeutralRatingData = await getGreatDailyRatingCount({isKaryakarta: true});
      const weeklyNeutralRatingData = await getGreatWeeklyRatingCount({isKaryakarta: true});
      const monthlyNeutralRatingData = await getGreatMonthlyRatingCount({isKaryakarta: true});
  
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
}
