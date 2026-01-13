"use client";
import ButtonBordered from "@/components/ui/buttons/ButtonBordered";
import ButtonFilled from "@/components/ui/buttons/ButtonFilled";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BsPieChart } from "react-icons/bs";
import Loader from "@/components/ui/Loader";
import { getAllSurveyResponses, importSurveyFromExcel } from "@/networks/response_networks";
import { formatDate } from "@/utils/common_functions";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import Button from "@mui/material/Button";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Modal from "react-modal";
import toast from "react-hot-toast";
import { FaUpload, FaEdit } from "react-icons/fa";
import { updateSurvey } from "@/networks/survey_networks";
import useUser from "@/hooks/useUser";

function page() {
  const loggedInUser = useUser();
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<any[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [reset, setReset] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageLimit, setPageLimit] = useState<number>(10);
  const [totalResponsePages, setTotalResponsePages] = useState<number>(0);
  
  // Import modal states
  const [importModalOpen, setImportModalOpen] = useState<boolean>(false);
  const [surveyName, setSurveyName] = useState<string>("");
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [importing, setImporting] = useState<boolean>(false);

  // Edit modal states
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [editingSurvey, setEditingSurvey] = useState<any>(null);
  const [editSurveyName, setEditSurveyName] = useState<string>("");
  const [updating, setUpdating] = useState<boolean>(false);

  const router = useRouter();

  console.log(data);
  useEffect(() => {
    if (loggedInUser) {
      getResponses();
    }
  }, [sortOrder, reset, page, pageLimit, loggedInUser]);

  async function getResponses() {
    // Check if user is Data Analyst
    const isDataAnalyst = loggedInUser?.role?.some((r: any) => r.name === "Data Analyst");
    console.log("Fetching responses...");
    console.log("Is Data Analyst:", isDataAnalyst);
    console.log("User ID:", loggedInUser?.id);
    
    const params = { 
      search: searchValue, 
      sortOrder, 
      page, 
      limit: pageLimit,
      userId: isDataAnalyst ? loggedInUser?.id : undefined
    };
    
    console.log("Request params:", params);
    
    setLoading(true);
    const response = await getAllSurveyResponses(params);
    console.log("Response from API:", response);
    
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

  const handleImportSurvey = async () => {
    if (!surveyName.trim()) {
      toast.error("Please enter a survey name");
      return;
    }
    if (!excelFile) {
      toast.error("Please select an Excel file");
      return;
    }

    try {
      setImporting(true);
      const formData = new FormData();
      formData.append("surveyName", surveyName);
      formData.append("excelFile", excelFile);

      const response = await importSurveyFromExcel(formData);
      
      if (response.success) {
        toast.success("Survey imported successfully!");
        setImportModalOpen(false);
        setSurveyName("");
        setExcelFile(null);
        setReset(!reset);
      } else {
        toast.error(response.message || "Failed to import survey");
      }
    } catch (error) {
      toast.error("Failed to import survey");
      console.error(error);
    } finally {
      setImporting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast.error("Please select a valid Excel file (.xlsx or .xls)");
        return;
      }
      setExcelFile(file);
    }
  };

  const handleEditSurvey = (survey: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSurvey(survey);
    setEditSurveyName(survey.surveyName);
    setEditModalOpen(true);
  };

  const handleUpdateSurveyName = async () => {
    if (!editSurveyName.trim()) {
      toast.error("Please enter a survey name");
      return;
    }

    try {
      setUpdating(true);
      const response = await updateSurvey({
        _id: editingSurvey.survey_id,
        formData: {
          name: editSurveyName,
        },
      });

      if (response.success) {
        toast.success("Survey name updated successfully!");
        setEditModalOpen(false);
        setEditingSurvey(null);
        setEditSurveyName("");
        setReset(!reset);
      } else {
        toast.error(response.message || "Failed to update survey name");
      }
    } catch (error) {
      toast.error("Failed to update survey name");
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="w-full font-medium bg-[#ECF0FA] min-h-[calc(100vh-80px)] px-6">
      <nav className="w-full py-3 flex justify-between">
        <h3 className="text-[18px] font-[600]">Surveys Data</h3>
        <Button
          onClick={() => setImportModalOpen(true)}
          className="!bg-blue-600 text-[14px] flex gap-2 items-center justify-center !text-white btn-custom"
        >
          <FaUpload />
          <p>Import Survey</p>
        </Button>
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
                <MenuItem value={"desc"}>Date DESC</MenuItem>
                <MenuItem value={"asc"}>Date ASC</MenuItem>
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

                <th scope="col" className="px-6 py-3">
                  Actions
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

                    <td className="px-6 py-4 font-[500]">
                      <FaEdit
                        size={20}
                        onClick={(e) => handleEditSurvey(el, e)}
                        className="cursor-pointer text-blue-600 hover:text-blue-800"
                        title="Edit Survey Name"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td className="px-6 py-4 font-[500]" colSpan={5}>
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

      {/* Import Survey Modal */}
      <Modal
        isOpen={importModalOpen}
        onRequestClose={() => {
          setImportModalOpen(false);
          setSurveyName("");
          setExcelFile(null);
        }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-[500px] outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
      >
        <h2 className="text-xl font-semibold mb-4">Import Survey from Excel</h2>
        
        <div className="space-y-4">
          {/* Survey Name Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Survey Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={surveyName}
              onChange={(e) => setSurveyName(e.target.value)}
              placeholder="Enter survey name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Excel File <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {excelFile && (
              <p className="text-sm text-green-600 mt-2">
                Selected: {excelFile.name}
              </p>
            )}
          </div>

          {/* Info Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              Upload the Excel file that was previously downloaded from the survey responses.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={() => {
                setImportModalOpen(false);
                setSurveyName("");
                setExcelFile(null);
              }}
              className="!bg-gray-500 text-[14px] !text-white btn-custom"
              disabled={importing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImportSurvey}
              className="!bg-blue-600 text-[14px] !text-white btn-custom"
              disabled={importing}
            >
              {importing ? "Importing..." : "Import Survey"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Survey Name Modal */}
      <Modal
        isOpen={editModalOpen}
        onRequestClose={() => {
          setEditModalOpen(false);
          setEditingSurvey(null);
          setEditSurveyName("");
        }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-[500px] outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
      >
        <h2 className="text-xl font-semibold mb-4">Edit Survey Name</h2>
        
        <div className="space-y-4">
          {/* Survey Name Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Survey Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={editSurveyName}
              onChange={(e) => setEditSurveyName(e.target.value)}
              placeholder="Enter new survey name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <Button
              onClick={() => {
                setEditModalOpen(false);
                setEditingSurvey(null);
                setEditSurveyName("");
              }}
              className="!bg-gray-500 text-[14px] !text-white btn-custom"
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateSurveyName}
              className="!bg-blue-600 text-[14px] !text-white btn-custom"
              disabled={updating}
            >
              {updating ? "Updating..." : "Update Name"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default page;
