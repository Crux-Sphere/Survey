"use client";

import QuestionHeader from "@/components/questions/QuestionHeader";
import Loader from "@/components/ui/Loader";
import { getSurvey, updateSurvey } from "@/networks/survey_networks";
import { errorToastStyles } from "@/utils/devData";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { VscThreeBars } from "react-icons/vsc";

function Page() {
  const [surveyQuestions, setSurveyQuestions] = useState<any[]>([]);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [draggingOverIndex, setDraggingOverIndex] = useState<number | null>(null); // Track the index where the drag is happening
  const [isValidDrag, setIsValidDrag] = useState<boolean>(true); // Track if the drag is valid
  const [loading, setLoading] = useState<boolean>(false);

  const params = useSearchParams();
  const id = params.get("id");
  const surveyName = params.get("name");
  const created_by = params.get("created_by");

  console.log(surveyQuestions);

  useEffect(() => {
    handleGetSurveyData();
  }, []);

  async function handleGetSurveyData() {
    const queryParams = { _id: id };
    setLoading(true);
    const response = await getSurvey(queryParams);
    console.log("response---->", response);
    setLoading(false);
    if (response.success) {
      if (response.data.questions) setSurveyQuestions(response.data.questions);
    } else {
      toast.error("Something went wrong while fetching survey data");
    }
  }

  // Handle drag start
  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    setDraggingIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  // Handle drag enter
  const handleDragEnter = (index: number) => {
    if (draggingIndex === null) return;

    // Check if the drop is allowed
    const valid = isValidDrop(draggingIndex, index);
    setIsValidDrag(valid);
    setDraggingOverIndex(index); // Set the index where the drag is happening
  };

  // Handle drag leave
  const handleDragLeave = () => {
    setDraggingOverIndex(null); // Reset the dragging over index when leaving
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
  };

  // Check if the target index is valid based on dependencies and children
  const isValidDrop = (draggingIndex: number, targetIndex: number) => {
    const draggedQuestion = surveyQuestions[draggingIndex];
    // Check for dependencies
    for (let dep of draggedQuestion.dependency) {
      const depIndex = surveyQuestions.findIndex((q) => q.question_id.toString() === dep.question);
      if (depIndex !== -1 && targetIndex <= depIndex) {
        return false;
      }
    }
    // Check for children
    for (let childId of draggedQuestion.children) {
      const childIndex = surveyQuestions.findIndex((q) => q.question_id === childId);
      if (childIndex !== -1 && targetIndex >= childIndex) {
        return false;
      }
    }

    return true;
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    e.preventDefault();
    if (draggingIndex === null) return;

    // Validate if the drop is allowed
    if (!isValidDrop(draggingIndex, index)) {
      setDraggingIndex(null);
      setDraggingOverIndex(null);
      toast.error(
        `Action not allowed. Please consider editing conditional display.`,
        errorToastStyles
      );
      return;
    }


    // Reorder questions
    const reorderedQuestions = [...surveyQuestions];
    const [draggedItem] = reorderedQuestions.splice(draggingIndex, 1);
    reorderedQuestions.splice(index, 0, draggedItem);

    setSurveyQuestions(reorderedQuestions);
    setDraggingIndex(null);
    setDraggingOverIndex(null); // Reset dragging over index after drop
  };

  // Handle Save
  const handleSave = async () => {
    const formData = { _id: id, created_by, questions: surveyQuestions };
    const params = { _id: id, formData };
    setLoading(true);
    const response = await updateSurvey(params);
    setLoading(false);
    if (response.success) {
      toast.success("Questions resequenced successfully!");
    } else {
      toast.error("Failed to resequence questions.");
    }
  };

  return (
    <main className="relative h-full flex flex-col">
      {/* Display Question Header */}
      <QuestionHeader id={id || ""} created_by={created_by || ""} name="Resequence" surveyName={surveyName || ""} />

      {/* Display Survey Questions with drag-and-drop reordering */}
      <div className="flex-grow">
        {loading && <Loader className="flex h-[50vh] justify-center items-center w-full" />}
        {!loading && surveyQuestions && surveyQuestions.length > 0 ? (
          <ul className="p-5">
            {surveyQuestions.map((question: any, index: number) => (
              <li
                key={question.question_id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDragEnter={() => handleDragEnter(index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                className={`p-4 mb-2 cursor-move flex items-center gap-2 ${
                  draggingOverIndex === index
                    ? isValidDrag
                      ? "border-2 border-primary-300 bg-primary-300 bg-opacity-10" // Valid drop target
                      : "border-2 border-red-500 bg-red-500 bg-opacity-10" // Invalid drop target
                    : "border border-secondary-200" // Default state
                }`}
              >
                <VscThreeBars />
                <div>Question: {question.parameters?.question || question.question || "Untitled Question"}</div>
                <div className="text-sm text-gray-500">Type: {question.type || question.question_type || "Unknown"}</div>
              </li>
            ))}
          </ul>
        ) : (
          !loading && <p className="w-full h-[40vh] flex justify-center items-center">No questions available.</p>
        )}
      </div>

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
