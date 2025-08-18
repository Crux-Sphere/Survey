const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const responseSchema = new Schema(
  {
    survey_id: {
      type: Schema.Types.ObjectId,
      ref: "Survey99",
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User99",
    },
    family_id: {
      type: Schema.Types.ObjectId,
      ref: "Family99",
    },
    name: {
      type: String,
    },
    ac_no: {
      type: String,
    },
    booth_no: {
      type: String,
    },
    house_no: {
      type: String,
    },
    phone_no: {
      type: String,
    },
    start: {
      type: Date,
    },
    end: {
      type: Date,
    },
    caste: {
      type: String,
    },
    responses: {
      type: Schema.Types.Mixed,
    },
    other_details: {
      type: Schema.Types.Mixed,
    },
    audio_recording_path: {
      type: String,
    },
    panna_pramukh_assigned: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User99",
    },
    contacted: {
      type: Boolean,
      default: false,
    },
    vote_status: {
      type: Boolean,
      default: false,
    },
    remark: {
      type: String,
    },
    remark_list: [
      {
        remark: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    call_recording: {
      type: Schema.Types.ObjectId,
      ref: "CallRecordings99",
    },
    status: {
      type: String,
      enum: ["Approved", "Rejected", "Pending"],
      default: "Pending",
    },
    quality_check_remarks: [
      {
        note: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    call_rating: {
      // uid: {type: String},
      rating: { type: String, enum: ["positive", "negative", "neutral"] },
      comment: { type: String },
    },
  },
  { strict: false, timestamps: true }
);

const Response = mongoose.model("Response99", responseSchema);

module.exports = Response;
