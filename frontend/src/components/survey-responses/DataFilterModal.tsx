import React from "react";
import ButtonBordered from "../ui/buttons/ButtonBordered";
import CustomModal from "../ui/Modal";
import ResponseFilterInput from "./ResponseFilterInput";

interface PropTypes {
  modalIsOpen: boolean;
  closeModal: () => void;
  surveyQuestions: any[];
  question: string;
  questionType: string;
  operator: string;
  response: string;
  setQuestionType: (val: string) => void;
  setQuestion: (val: string) => void;
  setOperator: (val: any) => void;
  setResponse: (val: any) => void;
  saveFilter: () => void;
}

const operatorOptions = {
  text: ["contains", "equals", "starts with", "ends with"],
  number: ["=", "!=", "<", "<=", ">", ">="],
  choice: ["equals", "not equals"],
};

function DataFilterModal({
  modalIsOpen,
  closeModal,
  surveyQuestions,
  question,
  questionType,
  operator,
  response,
  setQuestion,
  setQuestionType,
  setResponse,
  setOperator,
  saveFilter,
}: PropTypes) {
  const getOperatorOptions = (questionType: string) => {
    if (
      [
        "Single line Text Input",
        "Multiline Text Input",
        "Email",
        "Phone Number",
        "Checkbox List",
        "Checkbox List With Other",
        "Radio Grid",
        "DropDown Grid",
        "Single line Text Grid",
        "Number Grid",
        "Checkbox Grid",
      ].includes(questionType)
    ) {
      return operatorOptions.text;
    } else if (
      ["Number Input", "Number Point", "Rating", "Date"].includes(questionType)
    ) {
      return operatorOptions.number;
    } else if (
      ["Radio Button", "DropDown", "DropDown With Other"].includes(questionType)
    ) {
      return operatorOptions.choice;
    }
    return [];
  };

  const getDefaultOperator = (questionType: string) => {
    const options = getOperatorOptions(questionType);
    return options.length > 0 ? options[0] : ""; // Return first operator as default
  };

  
  const handleQuestionChange = (value: string) => {
    const selectedQuestion = surveyQuestions.find(
      (q: any) => Number(q.question_id) === Number(value)
    );
    if (selectedQuestion) {
      setQuestion(value);
      setQuestionType(selectedQuestion.type);
      setOperator(getDefaultOperator(selectedQuestion.type));
    } else {
      setQuestionType("");
    }
  };
  console.log("================>",response)
  return (
    <CustomModal open={modalIsOpen} closeModal={closeModal}>
      <div className="min-w-[500px] h-[270px] flex flex-col">
        <div className="relative z-10 text-primary-300 px-8 py-4 font-semibold border-b border-secondary-300 w-full shadow-md">
          Add filters
        </div>
        <form className="w-full h-full p-4 flex gap-10 justify-center items-center">
          {/* Question Select */}
          <div className="flex flex-col items-center gap-2">
            <label className="text-my-gray-200">Question</label>
            <select
              onChange={(e) => handleQuestionChange(e.target.value)}
              value={question}
              className="flex items-center border border-secondary-200 rounded-[20px] outline-none focus:ring focus:ring-primary-50 px-8 py-3 w-full"
            >
              <option value="" disabled>
                Select question
              </option>
              {surveyQuestions &&
                surveyQuestions.map((response: any, index: number) => (
                  <option
                    key={index}
                    value={response.question_id}
                    className="text-secondary-300 px-4 py-2 text-left border-b min-w-32 whitespace-nowrap"
                  >
                    {response.parameters?.question || null}
                  </option>
                ))}
            </select>
          </div>

          {/* Operator Input */}
          <div className="flex flex-col items-center gap-2">
            <label className="text-my-gray-200">Operator</label>
            <select
              disabled={question.trim().length === 0}
              onChange={(e) => setOperator(e.target.value)}
              value={operator}
              className="flex items-center border border-secondary-200 rounded-[20px] outline-none focus:ring focus:ring-primary-50 px-8 py-3 w-full disabled:cursor-not-allowed"
            >
              <option disabled>Select operator</option>
              {getOperatorOptions(questionType).map((option, idx) => (
                <option key={idx} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Response Input */}
          <div className="flex flex-col items-center gap-2">
            <label className="text-my-gray-200">Response</label>
            <ResponseFilterInput
              operator={operator}
              question={question}
              questionType={questionType}
              response={response}
              setResponse={setResponse}
              surveyQuestions={surveyQuestions}
            />
          </div>
        </form>
        <div className="flex gap-3 items-center p-4">
          <ButtonBordered
            className="disabled:bg-primary-100 disabled:cursor-not-allowed disabled:text-secondary-100"
            disabled={
              question.trim().length === 0 ||
              operator.trim().length === 0 ||
              response.trim().length === 0
            }
            onClick={saveFilter}
          >
            Save Filter
          </ButtonBordered>
          <ButtonBordered
            className="border-red-500 hover:bg-red-500 hover:text-white text-red-500"
            onClick={closeModal}
          >
            Cancel
          </ButtonBordered>
        </div>
      </div>
    </CustomModal>
  );
}

export default DataFilterModal;
