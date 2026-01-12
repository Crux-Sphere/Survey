"use client";

import { useEffect, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import {
  deleteSurvey,
  getAllSurveys,
  updateSurvey,
} from "@/networks/survey_networks";
import { checkToken, formatDate } from "@/utils/common_functions";
import { useRouter } from "next/navigation";
import { FaRegEdit, FaRegUser } from "react-icons/fa";
import { MdDeleteOutline, MdPeople } from "react-icons/md";
import CustomModal from "../ui/Modal";
import ButtonFilled from "../ui/buttons/ButtonFilled";
import toast from "react-hot-toast";
import Loader from "../ui/Loader";
import Switch from "react-switch"; // Using a third-party switch component for toggle
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import {
  getAllUsers,
  getUser,
  updateMultipleUsers,
} from "@/networks/user_networks";
import { GrDuplicate } from "react-icons/gr";

import { qualityCheckId, surveyCollectorId } from "@/utils/constants";
import useUser from "@/hooks/useUser";
import PropagateLoader from "react-spinners/PropagateLoader";
import AssignQcBoothModal from "../survey-manager/AssignQcBoothModal";
import DuplicateSurveyModal from "./DuplicateSurveyModal";

interface AllSurveysProps {
  queryParams: Params;
  setQueryParams: (params: any) => void;
  updated: boolean;
  searchBarInput: string;
}
interface Params {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
  published?: string;
  created_by: string;
}

function AllSurveys({ queryParams, setQueryParams, updated, searchBarInput }: AllSurveysProps) {
  const [allSurveys, setAllSurveys] = useState<any>([]);
  const [filteredSurveys, setFilteredSurveys] = useState<any>([]);
  const [paginatedSurveys, setPaginatedSurveys] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searching, setSearching] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [surveyToDelete, setSurveyToDelete] = useState<string | null>(null);
  const [surveyToDuplicate, setSurveyToDuplicate] = useState<string | null>(null);
  const [duplicateModal,setDuplicateModal] = useState<boolean>(false)

  const [surveyToPublish, setSurveyToPublish] = useState<string | null>(null);
  const [isSurveyPublished, setisSurveyPublished] = useState<boolean | null>(
    null
  );
  const [publishModal, setPublishModal] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentLimit, setCurrentLimit] = useState<number>(10);
  const [users, setUsers] = useState<any[]>([]);
  const [assignModal, setAssignModal] = useState<boolean>(false);
  const [assignAnalystModal, setAssignAnalystModal] = useState<boolean>(false);
  const [analysts, setAnalysts] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [deSelectedUsers, setDeSelectedUsers] = useState<string[]>([]);
  const [selectedAnalysts, setSelectedAnalysts] = useState<string[]>([]);
  const [deSelectedAnalysts, setDeSelectedAnalysts] = useState<string[]>([]);
  const [surveyToAssign, setSurveyToAssign] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [userSearch, setUserSearch] = useState<string>("");
  const [qcModal, setQcModal] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [publishing, setPublishing] = useState<boolean>(false);
  const [selectedSurvey, setSelectedSurvey] = useState<string | null>(null);

  const userData = useUser();
  const isSurveyManager = userData?.role
    .map((el: any) => el.name)
    .includes("Survey Manager");
  const router = useRouter();

  useEffect(() => {
    handleGetAllSurveys();
  }, [queryParams, updated]);
  
  useEffect(() => {
    // If search box is empty, immediately clear search state
    if (!searchBarInput || !searchBarInput.trim()) {
      setSearching(false);
      setFilteredSurveys(allSurveys);
      return;
    }
    
    if (!allSurveys || allSurveys.length === 0) {
      setFilteredSurveys([]);
      setSearching(false);
      return;
    }
    
    // Debounce: wait for user to stop typing
    const debounceTimer = setTimeout(() => {
      // Perform search immediately without extra loader
      const searchLower = searchBarInput.toLowerCase().trim().replace(/\s+/g, ' ');
      
      const filtered = allSurveys.filter((survey: any) => {
        const surveyName = (survey.name?.toLowerCase() || "").replace(/\s+/g, ' ');
        const surveyId = (survey.survey_id?.toString().toLowerCase() || "").replace(/\s+/g, ' ');
        const createdDate = (formatDate(survey.createdAt)?.toLowerCase() || "").replace(/\s+/g, ' ');
        
        return (
          surveyName.includes(searchLower) ||
          surveyId.includes(searchLower) ||
          createdDate.includes(searchLower)
        );
      });
      
      // Update results immediately
      setFilteredSurveys(filtered);
      setCurrentPage(1);
    }, 400);
    
    return () => clearTimeout(debounceTimer);
  }, [searchBarInput, allSurveys]);

  // Frontend pagination for filtered results
  useEffect(() => {
    if (!filteredSurveys || filteredSurveys.length === 0) {
      setPaginatedSurveys([]);
      setTotalPages(0);
      return;
    }

    // If searching (limit is 1000), use frontend pagination
    if (searchBarInput && searchBarInput.trim()) {
      const startIndex = (currentPage - 1) * currentLimit;
      const endIndex = startIndex + currentLimit;
      const paginated = filteredSurveys.slice(startIndex, endIndex);
      setPaginatedSurveys(paginated);
      setTotalPages(Math.ceil(filteredSurveys.length / currentLimit));
    } else {
      // Not searching, use backend pagination
      setPaginatedSurveys(filteredSurveys);
    }
  }, [filteredSurveys, currentPage, currentLimit, searchBarInput]);
  
  useEffect(() => {
    const token = checkToken();
    if (token) {
      setUser(token);
    }
  }, []);

  useEffect(() => {
    getUsers();
  }, [userSearch]);

  useEffect(() => {
    if (assignAnalystModal) {
      getAnalysts();
      // Reset selections when modal opens
      setSelectedAnalysts([]);
      setDeSelectedAnalysts([]);
    }
  }, [assignAnalystModal]);

  // Delete a survey
  async function handleDeleteSurvey() {
    const params = {
      id: surveyToDelete,
      created_by: "rohitchand490@gmail.com",
    };
    setDeleting(true);
    const response = await deleteSurvey(params);
    if (response.success) {
      handleGetAllSurveys();
      setDeleteModal(false);
      setActiveDropdown(null);
      setDeleting(false);
      toast.success("Survey deleted successfully");
    } else {
      toast.error("Failed to delete survey");
    }
    setDeleting(false);
  }

  const handleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers((prevSelectedUsers) =>
        prevSelectedUsers.filter((u) => u !== userId)
      );
      setDeSelectedUsers((prevDeSelectedUsers) => [
        ...prevDeSelectedUsers,
        userId,
      ]);
    } else {
      setSelectedUsers((prevSelectedUsers) => [...prevSelectedUsers, userId]);
      setDeSelectedUsers((prevDeSelectedUsers) =>
        prevDeSelectedUsers.filter((u) => u !== userId)
      );
    }
  };

  const handleAnalystSelection = (analystId: string, currentlyAssigned: boolean) => {
    if (currentlyAssigned) {
      // Was already assigned, now unchecking - add to deselect list
      if (!deSelectedAnalysts.includes(analystId)) {
        setDeSelectedAnalysts((prev) => [...prev, analystId]);
      }
      setSelectedAnalysts((prev) => prev.filter((u) => u !== analystId));
    } else {
      // Was not assigned, now checking - add to select list
      if (!selectedAnalysts.includes(analystId)) {
        setSelectedAnalysts((prev) => [...prev, analystId]);
      }
      setDeSelectedAnalysts((prev) => prev.filter((u) => u !== analystId));
    }
  };

  // Toggle publish/unpublish survey
  async function handlePublishSurvey() {
    setPublishing(true);
    const formData = {
      published: !isSurveyPublished,
      created_by: "rohitchand490@gmail.com",
    };

    const params = { _id: surveyToPublish, formData };
    const response = await updateSurvey(params);
    if (response.success) {
      handleGetAllSurveys();
      setPublishModal(false);
      setSurveyToPublish(null);
      setisSurveyPublished(null);
      setPublishing(false);
      toast.success(
        `Survey ${isSurveyPublished ? "Unpublished" : "Published"} successfully`
      );
    } else {
      toast.error("Failed to Publish survey");
    }
    setPublishing(false);
  }

  async function handleGetAllSurveys() {
    const params = queryParams;
    setLoading(true);
    const response = await getAllSurveys(params);
    // console.log("all surveys are --->", response);
    setAllSurveys(response.surveys);
    setFilteredSurveys(response.surveys);
    setTotalPages(response.totalPages);
    setLoading(false);
  }

  async function getUsers() {
    setLoading(true);
    const params = {
      selectedRole: surveyCollectorId,
      searchBarInput: userSearch,
    };
    console.log("params are --->", params);
    const response = await getAllUsers(params);

    setUsers(response.data);
    setLoading(false);
  }

  async function getAnalysts() {
    setLoading(true);
    const params = {
      page: 1,
      limit: 1000
    };
    const response = await getAllUsers(params);
    if (response.success && response.data) {
      const dataAnalysts = response.data.filter((user: any) =>
        user.role && user.role.some((role: any) => role.name === "Data Analyst")
      );
      setAnalysts(dataAnalysts);
    } else {
      setAnalysts([]);
    }
    setLoading(false);
  }

  async function handleAssignAnalysts() {
    const analystUpdates = selectedAnalysts.map((analystId) => ({
      user_id: analystId,
      assigned_survey: surveyToAssign,
    }));
    const removeUpdates = deSelectedAnalysts.map((analystId) => ({
      user_id: analystId,
      remove_survey: surveyToAssign,
    }));

    const updates = [...analystUpdates, ...removeUpdates];

    if (!updates || updates.length === 0) {
      toast.error("Please select at least one analyst");
      return;
    }

    const params = { users: updates };
    setLoading(true);
    const response = await updateMultipleUsers(params);
    if (response.success) {
      toast.success("Surveys assigned to analysts successfully!");
      handleGetAllSurveys();
      getAnalysts();
    } else {
      toast.error("Something went wrong");
    }
    setLoading(false);
    setAssignAnalystModal(false);
    setActiveDropdown(null);
    setSelectedAnalysts([]);
    setDeSelectedAnalysts([]);
  }

  // Toggle dropdown
  const toggleDropdown = (index: number) => {
    setActiveDropdown((prev) => (prev === index ? null : index));
  };

  // Handle publish/unpublish toggle click
  const handleToggleClick = (survey: any) => {
    setisSurveyPublished(survey.published);
    setSurveyToPublish(survey._id);
    setPublishModal(true); // Show modal for confirmation
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value, 10);
    
    if (searchBarInput && searchBarInput.trim()) {
      // If searching, use frontend pagination
      setCurrentLimit(newLimit);
      setCurrentPage(1);
    } else {
      // If not searching, use backend pagination
      setQueryParams({
        ...queryParams,
        limit: newLimit,
        page: 1,
      });
    }
  };

  const handleNextPage = () => {
    if (searchBarInput && searchBarInput.trim()) {
      // Frontend pagination for search results
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    } else {
      // Backend pagination
      if (queryParams.page < totalPages) {
        setQueryParams({ ...queryParams, page: queryParams.page + 1 });
      }
    }
  };

  const handlePreviousPage = () => {
    if (searchBarInput && searchBarInput.trim()) {
      // Frontend pagination for search results
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } else {
      // Backend pagination
      if (queryParams.page > 1) {
        setQueryParams({ ...queryParams, page: queryParams.page - 1 });
      }
    }
  };

  async function handleAssignSurvey() {
    let paramsUsers: any = selectedUsers.map((user) => {
      return {
        user_id: user,
        assigned_survey: surveyToAssign,
      };
    });
    const paramsUsersDeSelected = deSelectedUsers.map((user) => {
      return {
        user_id: user,
        remove_survey: surveyToAssign,
      };
    });
    if (paramsUsersDeSelected) {
      paramsUsers = [...paramsUsers, ...paramsUsersDeSelected];
    }

    if (!paramsUsers || paramsUsers.length === 0) {
      toast.error("Please select at least one new user");
      return;
    }
    const params = {
      users: paramsUsers,
    };
    console.log("params-------->", paramsUsers);
    setLoading(true);
    const response = await updateMultipleUsers(params);
    if (response.success) {
      toast.success("Assigned surveys updated successfully!");
      getAllSurveys(queryParams);
      getUsers();
    } else {
      toast.error("Something went wrong");
    }
    setLoading(false);
    setAssignModal(false);
    setActiveDropdown(null);
    setSelectedUsers([]);
  }

  return (
    <div className="w-full flex-1 flex flex-col">
      <div
        className={`w-full mt-1 mx-auto text-sm pb-3`}
      >
        {loading && !searching && (
          <Loader className="h-[40vh] w-full flex justify-center items-center text-primary-300" />
        )}
        {searching && (
          <Loader className="h-[40vh] w-full flex justify-center items-center text-primary-300" />
        )}
        {!loading && !searching && (
        <div className="card shadow-md p-2 sm:p-4 bg-white rounded-md">
          <div className="relative overflow-x-auto max-h-[50vh] overflow-y-auto">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Id
                  </th>
                  <th scope="col" className="px-6 py-3">
                    All surveys
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Total responses
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Date created
                  </th>

                  <th scope="col" className="px-6 py-3">
                    {isSurveyManager ? "Action" : "Status"}
                  </th>
                </tr>
              </thead>

              <tbody>
                {!loading && paginatedSurveys && paginatedSurveys.length > 0
                  ? paginatedSurveys.map((el: any, index: number) => (
                      <tr
                        key={index}
                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                      >
                        <td className="px-6 py-4 font-[500]">
                          {el.survey_id || 0}
                        </td>
                        <td
                          className="px-6 py-4 font-[500]"
                          onClick={() => {
                            if (!isSurveyManager)
                              router.push(
                                `/admin/surveys/edit?survey_id=${el._id}`
                              );
                            if (!isSurveyManager)
                              router.push(
                                `/admin/surveys/edit?survey_id=${el._id}`
                              );
                          }}
                        >
                          <span className="text-blue-500 cursor-pointer">
                            {el.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-[500]">
                          {el.response_count || 0}
                        </td>
                        <td className="px-6 py-4 font-[500]">
                          {formatDate(el.createdAt)}
                        </td>
                        <td className="px-6 py-4 font-[500]">
                          {isSurveyManager ? (
                            <ButtonFilled
                              onClick={() => {
                                setQcModal(true);
                                setSelectedSurvey(el._id);
                              }}
                              className="w-full bg-primary-300 hover:bg-primary-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                            >
                              Assign to quality check
                            </ButtonFilled>
                          ) : (
                            <div className="col-span-2 flex items-center justify-between w-full relative">
                              <Switch
                                onChange={() => handleToggleClick(el)}
                                checked={el.published}
                                onColor="#4CAF50"
                                offColor="#DDDDDD"
                                uncheckedIcon={false}
                                checkedIcon={false}
                                className="transition-switch duration-300 ease-in-out"
                              />

                              <div className="relative">
                                <button
                                  onClick={() => {
                                    setSurveyToDelete(el._id);
                                    const selected = users
                                      .filter((user) =>
                                        user.assigned_survey.includes(el._id)
                                      )
                                      .map((u) => u._id);
                                    setSelectedUsers(selected);
                                    toggleDropdown(el._id);
                                  }}
                                >
                                  <BsThreeDotsVertical />
                                </button>
                                {activeDropdown === el._id && (
                                  <div className="absolute right-0 top-8 h-auto w-48 bg-white shadow-lg rounded-sm py-2 z-10">
                                    <button
                                      onClick={() =>
                                        router.push(
                                          `/admin/surveys/edit?survey_id=${el._id}`
                                        )
                                      }
                                      className="flex gap-2 items-center px-4 py-2 hover:bg-gray-100 cursor-pointer w-full text-[13px]"
                                    >
                                      <FaRegEdit /> Edit
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSurveyToDuplicate(el);
                                        setActiveDropdown(null);
                                        setDuplicateModal(true);
                                      }}
                                      className="flex gap-2 items-center px-4 py-2 hover:bg-gray-100 cursor-pointer w-full text-[13px]"
                                    >
                                      <GrDuplicate />
                                      Duplicate
                                    </button>
                                    <button
                                      disabled={el.published === false}
                                      onClick={() => {
                                        setSurveyToAssign(el._id);
                                        setActiveDropdown(null);
                                        setAssignModal(true);
                                      }}
                                      className="flex gap-2 items-center disabled:cursor-not-allowed disabled:bg-gray-100 px-4 py-2 hover:bg-gray-100 cursor-pointer w-full  text-[13px]"
                                    >
                                      <FaRegUser /> Assign to user
                                    </button>
                                    <button
                                      disabled={el.published === false}
                                      onClick={() => {
                                        setSurveyToAssign(el._id);
                                        setActiveDropdown(null);
                                        setAssignAnalystModal(true);
                                      }}
                                      className="flex gap-2 items-center disabled:cursor-not-allowed disabled:bg-gray-100 px-4 py-2 hover:bg-gray-100 cursor-pointer w-full  text-[13px]"
                                    >
                                      <MdPeople /> Assign to analyst
                                    </button>
                                    <button
                                      onClick={() => {
                                        setActiveDropdown(null);
                                        setDeleteModal(true);
                                      }}
                                      className="flex gap-2 items-center px-4 py-2 hover:bg-gray-100 cursor-pointer w-full  text-[13px]"
                                    >
                                      <MdDeleteOutline /> Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  : !loading &&
                    filteredSurveys.length === 0 && (
                      <tr>
                        <td colSpan={5} className="w-full h-20 text-center font-semibold text-secondary-300">
                          No surveys found
                        </td>
                      </tr>
                    )}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* modals */}
        <CustomModal
          open={publishModal}
          closeModal={() => {
            setPublishModal(false);
            setSurveyToPublish(null);
            setisSurveyPublished(null);
          }}
        >
          <div className="flex flex-col h-[40vh] w-[40vw] justify-center items-center gap-10 ">
            {publishing && (
              <div className="absolute inset-0 z-30 bg-black/65 flex flex-col justify-center items-center gap-10 h-full w-full">
                <PropagateLoader speedMultiplier={1.25} color="#FF8437" />
                <h3 className="text-white font-semibold">
                  {isSurveyPublished ? "Unpublishing" : "Publishing"} survey...
                </h3>
              </div>
            )}
            <h1 className="text-xl">
              Do you want to {isSurveyPublished ? "Unpublish" : "Publish"} this
              survey?
            </h1>
            <div className="flex gap-2">
              <ButtonFilled onClick={handlePublishSurvey} className="w-40">
                {isSurveyPublished ? "Unpublish" : "Publish"}
              </ButtonFilled>
              <ButtonFilled
                onClick={() => {
                  setPublishModal(false);
                  setSurveyToPublish(null);
                  setisSurveyPublished(null);
                }}
                className="w-40"
              >
                No
              </ButtonFilled>
            </div>
          </div>
        </CustomModal>

        <CustomModal
          open={deleteModal}
          preventOutsideClose={deleting}
          closeModal={() => {
            setDeleteModal(false);
            setActiveDropdown(null);
            setSurveyToDelete(null);
          }}
        >
          <div className="relative flex flex-col h-[40vh] w-[40vw] justify-center items-center gap-10 ">
            {deleting && (
              <div className="absolute inset-0 z-30 bg-black/65 flex flex-col justify-center items-center gap-10 h-full w-full">
                <PropagateLoader speedMultiplier={1.25} color="#FF8437" />
                <h3 className="text-white font-semibold">Deleting survey...</h3>
              </div>
            )}
            <h1 className="text-xl">
              Are you sure you want to delete this survey?
            </h1>
            <div className="flex gap-2">
              <ButtonFilled onClick={handleDeleteSurvey} className="w-40">
                Yes
              </ButtonFilled>
              <ButtonFilled
                onClick={() => {
                  setDeleteModal(false);
                  setActiveDropdown(null);
                  setSurveyToDelete(null);
                }}
                className="w-40"
              >
                No
              </ButtonFilled>
            </div>
          </div>
        </CustomModal>

        {/* assign booth to qc */}
        <AssignQcBoothModal
          boothModal={qcModal}
          setBoothModal={setQcModal}
          survey_id={selectedSurvey}
        />
        {/* Assign Survey to users Modal */}
        <CustomModal
          open={assignModal}
          closeModal={() => {
            setAssignModal(false);
            setSelectedUsers([]);
          }}
        >
          <div className="flex flex-col h-[70vh] w-[40vw] items-center gap-5 p-4">
            <h1 className="text-xl w-full text-center">
              Select survey collectors to assign the survey
            </h1>
            <input
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search user"
              className="px-4 py-2 rounded-md border outline-none w-full"
            />
            <div className="grid grid-cols-2 gap-4  w-full overflow-y-auto max-h-[60vh]">
              {user && users && users.length > 0 ? (
                users.map(({ _id, email, name, assigned_survey }, index) => {
                  if (user.id === _id) return null;
                  return (
                    <label
                      key={_id}
                      className="cursor-pointer flex items-center h-fit  min-w-[50%] justify-between"
                    >
                      <div>
                        {index + 1}. {name || email}
                      </div>
                      <input
                        className="h-5 w-5 disabled:cursor-not-allowed"
                        type="checkbox"
                        defaultChecked={assigned_survey.includes(
                          surveyToAssign
                        )}
                        onChange={() => handleUserSelection(_id)}
                      />
                    </label>
                  );
                })
              ) : (
                <div>No users available</div>
              )}
            </div>
            <ButtonFilled
              onClick={handleAssignSurvey}
              className="whitespace-nowrap mt-auto"
            >
              Update Assigned Surveys
            </ButtonFilled>
          </div>
        </CustomModal>

        {/* Assign to Analyst Modal */}
        <CustomModal
          open={assignAnalystModal}
          closeModal={() => {
            setAssignAnalystModal(false);
            setSelectedAnalysts([]);
            setDeSelectedAnalysts([]);
          }}
        >
          <div className="flex flex-col h-[70vh] w-[40vw] items-center gap-5 p-4">
            <h1 className="text-xl w-full text-center">
              Select Data Analysts to assign the survey
            </h1>
            <div className="grid grid-cols-2 gap-4 w-full overflow-y-auto max-h-[60vh]">
              {analysts && analysts.length > 0 ? (
                analysts.map(({ _id, email, name, assigned_survey }, index) => {
                  if (user && user.id === _id) return null;
                  const isCurrentlyAssigned = assigned_survey.includes(surveyToAssign);
                  const isSelected = selectedAnalysts.includes(_id);
                  const isDeselected = deSelectedAnalysts.includes(_id);
                  
                  // Determine checked state:
                  // If was assigned and not in deselect list, OR newly selected, then checked
                  const isChecked = (isCurrentlyAssigned && !isDeselected) || isSelected;
                  
                  return (
                    <label
                      key={_id}
                      className="cursor-pointer flex items-center h-fit min-w-[50%] justify-between"
                    >
                      <div>
                        {index + 1}. {name || email}
                      </div>
                      <input
                        className="h-5 w-5 disabled:cursor-not-allowed"
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleAnalystSelection(_id, isCurrentlyAssigned)}
                      />
                    </label>
                  );
                })
              ) : (
                <div>No Data Analysts available</div>
              )}
            </div>
            <ButtonFilled
              onClick={handleAssignAnalysts}
              className="whitespace-nowrap mt-auto"
            >
              Update Assigned Surveys
            </ButtonFilled>
          </div>
        </CustomModal>

        <DuplicateSurveyModal closeModal={()=>setDuplicateModal(false)} modalIsOpen={duplicateModal} survey={surveyToDuplicate} />
      </div>
      
      {/* Pagination Controls - Separate Card */}
      {!loading && !searching && (
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center justify-center sm:justify-start px-2 sm:px-4 py-2 sm:py-3 bg-white rounded-md shadow-md mt-1">
          {/* Limit Select */}
          <div className="flex items-center">
            <label htmlFor="limit-select" className="mr-2 text-xs sm:text-[13px]">
              Show:
            </label>
            <select
              id="limit-select"
              value={searchBarInput && searchBarInput.trim() ? currentLimit : queryParams.limit}
              onChange={handleLimitChange}
              className="p-1 sm:p-2 border rounded-md text-xs sm:text-[13px]"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={searchBarInput && searchBarInput.trim() ? currentPage === 1 : queryParams.page === 1}
              className="p-1 sm:p-2 border rounded-md disabled:opacity-50 text-sm"
            >
              <IoIosArrowBack />
            </button>
            <span className="text-xs sm:text-[13px] px-1 whitespace-nowrap">
              Page {searchBarInput && searchBarInput.trim() ? currentPage : queryParams.page} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={searchBarInput && searchBarInput.trim() ? currentPage === totalPages : queryParams.page === totalPages}
              className="p-1 sm:p-2 border rounded-md disabled:opacity-50 text-sm"
            >
              <IoIosArrowForward />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AllSurveys;
