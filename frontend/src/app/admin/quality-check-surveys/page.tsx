"use client";

import ButtonFilled from "@/components/ui/buttons/ButtonFilled";
import Loader from "@/components/ui/Loader";
import useUser from "@/hooks/useUser";
import { getUser } from "@/networks/user_networks";
import { formatDate } from "@/utils/common_functions";
import { qualityCheckId } from "@/utils/constants";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function Page() {
  const [collectorSurveys, setCollectorSurveys] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalSurveys, setTotalSurveys] = useState<number>(0);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const userData = useUser();
  const router = useRouter();
  
  useEffect(() => {
    if(userData){
        getQualityCheckSurveys();
    }
  }, [userData, currentPage, itemsPerPage]);
  
  async function getQualityCheckSurveys() {
    setLoading(true);
    const response = await getUser({
      userId: userData.id,
      assignedSurveys: true,
      page: currentPage,
      limit: itemsPerPage,
    });
    console.log("collector is ---->", response);
    if (response.success) {
      const surveys = response.data.assigned_survey || response.data;
      setCollectorSurveys(surveys);
      
      // Extract pagination data - check both response.pagination and response.data.pagination
      const paginationData = response.pagination || response.data.pagination;
      console.log("Full response:", response);
      console.log("Pagination data found:", paginationData);
      
      if (paginationData) {
        const pages = paginationData.totalPages || 0;
        const total = paginationData.totalSurveys || 0;
        const perPage = paginationData.surveyPerPage || 10;
        
        setTotalPages(pages);
        setTotalSurveys(total);
        setItemsPerPage(perPage);
        
        console.log("✅ Setting pagination - totalPages:", pages, "totalSurveys:", total, "surveyPerPage:", perPage);
      } else {
        console.log("❌ No pagination data found in response");
      }
    } else {
      toast.error("Unable to retrieve collector");
    }
    setLoading(false);
  }

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) return <Loader />;
  
  console.log("Render - totalPages:", totalPages, "totalSurveys:", totalSurveys, "currentPage:", currentPage);
  
  return (
    <div className="w-full bg-[#ECF0FA] text-sm min-h-[calc(100vh-80px)]">
      {/* header */}
      <nav className="h-16 w-full py-3 px-8 flex justify-between">
        <div className="text-my-gray-200">
          <h1 className="text-2xl font-medium">Quality check's Surveys</h1>
        </div>
      </nav>

      {/* Surveys */}
      <div className="relative w-[96%] mx-auto text-sm mt-5 max-h-[calc(100vh-240px)] overflow-y-auto vertical-scrollbar">
        <div className="sticky top-0 left-0 z-10 grid grid-cols-5 text-white bg-dark-gray font-semibold py-[16px] rounded-tl-2xl rounded-tr-2xl border border-secondary-200">
          <p className="col-span-1 flex justify-center items-center">
            Survey name
          </p>
          <p className="col-span-1 flex justify-center items-center">
            Responses
          </p>
          <p className="col-span-1 flex justify-center items-center">
            Created at
          </p>
          <p className="col-span-1 flex justify-center items-center">Ac list</p>
          <p className="col-span-1 flex justify-center items-center">Action</p>
        </div>
        {loading && (
          <Loader className="h-[50vh] flex justify-center items-center w-full" />
        )}
        {!loading && collectorSurveys && collectorSurveys.length !== 0 ? (
          collectorSurveys.map((survey: any, index: number) => (
            <div
              key={index}
              className="bg-mid-gray border-2 grid p-2 grid-cols-5 gap-2 text-center text-black"
            >
              <p className="col-span-1 flex justify-center items-center font-semibold ">
                {survey.name}
              </p>
              <p className="col-span-1 flex justify-center items-center font-semibold ">
                {survey.response_count}
              </p>
              <p className="col-span-1 flex justify-center items-center ">
                {formatDate(survey.createdAt)}
              </p>
              <p className="col-span-1 flex justify-center items-center ">
              {!survey.ac_list && <p></p>}
              {survey.ac_list && survey.ac_list.length > 0 ? <p className="text-green-600 font-semibold">AC list included</p> : <p className="text-primary-300 font-semibold">AC list not included</p>}
              </p>
              <ButtonFilled onClick ={()=>router.push(`/admin/quality-check-surveys/survey-responses?survey_id=${survey._id}`)} className="w-fit mx-auto">
                View Responses
              </ButtonFilled>
            </div>
          ))
        ) : (
          <div className="flex justify-center items-center h-[20vh] w-full">
            No surveys found
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 0 && (
        <div className="flex justify-between items-center w-[96%] mx-auto mt-6 mb-4">
          {/* Items per page selector */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-dark-gray"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Page navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border ${
                currentPage === 1
                  ? "border-gray-300 text-gray-400 cursor-not-allowed"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <span className="text-sm font-medium text-gray-700 px-4">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg border ${
                currentPage === totalPages
                  ? "border-gray-300 text-gray-400 cursor-not-allowed"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Total records info */}
          <div className="text-sm text-gray-600">
            {totalSurveys} total surveys
          </div>
        </div>
      )}
    </div>
  );
}

export default Page;
