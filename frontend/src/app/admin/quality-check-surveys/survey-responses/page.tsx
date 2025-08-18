"use client";

import ButtonFilled from "@/components/ui/buttons/ButtonFilled";
import FilledGreyButton from "@/components/ui/buttons/FilledGreyButton";
import TwoDatePicker from "@/components/ui/date/TwoDatePicker";
import type { State } from "@popperjs/core";
import { Suspense, useEffect, useState } from "react";
import {
  downloadResponses,
  getSurveyResponses,
} from "@/networks/response_networks";
import { useSearchParams } from "next/navigation";
import { getAllUsers, getPannaPramukhByAcList } from "@/networks/user_networks";

import { useRouter } from "next/navigation"; // For routing
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";
import { useJsApiLoader } from "@react-google-maps/api";
import Select from "react-select";
import { getSurvey } from "@/networks/survey_networks";
import Filters from "@/components/survey-responses/Filters";
import DataFilterModal from "@/components/survey-responses/DataFilterModal";
import AssignPannaPramukhModal from "@/components/survey-responses/AssignPannaPramukhModal";
import Image from "next/image";
import survey_analytics_calender from "/public/images/calendar_new.png";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { qualityCheckId, surveyCollectorId } from "@/utils/constants";
import useUser from "@/hooks/useUser";
import ResponseGrid from "@/components/qualityCheck/ResponseGrid";
import QualityResponseModal from "@/components/survey-responses/QualityResponseModal";
import Select2 from "react-select";
import { SlCalender } from "react-icons/sl";
import StyledTwoDatePicker from "@/components/ui/date/StyledTwoDatePicker";

function Page() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [responseModalIsOpen, setResponseModalIsOpen] = useState(false);
  const [questionType, setQuestionType] = useState<string>("");
  const [filters, setFilters] = useState<
    { question: string; operator: string; response: string }[]
  >([]);
  const [userId, setUserId] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [operator, setOperator] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [selectedFilter, setSelectedFilter] = useState<string>("");
  const [appliedFilters, setAppliedFilters] = useState<
    { question: string; operator: string; response: string }[]
  >([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [reset, setReset] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [more, setMore] = useState<string | null>(null);
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  const [mapModalIsOpen, setMapModalIsOpen] = useState<boolean>(false);
  const [questions, setQuestions] = useState<any[] | null>(null);
  const [assignMode, setAssignMode] = useState<boolean>(false);
  const [userModal, setUserModal] = useState<boolean>(false);
  const [userSearch, setUserSearch] = useState<string | null>(null);
  const [pannaPramukh, setPannaPramukh] = useState<any>(null);
  const [selectedPanna, setSelectedPanna] = useState<string | null>(null);
  const [surveyQuestions, setSurveyQuestions] = useState<any>(null);
  const [coordinates, setCoordinates] = useState<{ lat: 0; lng: 0 }>({
    lat: 0,
    lng: 0,
  });

  const [acFilters, setAcFilters] = useState<string[]>([]);
  const [boothFilters, setBoothFilters] = useState<string[]>([]);

  //  pagination
  const [totalResponsePages, setTotalResponsePages] = useState<number>(1);
  const [pageLimit, setPageLimit] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  // downloading
  const [downloading, setDownloading] = useState<boolean>(false);
  const [acList, setAcList] = useState<any>([]);

  const searchParams = useSearchParams();
  const userData = useUser();
  console.log(userData);
  const surveyId = searchParams.get("survey_id");
  const router = useRouter();
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyBpirs1ultpLYZLYyGa-837EVQIuGA6Rv0",
  });
  useEffect(() => {
    getQuestions();
    if (userData) {
      getUserResponses();
    }
    getUsers();
  }, [reset, page, pageLimit, userData, acFilters, boothFilters]);

  useEffect(() => {
    if (acList.length > 0) {
      handleGetPannaPramukh();
    }
  }, [userSearch, acList]);

  async function getUserResponses() {
    let nStartDate, nEndDate;
    if (startDate && endDate) {
      nStartDate = new Date(startDate || "");
      nEndDate = new Date(endDate || "");
      nStartDate.setDate(nStartDate.getDate() + 1);
      nEndDate.setDate(nEndDate.getDate() + 1);
    }
    const params = {
      surveyId,
      startDate: nStartDate,
      endDate: nEndDate,
      userId: userData.id,
      filters: appliedFilters,
      limit: pageLimit,
      page,
      boothFilters,
      acFilters,
    };
    setLoading(true);
    const response = await getSurveyResponses(params);
    setResponses(response.data);
    setTotalResponsePages(response.totalPages);
    console.log("responses of responses ------>", response);
    if (response.data && response.data.length > 0) {
      setQuestions(
        response.data[0].responses.map((res: any) => ({
          question: res.question,
          question_id: res.question_id,
        }))
      );
    }
    setLoading(false);
  }

  async function getQuestions() {
    const response = await getSurvey({ _id: surveyId });
    console.log("current survey-->", response);
    if (response.success) {
      console.log("setting ac_list", response.data.ac_list);
      setAcList(response.data.ac_list);
      const questions = response.data.questions.map((el: any) => el);
      setSurveyQuestions(questions);
    } else {
      toast.error("Error fetching the survey!");
    }
  }

  async function getUsers() {
    // setLoading(true);
    const response = await getAllUsers({ selectedRole: surveyCollectorId });
    console.log("users-------->", response.data);
    setUsers(response.data);
    // setLoading(false);
  }
  async function handleGetPannaPramukh() {
    // setLoading(true);
    console.log("ac list is coming  --->", acList);
    const response = await getPannaPramukhByAcList({
      ac_list: acList,
      filter: userSearch,
    });
    console.log("panna below-------->", response);
    setPannaPramukh(response);
    // setLoading(false);
  }

  const openModal = () => {
    setModalIsOpen(true);
  };
  const closeModal = () => {
    setModalIsOpen(false);
    clearModalInputs(); // Clear inputs when closing the modal
  };

  const clearModalInputs = () => {
    setQuestion("");
    setOperator("");
    setResponse("");
  };

  const saveFilter = () => {
    setFilters([...filters, { question, operator, response }]);
    closeModal();
  };

  // Function to handle export
  // const exportToExcel = async () => {
  //   try {
  //     setDownloading(true);
  //     let nStartDate, nEndDate;
  //     if (startDate && endDate) {
  //       nStartDate = new Date(startDate || "");
  //       nEndDate = new Date(endDate || "");
  //       nStartDate.setDate(nStartDate.getDate() + 1);
  //       nEndDate.setDate(nEndDate.getDate() + 1);
  //     }
  //     const params = {
  //       surveyId,
  //       startDate: nStartDate,
  //       endDate: nEndDate,
  //       userId,
  //       filters: appliedFilters,
  //       download: true,
  //       acFilters,
  //       boothFilters,
  //     };
  //     let filename = "response.xlsx";
  //     const response: any = await downloadResponses(params);

  //     const contentDisposition = response.headers["content-disposition"];
  //     console.log("header ======>", contentDisposition);
  //     const file = contentDisposition.split("filename=")[1].replace(/"/g, "");
  //     if (file) filename = file;

  //     const url = window.URL.createObjectURL(new Blob([response.data]));
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.setAttribute("download", filename);
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   } catch (error) {
  //     toast.error("Failed to export to Excel");
  //   } finally {
  //     setDownloading(false);
  //   }
  // };

  const options = users?.map((user) => ({
    value: user._id,
    label: user.name,
  }));

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value, 10);
    setPageLimit(newLimit);
  };

  const handleNextPage = () => {
    setPage(page + 1);
  };

  const handlePreviousPage = () => {
    setPage(page - 1);
  };

  return (
    <div className="flex flex-col w-full font-medium bg-light-gray">
      <nav className="w-full py-3 px-8 flex flex-col gap-10 font-semibold">
        <h3 className="text-[24px] font-semibold">Survey Response</h3>

        {/* <div className="flex w-full gap-12">
          <Filters
            appliedFilters={appliedFilters}
            filters={filters}
            responses={responses}
            selectedFilter={selectedFilter}
            setAppliedFilters={setAppliedFilters}
            setSelectedFilter={setSelectedFilter}
            surveyQuestions={surveyQuestions}
          />
          <div className="flex space-x-2 text-black text-base font-semibold">
            <ButtonFilled
              loading={downloading}
              onClick={exportToExcel}
              className="rounded-[20px] h-fit px-4 py-2 w-44 justify-center"
            >
              Export to Excel
            </ButtonFilled>
            <FilledGreyButton
              onClick={() => router.back()}
              className="rounded-[20px] h-fit px-4 py-2"
            >
              Back
            </FilledGreyButton>
          </div>
        </div> */}

        <div className="flex w-full gap-12">
          <Filters
            appliedFilters={appliedFilters}
            filters={filters}
            responses={responses}
            selectedFilter={selectedFilter}
            setAppliedFilters={setAppliedFilters}
            setSelectedFilter={setSelectedFilter}
            surveyQuestions={surveyQuestions}
          />

          <div>
            <div className="flex space-x-2 text-black text-base font-semibold">
              {/* <ButtonFilled
                view={
                  "btn-custom bg-green-500 flex items-center justify-center !text-[13px] !rounded-md !text-white !h-[40px] !w-[140px]"
                }
                loading={downloading}
                onClick={exportToExcel}
              >
                Export to Excel
              </ButtonFilled> */}
              <FilledGreyButton
                onClick={() => router.back()}
                className="btn-custom !bg-gray-600 flex items-center justify-center !text-[13px] !rounded-md !text-white !h-[40px]"
              >
                Back
              </FilledGreyButton>
            </div>
          </div>
        </div>
      </nav>

      {/* <div className="p-5 font-semibold text-sm ">
        <div className="bg-light-gray space-y-4 w-full rounded-lg px-4 py-6">
          <div className="w-[780px] space-y-8 pb-6 ">
            <div className="flex gap-10">
              
              <div>
                <div className="flex gap-3 items-center mb-5">
                  <h1 className="">Date Range</h1>
                  <Image
                    src={survey_analytics_calender.src}
                    alt="calender"
                    height={18}
                    width={18}
                  />
                </div>
                <div className="w-fit">
                  <TwoDatePicker
                    className="w-[352px] h-10"
                    startDate={startDate}
                    endDate={endDate}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                  />
                </div>
              </div>

              <ButtonFilled
                className=" flex justify-center items-center h-fit self-end"
                onClick={openModal}
              >
                Data filter +
              </ButtonFilled>
            </div>

            <div className="flex gap-5 items-center">
              <div className="flex flex-col space-y-2 w-[352px]">
                <Select
                  value={options.find((option) => option.value === userId)}
                  onChange={(selectedOption) =>
                    setUserId(selectedOption?.value || "")
                  }
                  options={options}
                  placeholder="Select user"
                  classNamePrefix="react-select"
                  isSearchable={true} // Enables search
                />
              </div>


              <div className="flex space-x-4">
                <FilledGreyButton
                  onClick={() => {
                    setStartDate(null);
                    setEndDate(null);
                    setUserId("");
                    setAppliedFilters([]);
                    setReset(!reset);
                  }}
                  className="bg-dark-gray text-white"
                >
                  Reset
                </FilledGreyButton>
                <ButtonFilled
                  disabled={
                    appliedFilters.length === 0 &&
                    !userId.trim() &&
                    !startDate &&
                    !endDate
                  }
                  onClick={() => {
                    if ((startDate && !endDate) || (endDate && !startDate)) {
                      toast.error("Please select a complete date range!");
                      return;
                    } else {
                      getUserResponses();
                    }
                  }}
                  className="disabled:cursor-not-allowed disabled:bg-primary-100 disabled:text-secondary-100"
                >
                  Apply
                </ButtonFilled>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      <div className="mt-2 font-semibold text-sm ">
        <div className="bg-light-gray  w-full rounded-md shadow-md px-4 py-6 mb-5">
          <div className="w-full">
            <div className="flex gap-10">
              {/* Date Range */}
              <div>
                <div className="flex gap-3 items-center mb-5">
                  <h2 className="text-[16px]">Date Range</h2>
                  <SlCalender size={20} />
                </div>
                <div className="w-fit flex items-center gap-4">


                  {/* <TwoDatePicker
                    className="w-[352px] h-10 relative"
                    startDate={startDate}
                    endDate={endDate}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                    popperModifiers={[
                      {
                        name: "customStyle",
                        enabled: true,
                        phase: "write",
                        fn: (data: { state: any }) => {
                          const { state } = data;
                          if (state && state.styles && state.styles.popper) {
                            Object.assign(state.styles.popper, {
                              zIndex: 10,
                              transform: "translate(-5px, 50px)",
                            });
                          }
                        },
                      },
                    ]}
                  /> */}

                  <StyledTwoDatePicker
                    className="w-[352px] h-10 relative"
                    startDate={startDate}
                    endDate={endDate}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                  />

                  <ButtonFilled
                    className="btn-custom bg-orange-500 flex items-center justify-center !text-[13px] !rounded-md !text-white !h-[40px] !w-[180px]"
                    onClick={openModal}
                  >
                    Advanced data filter
                  </ButtonFilled>
                </div>
              </div>
            </div>

            <div className="flex gap-5 items-center pt-4">
              {/* Selected User */}
              <div className="flex flex-col  w-[352px]">
                {/* <Select2
                  value={options.find((option) => option.value === userId)}
                  onChange={(selectedOption) =>
                    setUserId(selectedOption?.value || "")
                  }
                  options={options}
                  placeholder="Select user"
                  classNamePrefix="react-select"
                  isSearchable={true} // Enables search
                  styles={{
                    menu: (provided) => ({
                      ...provided,
                      zIndex: 100,
                    }),
                  }}
                /> */}
                {/* ac filter here */}
                {/* AC MultiSelect */}
                {acList && acList.length > 0 && (
                  <div className="mt-2">
                    <label className="block text-xs mb-1">AC Filter</label>
                    <Select2
                      isMulti
                      options={acList.map((ac: any) => ({
                        value: ac.ac_no,
                        label: ac.ac_no,
                      }))}
                      value={acFilters.map((ac) => ({ value: ac, label: ac }))}
                      onChange={(selected) => {
                        const values = (selected as any[]).map(
                          (item) => item.value
                        );
                        setAcFilters(values);
                      }}
                      styles={{
                        menu: (provided) => ({
                          ...provided,
                          zIndex: 100,
                        }),
                      }}
                      placeholder="Select AC(s)"
                      classNamePrefix="react-select"
                    />
                  </div>
                )}
                {/* Booth MultiSelect */}
                {acList && acList.length > 0 && (
                  <div className="mt-2">
                    <label className="block text-xs mb-1">Booth Filter</label>
                    <Select2
                      isMulti
                      options={
                        // If you have booth list per AC, replace acList with booth list
                        acList.flatMap((ac: any) =>
                          (ac.booth_numbers || []).map((booth: any) => ({
                            value: booth,
                            label: booth,
                          }))
                        )
                      }
                      value={boothFilters.map((booth) => ({
                        value: booth,
                        label: booth,
                      }))}
                      onChange={(selected) => {
                        const values = (selected as any[]).map(
                          (item) => item.value
                        );
                        setBoothFilters(values);
                      }}
                      styles={{
                        menu: (provided) => ({
                          ...provided,
                          zIndex: 100,
                        }),
                      }}
                      placeholder="Select Booth(s)"
                      classNamePrefix="react-select"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 self-end">
                <FilledGreyButton
                  onClick={() => {
                    setStartDate(null);
                    setEndDate(null);
                    setUserId("");
                    setAppliedFilters([]);
                    setReset(!reset);
                    setAcFilters([]);
                    setBoothFilters([]);
                  }}
                  className="btn-custom bg-gray-800 flex items-center justify-center !text-[13px] !rounded-md !text-white !h-[40px]"
                >
                  Reset
                </FilledGreyButton>
                <ButtonFilled
                  disabled={
                    appliedFilters.length === 0 &&
                    !userId.trim() &&
                    !startDate &&
                    !endDate
                  }
                  onClick={() => {
                    if ((startDate && !endDate) || (endDate && !startDate)) {
                      toast.error("Please select a complete date range!");
                      return;
                    } else {
                      getUserResponses();
                    }
                  }}
                  className="btn-custom bg-orange-700 flex items-center justify-center !text-[13px] !rounded-md !text-white !h-[40px]"
                >
                  Apply
                </ButtonFilled>
              </div>
            </div>

            {/* <div className="flex gap-2 pt-3">
                    {acList && acList.length > 0 && (
                      <ButtonFilled
                        onClick={() => setUserModal(true)}
                        className="text-blue-700 hover:text-gray-900 text-[14px]"
                      >
                        Assign Data
                      </ButtonFilled>
                    )}
                    <ButtonFilled
                      onClick={() => setBoothModal(true)}
                      className="text-blue-700 hover:text-gray-900 text-[14px]"
                    >
                      Assign Booth
                    </ButtonFilled>
                  </div> */}
          </div>
        </div>
      </div>
      {loading && (
        <Loader className="h-[30vh] w-full flex justify-center items-center" />
      )}
      {!loading && responses && responses.length > 0 ? (
        <ResponseGrid
          selectedPanna={selectedPanna}
          more={more}
          responses={responses}
          setMapModalIsOpen={setMapModalIsOpen}
          setMore={setMore}
          setResponseModalIsOpen={setResponseModalIsOpen}
          setSelectedResponse={setSelectedResponse}
          users={users}
          setResponses={setResponses}
          assignMode={assignMode}
          setAssignedMode={setAssignMode}
          getUserResponses={getUserResponses}
          setSelectedPanna={setSelectedPanna}
          update={() => setReset(!reset)}
          page={page}
          pageLimit={pageLimit}
        />
      ) : (
        !loading && (
          <div className="flex w-full justify-center items-center h-[30vh]">
            <p>No responses found</p>
          </div>
        )
      )}
      {/* Pagination Controls */}
      {!loading && (
        <div className="flex gap-3 items-center my-4 ml-3">
          {/* Limit Select */}
          <div>
            <label htmlFor="limit-select" className="mr-2">
              Show:
            </label>
            <select
              id="limit-select"
              value={pageLimit}
              onChange={handleLimitChange}
              className="p-2 border rounded-md"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePreviousPage}
              disabled={page === 1}
              className="p-2 border rounded-md disabled:opacity-50"
            >
              <IoIosArrowBack />
            </button>
            <span>
              Page {page} of {totalResponsePages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={page === totalResponsePages}
              className="p-2 border rounded-md disabled:opacity-50"
            >
              <IoIosArrowForward />
            </button>
          </div>
        </div>
      )}

      {/* Custom Modal for Data Filter */}
      <DataFilterModal
        modalIsOpen={modalIsOpen}
        closeModal={closeModal}
        surveyQuestions={surveyQuestions}
        question={question}
        questionType={questionType}
        operator={operator}
        response={response}
        setQuestionType={setQuestionType}
        setQuestion={setQuestion}
        setOperator={setOperator}
        setResponse={setResponse}
        saveFilter={saveFilter}
      />

      {/* modal for response */}
      <QualityResponseModal
        responseModalIsOpen={responseModalIsOpen}
        selectedResponse={selectedResponse}
        setResponseModalIsOpen={setResponseModalIsOpen}
        users={users}
      />

      {/* Modal for assigning panna pramukh */}
      <AssignPannaPramukhModal
        assignMode={assignMode}
        pannaPramukh={pannaPramukh}
        selectedPanna={selectedPanna}
        setAssignMode={setAssignMode}
        setSelectedPanna={setSelectedPanna}
        setUserModal={setUserModal}
        setUserSearch={setUserSearch}
        userModal={userModal}
        userSearch={userSearch || ""}
      />
    </div>
  );
}

const SuspendedCreateSurveyPage = () => (
  <Suspense>
    <Page />
  </Suspense>
);

export default SuspendedCreateSurveyPage;
