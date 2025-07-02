require("dotenv").config({path:"../../../.env"});
const mongoose = require("mongoose");
const Survey = require("../../models/survey"); 
const connectDb = require("../../config/database")
const {generateUniqueSurveyId} = require("../utils")

connectDb()

async function main() {
  try {
    const surveys = await Survey.find({ surveyId: { $exists: false } });

    for (const survey of surveys) {
      const newSurveyId = generateUniqueSurveyId();
      survey.survey_id = newSurveyId;
      await survey.save();
      console.log(`Updated ${survey.name} with surveyId: ${newSurveyId}`);
    }

    console.log("Migration complete.");
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

main();