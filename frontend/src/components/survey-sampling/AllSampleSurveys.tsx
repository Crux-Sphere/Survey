"use client";

import { getSampleSurveys } from "@/networks/sampling_networks";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Loader from "../ui/Loader";
import { formatDate } from "@/utils/common_functions";
import ButtonFilled from "../ui/buttons/ButtonFilled";
import { IoIosAddCircle } from "react-icons/io";
import ChooseSurveyModal from "./ChooseSurveyModal";
import { useRouter } from "next/navigation";
import Pagination from "../ui/pagination/Pagination";
import Button from "@mui/material/Button";

function AllSampleSurveys() {
  // states
  const [sampleSurveys, setSampleSurveys] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [chooseSurveyModal, setChooseSurveyModal] = useState<boolean>(false);
  const [refetch, setRefetch] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageLimit, setPageLimit] = useState<number>(10);
  const [totalResponsePages, setTotalResponsePages] = useState<number>(0);
  const router = useRouter();

  //   event handlers
  const handleChooseSurvey = () => {
    setChooseSurveyModal(true);
  };

  //   api calls
  async function fetchSampleSurveys() {
    setLoading(true);
    const response = await getSampleSurveys({ page, limit: pageLimit });
    if (response.success) {
      setSampleSurveys(response.data);
      setPage(response.pagination.currentPage);
      setPageLimit(response.pagination.limit);
      setTotalResponsePages(response.pagination.totalPages);
    } else {
      toast.error("Error fetching sample surveys");
    }
    setLoading(false);
  }
  useEffect(() => {
    fetchSampleSurveys();
  }, [refetch, page, pageLimit]);

  return (
    <div
      className={`w-[full py-5 flex flex-col overflow-y-auto vertical-scrollbar px-8`}
    >
      {/* navabr */}
        <div className="flex justify-between items-center">
          <h1 className="text-[18px] font-semibold">Sample Surveys</h1>
          <Button
            onClick={handleChooseSurvey}
            className="flex gap-1 items-center btn-custom !bg-orange-600 !text-white"
          >
            <IoIosAddCircle className="text-2xl" /> Add Sample
          </Button>
        </div>
      {loading && (
        <Loader className="h-[40vh] w-full flex justify-center items-center text-primary-300" />
      )}

      {sampleSurveys && sampleSurveys.length > 0 && (
        <div className="relative overflow-x-auto mt-5 bg-white p-3 rounded-md shadow-md">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  All surveys
                </th>
                <th scope="col" className="px-6 py-3">
                  Total responses
                </th>
                <th scope="col" className="px-6 py-3">
                  Date created
                </th>
              </tr>
            </thead>

            <tbody>
              {!loading && sampleSurveys && sampleSurveys.length > 0
                ? sampleSurveys.map((el: any, index: number) => (
                    <tr
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                      onClick={() => {
                        router.push(
                          `/admin/survey-sampling/samples?survey_id=${el._id}`
                        );
                      }}
                      key={index}
                    >
                      <td className="px-6 py-4 font-[500] cursor-pointer text-blue-600 hover:text-gray-800">{el.name}</td>
                      <td className="px-6 py-4 font-[500]">
                        {el.response_count || 0}
                      </td>
                      <td className="px-6 py-4 font-[500]">
                        {formatDate(el.createdAt)}
                      </td>
                    </tr>
                  ))
                : !loading && (
                  <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                     <td className="px-6 py-10 font-[500]" colSpan={3}>
                    <div className="w-full flex justify-center items-center font-semibold text-secondary-300 flex-col gap-5">
                      <img
                        src="/icons/no-data.png"
                        className="object-contain h-20"
                      />
                      <p>No sample surveys</p>
                      <ButtonFilled
                        onClick={handleChooseSurvey}
                        className="flex gap-3 items-center"
                      >
                        <IoIosAddCircle className="text-2xl" /> Add Sample
                      </ButtonFilled>
                    </div>
                    </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>
      )}


      <Pagination
        page={page}
        pageLimit={pageLimit}
        setPage={setPage}
        setPageLimit={setPageLimit}
        totalResponsePages={totalResponsePages}
      />
      <ChooseSurveyModal
        refetch={() => setRefetch(!refetch)}
        open={chooseSurveyModal}
        closeModal={() => setChooseSurveyModal(false)}
      />
    </div>
  );
}

export default AllSampleSurveys;
