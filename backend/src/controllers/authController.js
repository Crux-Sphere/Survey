const express = require("express");
const Role = require("../models/role")
const router = express.Router();
require("dotenv").config();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const { generateResetToken, generateOTPWithExpiry } = require("../utils/utils");
const {
  sendPasswordResetEmail,
  sendPasswordResetEmailWithOtp,
} = require("../services/emailService");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate("role");
    // Check if user exists
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const roles = user.role.map((el) => el.name);
    console.log(roles);
    // Match Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (user.status === "inactive") {
      return res
        .status(401)
        .json({ success: false, message: "User account is inactive" });
    }
    // JWT token
    const token = jwt.sign(
      {
        id: user._id, // i have used mongoDB _id, and removed uuid
        email: user.email,
        ac_no: user.ac_no,
        booth_no: user.booth_no,
        name: user.name,
        role: roles,
        mobile: user.phone_number,
      },
      JWT_SECRET,
    );

    // Response sending back the token too for frontend to store
    res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error", error: error });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate("role");
    // Check if user exists
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const roles = user.role;
    console.log("roles are --->", roles);
    const roleNames = [
      'Supervisor',
      'Panna Pramukh',
      'Survey Manager',
      'Quality Check',
      'Data Analyst',
      'Data Manager',
      'Support Executive',
      'VRM Team Manager'
    ]

    const validRoles =  await Role.find({name: { $in: roleNames } });
    console.log("valid roles are --->",validRoles)
   // Extract the valid role IDs for comparison
   const validRoleIds = validRoles.map((role) => role._id.toString());

   // Check if the user has any of the valid roles
   const isAuthorized = roles.some((role) =>
     validRoleIds.includes(role._id.toString())
   );
    console.log("user ---->", isAuthorized);
    console.log(roles);
    if (roles.length > 0 && roles[0].category !== "admin") {
      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized user!",
        });
      }
    }

    if (user.status === "inactive") {
      return res.status(401).json({
        success: false,
        message: "User account is inactive",
      });
    }

    // Match Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    // JWT token
    const token = jwt.sign(
      {
        id: user._id, // i have used mongoDB _id, and removed uuid
        email: user.email,
        ac_no: user.ac_no,
        booth_no: user.booth_no,
        name: user.name,
        role: roles,
      },
      JWT_SECRET,
    );

    // Response sending back the token too for frontend to store
    res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error", error: error });
  }
};

exports.signup = async (req, res) => {
  try {
    const {
      username,
      name,
      email,
      password,
      phoneNumber,
      role,
      autoAssignSurvey,
      veiwOwnCollectData,
      preventDataDownload,
      preventDataAnalytics,
      removeAudioRecordingAccess,
      viewPendingData,
      assignedSurvey,
    } = req.body;
    // I have added all the felids from the user schema, feel free to add or remove any feilds as per your requirement
    bcrypt
      .hash(password, 10)
      .then(async (hash) => {
        const newUser = new User({
          username,
          name,
          email,
          password: hash,
          phoneNumber,
          role,
          autoAssignSurvey,
          veiwOwnCollectData,
          preventDataDownload,
          preventDataAnalytics,
          removeAudioRecordingAccess,
          viewPendingData,
          assignedSurvey,
        });

        await newUser.save();
        res
          .status(201)
          .json({ success: true, message: "User created successfully" });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({
          success: false,
          message: "Error while hashing password",
          error: error,
        });
      });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error", error: error });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email, mode } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Email not found",
      });
    }

    // Generate a JWT token with user ID and email
    const token = generateResetToken(user._id, user.email);

    if (mode === "app") {
      resetLink = `bdrpl://reset-password?token=${token}`;
      const otp = generateOTPWithExpiry();

      user.otp = {
        code: otp.otp,
        expiryTime: otp.expiryTime,
      };

      await user.save();

      await sendPasswordResetEmailWithOtp(user.email, otp.otp);
    } else {
      // Create a password reset link containing the token
      const resetLink = `${process.env.CLIENT_URL}/login/reset-password?token=${token}`;

      await sendPasswordResetEmail(user.email, resetLink);
    }

    return res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.resetPasswordByOtp = async (req, res) => {
  try {
    const { email, otp, new_password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (
      !user.otp ||
      user.otp.code !== otp ||
      user.otp.expiryTime < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Update user's otp to null
    user.otp = null;

    // Update the password
    const hashedPass = await bcrypt.hash(new_password, 10);
    //console.log(hashedPass);
    user.password = hashedPass;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password successfully reset",
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(decoded);
    // Find the user by ID
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update the password
    const hashedPass = await bcrypt.hash(new_password, 10);
    //console.log(hashedPass);
    user.password = hashedPass;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password successfully reset",
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
