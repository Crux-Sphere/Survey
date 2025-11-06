"use client";

import QuestionHeader from '@/components/questions/QuestionHeader';
import ButtonBordered from '@/components/ui/buttons/ButtonBordered';
import Loader from '@/components/ui/Loader';
import { getSurvey, updateSurvey } from '@/networks/survey_networks';
import { useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { FaTimes } from 'react-icons/fa';
import { VscThreeBars } from "react-icons/vsc";

const operatorOptions = {
  text: ["contains", "equals", "starts with", "ends with"],
  number: ["=", "!=", "<", "<=", ">", ">="],
  choice: ["equals", "not equal"],
};

function Page() {
  const [surveyQuestions, setSurveyQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [show, setShow] = useState<number[]>([]);
  const [conditions, setConditions] = useState<{ question: string; operator: string; answer: string; type?: string }[][]>([]);

  const params = useSearchParams();
  const id = params.get("id");
  const surveyName = params.get("name");
  const created_by = params.get("created_by");

  useEffect(() => {
    handleGetSurveyData();
  }, []);
  useEffect(()=>{
    if(surveyQuestions){
      const allConditions : { question: string; operator: string; answer: string; type?: string }[][]  = [];
      surveyQuestions.forEach((question,index)=>{
        allConditions.push(question.dependency)
      })
      setConditions(allConditions);
    }
  },[surveyQuestions])

  async function handleGetSurveyData() {
    const queryParams = { _id: id };
    setLoading(true);
    const response = await getSurvey(queryParams);
    setLoading(false);
    if (response.success) {
      if(response.data.questions) setSurveyQuestions(response.data.questions);
    } else {
      toast.error("Something went wrong while fetching survey data");
    }
  }

  // Show and hide condition rows
  function toggleShow(index: number) {
    setShow((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });
  }

  // Add a new condition row
  const handleAddCondition = (index: number) => {
    setConditions((prev) => {
      const newConditions = [...prev];
      if (!newConditions[index]) {
        newConditions[index] = [];
      }
      newConditions[index] = [...newConditions[index], { question: "", operator: "", answer: "", type: "" }];
      return newConditions;
    });
  };

  // Remove a condition row
  const handleRemoveCondition = (qIndex: number, cIndex: number) => {
    setConditions((prev) => {
      return prev.map((conditionsArray, index) => {
        if (index === qIndex) {
          return conditionsArray.filter((_, cIndex2) => cIndex2 !== cIndex);
        }
        return conditionsArray;
      });
    });
  };

  // Handle condition changes
  const handleConditionChange = (qIndex: number, cIndex: number, field: string, value: string) => {
    setConditions((prev) => {
      const newConditions = [...prev];
      if (field === 'question') {
        const selectedQuestion = surveyQuestions.find(q => String(q.question_id) === value);
        newConditions[qIndex][cIndex] = {
          ...newConditions[qIndex][cIndex],
          [field]: value,
          type: selectedQuestion ? (selectedQuestion.type || selectedQuestion.question_type) : "",
        };
      } else {
        newConditions[qIndex][cIndex] = {
          ...newConditions[qIndex][cIndex],
          [field]: value,
        };
      }
      return newConditions;
    });
  };

  // Get the appropriate operator options based on the question type
  const getOperatorOptions = (questionType: string) => {
    if (["Single line Text Input", "Multiline Text Input", "Email", "Phone Number"].includes(questionType)) {
      return operatorOptions.text;
    } else if (["Number", "Number Point", "Rating", "Date"].includes(questionType)) {
      return operatorOptions.number;
    } else if (["Radio Button", "DropDown", "DropDown With Other", "Checkbox List", "Checkbox List With Other"].includes(questionType)) {
      return operatorOptions.choice;
    }
    return [];
  };

  async function handleSave(){
    console.log(conditions)
      conditions.forEach((condition,index)=>{
        if(condition){
          surveyQuestions[index].dependency = condition
          if(surveyQuestions[index].dependency.length > 0) surveyQuestions[index].randomize = false
          
          condition.forEach((cond)=>{
            const ind = surveyQuestions.findIndex(question => String(question.question_id) === cond.question)
            if(!surveyQuestions[ind].children.includes(surveyQuestions[index].question_id)){
              surveyQuestions[ind].children.push(surveyQuestions[index].question_id);
              surveyQuestions[ind].randomize = false
            }
          })
        }
      })
      const formData = { _id: id, created_by, questions: surveyQuestions };
      const params = { _id: id, formData };
      setLoading(true);
      const response = await updateSurvey(params);
      setLoading(false);
      if (response.success) {
        toast.success("Conditional display set successfully!");
      } else {
        toast.error("Failed to achieve conditional display of questions.");
      }
      
  }

  return (
    <main className="relative h-full flex flex-col">
      <QuestionHeader id={id || ""} created_by={created_by || ""} name="Conditional display" surveyName={surveyName || ""} />
      {loading && <Loader className="flex h-[50vh] justify-center items-center w-full" />}
      <div className='flex flex-grow gap-2 flex-col m-2 mt-5 mb-5'>
        {!loading && surveyQuestions.length > 0 ? (
          surveyQuestions.map((question, qIndex) => (
            <div key={qIndex} onClick={() => toggleShow(qIndex)} className='flex flex-col w-full justify-between cursor-pointer border border-secondary-200'>
              <div className='w-full flex items-center justify-between p-5 bg-white'>
                <p className='text-secondary-300 flex items-center gap-2'> <VscThreeBars/> {`Question ${qIndex + 1}: ${question.parameters?.question || question.question || "Untitled Question"}`}</p>
                <div className='flex gap-2 items-center'>
                  <p>{conditions[qIndex] ?  `(${conditions[qIndex].length})` : ""}</p>
                  {show.includes(qIndex) ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </div> 
              </div>
              {show.includes(qIndex) && (
                <div onClick={e => e.stopPropagation()} className='w-full h-full bg-primary-50 p-3'>
                  <div className='bg-white p-2'>
                    <ButtonBordered className='font-semibold' onClick={() => handleAddCondition(qIndex)}>Add Condition</ButtonBordered>

                    {conditions[qIndex]?.length > 0 && (
                      <div className='grid grid-cols-10 gap-4 mt-4'>
                        <div className='font-bold col-span-3'>Question</div>
                        <div className='font-bold col-span-3'>Operator</div>
                        <div className='font-bold col-span-3'>Answer</div>
                        <div></div> {/* For the delete button */}
                      </div>
                    )}

                    {conditions[qIndex]?.map((condition, cIndex) => (
                      <div key={cIndex} className='grid grid-cols-10 gap-4 mt-2'>
                        <select
                          
                          className="border p-2 col-span-3"
                          value={condition.question}
                          onChange={(e) => handleConditionChange(qIndex, cIndex, 'question', e.target.value)}
                        >
                          <option value="">Select Question</option>
                          {surveyQuestions.slice(0, qIndex).map((q, index) => (
                            <option key={index} value={q.question_id}>
                              {q.parameters?.question || q.question || "Untitled Question"}
                            </option>
                          ))}
                        </select>

                        <select
                          className="border p-2 col-span-3 disabled:cursor-not-allowed disabled:bg-secondary-200"
                          value={condition.operator}
                          onChange={(e) => handleConditionChange(qIndex, cIndex, 'operator', e.target.value)}
                          disabled={!condition.question} 
                        >
                          <option value="">Select Operator</option>
                          {getOperatorOptions(condition.type || question.type).map((op, index) => (
                            <option key={index} value={op}>
                              {op}
                            </option>
                          ))}
                        </select>

                        <input
                          className="border p-2 col-span-3 disabled:cursor-not-allowed disabled:bg-secondary-200"
                          type="text"
                          value={condition.answer}
                          onChange={(e) => handleConditionChange(qIndex, cIndex, 'answer', e.target.value)}
                          disabled={!condition.question || !condition.operator}
                        />

                        <button onClick={() => handleRemoveCondition(qIndex, cIndex)} className='text-red-500 flex justify-center items-center'>
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : !loading && (
          <p className="w-full h-[40vh] flex justify-center items-center">No questions available.</p>
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

