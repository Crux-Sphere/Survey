const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const familySchema = new Schema(
  {
    survey_id: {
      type: Schema.Types.ObjectId,
      ref: "Survey99",
    },
    ac_no: {
      type: String,
      required: true,
    },
    booth_no: {
      type: String,
      required: true,
    },
    house_no: {
      type: String,
      required: false,
    },
    // OLD FEATURE -- last name
    // last_name: {
    //   type: String,
    //   required: true,
    // },
    family_head: {
      type: Schema.Types.ObjectId,
      ref: "User99",
    },
    common_responses: [
      {
        response: String,
        question: String,
        question_id: Number,
        question_type: String,
        other_response: String,
      },
    ],
  },
  { timestamps: true },
);

const Family = mongoose.model("Family99", familySchema);

module.exports = Family;
