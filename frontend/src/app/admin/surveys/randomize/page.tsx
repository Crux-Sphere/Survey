"use client";

import QuestionHeader from "@/components/questions/QuestionHeader";
import Loader from "@/components/ui/Loader";
import { getSurvey, updateSurvey } from "@/networks/survey_networks";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import toast from "react-hot-toast";

function Page() {
  const [surveyQuestions, setSurveyQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const params = useSearchParams();
  const id = params.get("id");
  const surveyName = params.get("name")
  const created_by = params.get("created_by");

  useEffect(() => {
    handleGetSurveyData();
  }, []);

  // Fetch survey data from the server
  async function handleGetSurveyData() {
    const queryParams = { _id: id };
    setLoading(true);
    const response = await getSurvey(queryParams);
    setLoading(false);
    if (response.success) {
      if (response.data.questions) setSurveyQuestions(response.data.questions);
    } else {
      toast.error("Something went wrong while fetching survey data");
    }
  }

  // Handle checkbox change for randomization
  const handleCheckboxChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedQuestions = [...surveyQuestions];
    updatedQuestions[index].randomize = e.target.checked; // Update randomize field based on checkbox
    setSurveyQuestions(updatedQuestions); // Update state
  };

  // Handle Save
  const handleSave = async () => {
    const formData = { _id: id, created_by, questions: surveyQuestions };
    const params = { _id: id, formData };
    setLoading(true);
    const response = await updateSurvey(params);
    setLoading(false);
    if (response.success) {
      toast.success("Questions randomization set successfully!");
    } else {
      toast.error("Failed to randomize questions.");
    }
  };

  return (
    <main className="relative h-full flex flex-col">
      {/* Display Question Header */}
      <QuestionHeader id={id || ""} created_by={created_by || ""} name="Randomization" surveyName={surveyName || ""} />
      
      {/* Display Survey Questions with drag-and-drop reordering */}
      <div className="flex-grow">
        {loading && <Loader className="flex h-[50vh] justify-center items-center w-full" />}
        {!loading && surveyQuestions && surveyQuestions.length > 0 ? (
          <ul className="p-5">
            {surveyQuestions.map((question: any, index: number) => (
              <label
                key={question.question_id}
                className="border p-4 mb-2 border-secondary-200 text-secondary-300 cursor-pointer flex items-center gap-2"
              >
                <input
                  type="checkbox"
                  checked={question.randomize} // Show current state of randomize field
                  onChange={handleCheckboxChange(index)} // Handle change event for checkbox
                />
                <div>
                  <div>Question: {question.parameters?.question || question.question || "Untitled Question"}</div>
                  <div className="text-sm text-gray-500">Type: {question.type || question.question_type || "Unknown"}</div>
                </div>
              </label>
            ))}
          </ul>
        ) : (
          !loading && (
            <p className="w-full h-[40vh] flex justify-center items-center">No questions available.</p>
          )
        )}
      </div>

      {/* Save Changes Button */}
      <div className="w-full bg-white p-4 border-t border-gray-200 flex justify-end sticky bottom-0 z-10">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>
    </main>
  );
}

const SuspendedCreateSurveyPage = () => (
  <Suspense>
    <Page />
  </Suspense>
);

export default SuspendedCreateSurveyPage;
