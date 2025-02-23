"use client";
import ButtonBordered from "@/components/ui/buttons/ButtonBordered";
import ButtonFilled from "@/components/ui/buttons/ButtonFilled";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BsPieChart } from "react-icons/bs";
import Loader from "@/components/ui/Loader";
import { getAllSurveyResponses } from "@/networks/response_networks";
import { formatDate } from "@/utils/common_functions";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import Button from "@mui/material/Button";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

function page() {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [reset, setReset] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageLimit, setPageLimit] = useState<number>(10);
  const [totalResponsePages, setTotalResponsePages] = useState<number>(0);

  const router = useRouter();

  console.log(data);
  useEffect(() => {
    getResponses();
  }, [sortOrder, reset, page, pageLimit]);

  async function getResponses() {
    const params = { search: searchValue, sortOrder, page, limit: pageLimit };
    setLoading(true);
    const response = await getAllSurveyResponses(params);
    if (response.success) {
      console.log("response -----", response);
      setTotalResponsePages(response.pagination.totalPages);
      setPage(response.pagination.currentPage);
      setData(response.data);
    }
    setLoading(false);
  }

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value, 10);
    setPageLimit(newLimit);
    setPage(1);
  };

  const handleNextPage = () => {
    if (page < totalResponsePages) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleSortOrder = (event: SelectChangeEvent) => {
    setSortOrder(event.target.value as string);
  };

  return (
    <div className="w-full font-medium bg-[#ECF0FA] min-h-[calc(100vh-80px)] px-6">
      <nav className="w-full py-3 flex justify-between">
        <h3 className="text-[18px] font-[600]">Surveys Data</h3>
        {/* <ButtonBordered className="bg-white font-semibold">
          Uploaded Summary
        </ButtonBordered> */}
      </nav>

      <div className="p-3 text-sm text-my-gray-200 bg-white rounded-md shadow-md">
        <div className="flex items-center justify-between">
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-[387px] formInput "
            placeholder="Search Surveys here "
          />
          <div className="flex space-x-3 ">
            <Button
              onClick={getResponses}
              className="!bg-orange-600 text-[14px] flex gap-2 items-center justify-center !text-white btn-custom"
            >
              <p>Search</p>
            </Button>
            <div className="flex space-x-3 ">
              <Button
                className="!bg-gray-700 text-[14px] flex gap-2 items-center justify-center !text-white btn-custom"
                onClick={() => {
                  setSearchValue("");
                  setReset(!reset);
                }}
              >
                Reset
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3 ">
            <span className="">Sort By:</span>
            <div className="w-[150px]" style={{ zoom: "85%" }}>
              <Select
                labelId="demo-simple-select-label"
                id="sortby"
                value={sortOrder}
                size="small"
                name="sortby"
                onChange={handleSortOrder}
                className="w-full"
              >
                <MenuItem value={"asc"}>Date DESC</MenuItem>
                <MenuItem value={"desc"}>Date ASC</MenuItem>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <Loader className="h-[50vh] w-full flex justify-center items-center text-primary-300" />
      )}

      <div className="w-full py-2 text-sm card p-3 bg-white shadow-md rounded-md mt-3">
        <div className="relative overflow-x-auto mt-2">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Names
                </th>

                <th scope="col" className="px-6 py-3">
                  Responses
                </th>

                <th scope="col" className="px-6 py-3">
                  Analytics
                </th>

                <th scope="col" className="px-6 py-3">
                  AC list
                </th>
              </tr>
            </thead>

            <tbody>
              {!loading && data.length > 0 ? (
                data.map((el: any, index: number) => (
                  <tr
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                    onClick={() =>
                      router.push(
                        `/admin/data/survey-responses?survey_id=${el.survey_id}`
                      )
                    }
                    key={index}
                  >
                    <td className="px-6 py-4 font-[500]">
                      <p className="font-semibold text-blue-600 cursor-pointer">{el.surveyName}</p>
                      <p className="text-[13px] text-my-gray-200">
                        {formatDate(el.surveyCreatedAt)}
                      </p>
                    </td>

                    <td className="px-6 py-4 font-[500]">
                      <button
                        onClick={() =>
                          router.push(
                            `/admin/data/survey-responses?survey_id=${el.survey_id}`
                          )
                        }
                        className="col-span-1 flex justify-center items-center"
                      >
                        {el.responseCount}
                      </button>
                    </td>
                    <td className="px-6 py-4 font-[500]">
                      <BsPieChart
                        size={24}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            `/admin/data/analytics?survey_id=${el.survey_id}`
                          );
                        }}
                        className="cursor-pointer"
                      />
                    </td>

                    <td className="px-6 py-4 font-[500]">
                      <div className="col-span-1 ">
                        {!el.ac_list && <p></p>}
                        {el.ac_list && el.ac_list.length > 0 ? (
                          <p className="text-green-600 font-semibold">
                            AC list included
                          </p>
                        ) : (
                          <p className="text-primary-300 font-semibold">
                            AC list not included
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td className="px-6 py-4 font-[500]" colSpan={4}>
                  <div className="flex justify-center items-center h-[30vh] w-full">
                    <p>No survey with responses</p>
                  </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && (
        <div className="flex gap-3 items-center pl-4 py-3 bg-[#fff] rounded-md shadow-md mt-3">
          {/* Limit Select */}
          <div>
            <label htmlFor="limit-select" className="mr-2 text-[13px]">
              Show:
            </label>
            <select
              id="limit-select"
              value={pageLimit}
              onChange={handleLimitChange}
              className="p-2 border rounded-sm outline-none text-[14px] h-[35px]"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={page === 1}
              className="p-2 border rounded-md disabled:opacity-50"
            >
              <IoIosArrowBack />
            </button>
            <span className="text-[13px]">
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
    </div>
  );
}

export default page;
