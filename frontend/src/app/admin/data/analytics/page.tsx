"use client";
import ButtonBordered from "@/components/ui/buttons/ButtonBordered";
import ButtonFilled from "@/components/ui/buttons/ButtonFilled";
import { getSurvey, getSurveyResponseStats } from "@/networks/survey_networks";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense, useRef } from "react";
import QuestionChart from "@/components/data/QuestionChart";
import CustomModal from "@/components/ui/Modal";
import { RxCross2 } from "react-icons/rx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { FaFileExport } from "react-icons/fa";
import toast from "react-hot-toast";
import useUser from "@/hooks/useUser";


const operatorOptions = {
  text: ["contains", "equals", "starts with", "ends with"],
  number: ["=", "!=", "<", "<=", ">", ">="],
  choice: ["equals", "not equals"],
};

function Page() {
  const [responseStats, setResponseStats] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("");
  const [appliedFilters, setAppliedFilters] = useState<
    { question: string; operator: string; response: string }[]
  >([]);
  const [filters, setFilters] = useState<
    { question: string; operator: string; response: string }[]
  >([]);
  const [question, setQuestion] = useState<string>("");
  const [modal, setModal] = useState<boolean>(false);
  const [surveyQuestions, setSurveyQuestions] = useState<any>(null);
  const [questionType, setQuestionType] = useState<string>("");
  const [operator, setOperator] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [downloading,setDownloading] = useState<boolean>(false);

  const user = useUser()
  console.log("user is --->",user)
  const isDA = user?.role.map((el:any)=>el.name).includes("Data Analyst")

  const searchParams = useSearchParams();
  const surveyID = searchParams.get("survey_id");
  useEffect(() => {
    getQuestions();
    fetchSurveyData();
  }, []);

  const router = useRouter();

  // event handlers
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

  const saveFilter = () => {
    setFilters([...filters, { question, operator, response }]);
    setModal(false);
  };

  const chartsRef = useRef<HTMLDivElement>(null);

  const exportChartsAsPDF = async () => {
    setDownloading(true);
    if (!chartsRef.current) {
      toast.error("Report not found!");
      return;
    }

    const pdf = new jsPDF("p", "mm", "a4");
    const charts = chartsRef.current.querySelectorAll(".chart-container");

    let yOffset = 10; // Starting Y offset for PDF
    let chartsOnPage = 0; // Track charts per page

    for (const chart of charts) {
      try {
        const canvas = await html2canvas(chart as HTMLElement, {
          scale: 1.5, // Lower scale for reduced size (adjustable)
          useCORS: true,
        });

        // Compress image data to reduce size
        const imgData = canvas.toDataURL("image/jpeg", 0.75); // Set quality (0.75 for smaller size)

        const imgWidth = 190; // Fit within A4 width
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Add chart to PDF
        pdf.addImage(imgData, "JPEG", 10, yOffset, imgWidth, imgHeight);
        yOffset += imgHeight + 10; // Add margin after chart
        chartsOnPage++;

        // Add new page after 2 charts
        if (chartsOnPage === 2) {
          pdf.addPage();
          yOffset = 10; // Reset Y offset for new page
          chartsOnPage = 0; // Reset charts count for new page
        }
      } catch (error) {
        console.error("Error capturing chart:", error);
      }
    }

    pdf.save("question-charts.pdf");
    setDownloading(false);
  };

  // api calls
  async function fetchSurveyData() {
    const response = await getSurveyResponseStats({
      survey_id: surveyID,
      filters: appliedFilters,
      userId: user?.id,
    });
    console.log("response stats data--->", response.data);
    if (response.success) {
      setResponseStats(response.data);
    }
  }

  async function getQuestions() {
    const response = await getSurvey({ _id: surveyID });
    console.log("res--------------------------------->", response);
    const questions = response.data.questions.map((el: any) => el);
    setSurveyQuestions(questions);
  }

  return (
    <div className="w-full bg-[#ECF0FA]  min-h-[calc(100vh-80px)] font-medium ">
      <nav className="h-16 w-full py-3 px-8 flex justify-between font-semibold ">
        <div className="text-my-gray-200 items-center my-auto">
          <p className="text-sm ">Analytics</p>
        </div>
        <div className="flex space-x-2 items-center">
          <ButtonFilled
            onClick={() =>
              router.push(`/admin/data/survey-responses?survey_id=${surveyID}`)
            }
            className="bg-dark-gray"
          >
            Responses
          </ButtonFilled>
          <ButtonFilled
            onClick={() => setShowFilters(!showFilters)}
            className=""
          >
            Filters
          </ButtonFilled>
          {
            !isDA && (
              <div className="p-4">
                <ButtonFilled className="gap-2 min-w-52" loading={downloading} onClick={exportChartsAsPDF}>
                <FaFileExport /> <p>Export as PDF</p>
                </ButtonFilled>
              </div>
            )
          }
          <ButtonFilled onClick={() => router.back()} className="bg-dark-gray">
            Back
          </ButtonFilled>
        </div>
      </nav>

      {showFilters && (
        <div className="p-4 w-full ">
          <div className="flex flex-col justify-center-center gap-3">
            <div className="flex items-center gap-3">
              <ButtonFilled
                className=" flex justify-center items-center w-fit"
                onClick={() => setModal(true)}
              >
                Data filter +
              </ButtonFilled>
              <ButtonFilled onClick={() => fetchSurveyData()} className="w-fit">
                Apply
              </ButtonFilled>
            </div>
            <select
              onChange={(e) => {
                const filt = JSON.parse(e.target.value);
                const obj = appliedFilters.find(
                  (el) =>
                    el.question === filt.question &&
                    el.operator === filt.operator &&
                    el.response === filt.response
                );
                if (obj) return;
                else
                  setAppliedFilters((prev) => [
                    ...prev,
                    JSON.parse(e.target.value),
                  ]);
              }}
              value={selectedFilter}
              name="filters"
              id="filters"
              className="outline-none shadow-lg px-6 py-3 w-[30%] rounded-[20px]"
            >
              <option
                className="outline-none shadow-lg px-6 py-3 w-[30%] rounded-[20px]"
                value=""
                disabled
                selected
              >
                Select filter
              </option>
              {filters &&
                filters.length > 0 &&
                filters.map((filter) => {
                  let questionText = "";
                  if (surveyQuestions) {
                    const questionResponse = surveyQuestions?.find(
                      (res: any) =>
                        Number(res.question_id) === Number(filter.question)
                    );
                    if (questionResponse) {
                      questionText = questionResponse.parameters.question;
                    }
                  }
                  const value = JSON.stringify({
                    question: filter.question,
                    operator: filter.operator,
                    response: filter.response,
                  });
                  return (
                    <option value={value} key={filter.question}>
                      {`${questionText} ${filter.operator} ${filter.response}`}
                    </option>
                  );
                })}
            </select>
            <div className="flex flex-col">
              {appliedFilters.map((el) => {
                const questionResponse = surveyQuestions?.find(
                  (res: any) => Number(res.question_id) === Number(el.question)
                );
                let questionText;
                if (questionResponse) {
                  questionText = questionResponse.parameters.question;
                }
                return (
                  <div className="flex justify-between mt-5 border border-secondary-200 bg-white rounded-[20px] w-1/2 px-4 py-2">
                    <h2>{`${questionText} ${el.operator} ${el.response}`}</h2>
                    <button
                      onClick={() =>
                        setAppliedFilters((prev) =>
                          prev.filter(
                            (fil) =>
                              !(
                                fil.question === el.question &&
                                fil.operator === el.operator &&
                                fil.response === el.response
                              )
                          )
                        )
                      }
                    >
                      <RxCross2 />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div ref={chartsRef}  className="p-5 text-sm text-my-gray-200">
        {responseStats &&
          responseStats.length > 0 &&
          responseStats.map((responseData: any, index: number) => {
            const exclude = [
              "Single line Text Input",
              "Multiline Text Input",
              "Email",
              "Phone Number",
              "Number Input",
              "Date",
            ];
            if (exclude.includes(responseData.question_type)) return null;
            return (
              <QuestionChart
                key={index}
                questionTitle={responseData.question}
                responses={responseData.responses}
                totalResponses={responseData.total_responses}
              />
            );
          })}
        <div className="flex justify-center items-center h-[20vh] w-full">
          <p className="text-sm">
            <span className="font-bold">Note:</span> The charts are only visible
            for questions like Radio buttons, checkboxes etc
          </p>
        </div>
      </div>
      <CustomModal open={modal} closeModal={() => setModal(false)}>
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
                className="flex items-center border border-secondary-200 rounded-md px-8 py-3 w-full"
              >
                <option value="" disabled selected>
                  Select question
                </option>
                {surveyQuestions &&
                  surveyQuestions.map((response: any, index: number) => (
                    <option
                      key={index}
                      value={response.question_id}
                      className="text-secondary-300 px-4 py-2 text-left border-b min-w-24 whitespace-nowrap"
                    >
                      {response.parameters.question}
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
                className="flex items-center border border-secondary-200 rounded-md px-8 py-3 w-full disabled:cursor-not-allowed"
              >
                <option disabled selected>
                  Select operator
                </option>
                {getOperatorOptions(questionType).map((option) => (
                  <option value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Response Input */}
            <div className="flex flex-col items-center gap-2">
              <label className="text-my-gray-200">Response</label>
              <input
                disabled={
                  questionType.trim().length === 0 ||
                  operator.trim().length === 0
                }
                onChange={(e) => setResponse(e.target.value)}
                value={response}
                className="flex items-center border border-secondary-200 rounded-md px-8 py-3 w-full disabled:cursor-not-allowed"
                type={
                  surveyQuestions?.find(
                    (q: any) => Number(question) === Number(q.question_id)
                  )?.type === "Date"
                    ? "date"
                    : "text"
                }
                placeholder="Enter response"
              />
            </div>
          </form>
          <div className="flex gap-3 items-center p-4">
            <ButtonFilled
              className="disabled:bg-primary-100 disabled:cursor-not-allowed disabled:text-secondary-100"
              disabled={
                question.trim().length === 0 ||
                operator.trim().length === 0 ||
                response.trim().length === 0
              }
              onClick={saveFilter}
            >
              Save Filter
            </ButtonFilled>
            <ButtonBordered
              className="border-red-500 hover:bg-red-500 hover:text-white text-red-500"
              onClick={() => setModal(false)}
            >
              Cancel
            </ButtonBordered>
          </div>
        </div>
      </CustomModal>
    </div>
  );
}

const SuspendedCreateSurveyPage = () => (
  <Suspense>
    <Page />
  </Suspense>
);

export default SuspendedCreateSurveyPage;
