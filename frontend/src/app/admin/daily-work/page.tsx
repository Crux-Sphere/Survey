"use client";
import ButtonFilled from '@/components/ui/buttons/ButtonFilled';
import FilledGreyButton from '@/components/ui/buttons/FilledGreyButton';
import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { SlCalender } from "react-icons/sl";
import toast from "react-hot-toast";
import { SERVER_BUCKET, surveyCollectorId } from "@/utils/constants";
import TwoDatePicker from '@/components/ui/date/TwoDatePicker';
import Select2 from "react-select";
import { getAllUsers} from '@/networks/user_networks';
import { downloadWorkData } from '@/networks/user_networks';
import { dailyWorkReport } from '@/utils/constants';
import axios from 'axios';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { formatDateForApi } from '@/utils/common_functions';
import React from 'react';
import AudioComp from '@/components/survey-responses/AudioComp';

export default function DailyWorkPage() {
    const [downloading, setDownloading] = useState<boolean>(false);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [userId, setUserId] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [workData, setWorkData] = useState<any[]>([]);
    const [tableLoading, setTableLoading] = useState<boolean>(false);
    const [pagination, setPagination] = useState<any>({});
    const [page, setPage] = useState<number>(1);
    const [pageLimit, setPageLimit] = useState<number>(10);
    const [needsApply, setNeedsApply] = useState<boolean>(false);
    const [selectKey, setSelectKey] = useState<number>(0);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [expandedQuestions, setExpandedQuestions] = useState<{[key:number]: boolean}>({});
    const [detailPage, setDetailPage] = useState(1);
    const [detailPageLimit, setDetailPageLimit] = useState(10);
    const [playingAudioIdx, setPlayingAudioIdx] = useState<number | null>(null);
    const options = users?.map((user) => ({
        value: user._id,
        label: user.name,
      }));
    const router = useRouter();
    
    async function getUsers() {
        // setLoading(true);
        const response = await getAllUsers({ selectedRole: surveyCollectorId });
        console.log("users-------->", response.data);
        setUsers(response.data);
        setLoading(false);
    }

    async function fetchWorkData() {
        setTableLoading(true);
        try {
            let url = dailyWorkReport;
            const params: any = { page, limit: pageLimit };
            if (startDate && endDate) {
                params.start_date = formatDateForApi(startDate);
                params.end_date = formatDateForApi(endDate);
            }
            if (userId) {
                params.userId = userId;
            }
            const response = await axios.get(url, { params });
            if (response.data.success) {
                setWorkData(response.data.data);
                setPagination(response.data.pagination);
            } else {
                toast.error("Failed to fetch work data");
            }
        } catch (error) {
            console.error("Error fetching work data:", error);
            toast.error("Error fetching work data");
        } finally {
            setTableLoading(false);
        }
    }

    useEffect(() => {
        getUsers();
    }, []);

    useEffect(() => {
        fetchWorkData();
    }, []);

    useEffect(() => {
        if (workData.length > 0) {
            fetchWorkData();
        }
    }, [page, pageLimit]);

    const handleApply = () => {
        if ((startDate && !endDate) || (endDate && !startDate)) {
            toast.error("Please select a complete date range!");
            return;
        }
        setWorkData([]);
        setTableLoading(true);
        setPage(1);
        setNeedsApply(false);
        fetchWorkData();
    };

    const handleReset = () => {
        setStartDate(null);
        setEndDate(null);
        setUserId("");
        setPagination({});
        setPage(1);
        setPageLimit(10);
        setNeedsApply(false);
        setSelectKey(Date.now());
        setTableLoading(true);
        fetchWorkData();
    };
    useEffect(() => {
        if (startDate === null && endDate === null && userId === "" && needsApply === false) {
            fetchWorkData();
        }
    }, [startDate, endDate, userId, needsApply]);

    const exportToExcel = async () => {
        try {
            setDownloading(true);
            const params: any = {};
            
            if (startDate && endDate) {
                params.start_date = formatDateForApi(startDate);
                params.end_date = formatDateForApi(endDate);
            }
            if (userId) {
                params.userId = userId;
            }

            const response = await downloadWorkData(params);
            const contentType = response.headers["content-type"];
            if (contentType && contentType.includes("application/json")) {
                toast.error("No work data to export.");
                setDownloading(false);
                return;
            }
            const contentDisposition = response.headers["content-disposition"];
            let filename = "Daily_Work_Report.xlsx";
            if (contentDisposition) {
                const fileMatch = contentDisposition.split("filename=")[1];
                if (fileMatch) {
                    filename = fileMatch.replace(/"/g, "");
                }
            }
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("Excel file downloaded successfully!");
        } catch (error) {
            console.error("Error exporting to Excel:", error);
            toast.error("Failed to export to Excel");
        } finally {
            setDownloading(false);
        }
    };
    return (
        <>
            {!selectedUser ? (
                <div className="flex flex-col w-full px-8">
                    <nav className="w-full py-3 px-3 flex flex-col gap-3">
                        <h3 className="text-[18px] font-[500]">Daily Work Report</h3>

                        <div className="flex w-full gap-12">
                        <div>
                            <div className="flex space-x-2 text-black text-base font-semibold">
                            <ButtonFilled
                                view={
                                "btn-custom bg-green-500 flex items-center justify-center !text-[13px] !rounded-md !text-white !h-[40px] !w-[140px]"
                                }
                                loading={downloading}
                                onClick={exportToExcel}
                            >
                                Export to Excel
                            </ButtonFilled>
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
                    <div className="mt-2 font-semibold text-sm ">
                            <div className="bg-light-gray  w-full rounded-md shadow-md px-4 py-6 mb-5">
                            <div className="w-full">
                                <div className="flex flex-col gap-5">
                                <div>
                                    <div className="flex gap-3 items-center mb-5">
                                    <h2 className="text-[16px]">Date Range</h2>
                                    <SlCalender size={20} />
                                    </div>
                                    <div className="w-fit flex items-center gap-4">
                                    <TwoDatePicker
                                        className="w-[352px] h-10 relative"
                                        startDate={startDate}
                                        endDate={endDate}
                                        setStartDate={(date) => {
                                            setStartDate(date);
                                            setNeedsApply(true);
                                            setPage(1);
                                        }}
                                        setEndDate={(date) => {
                                            setEndDate(date);
                                            setNeedsApply(true);
                                            setPage(1);
                                        }}
                                    />
                                    </div>
                                </div>
                                {/* Select User */}
                                <div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col w-[352px]">
                                            <Select2
                                                key={selectKey}
                                                value={userId ? options.find((option) => option.value === userId) : null}
                                                onChange={(selectedOption) => {
                                                    setUserId(selectedOption?.value || "");
                                                    setNeedsApply(true);
                                                    setPage(1);
                                                }}
                                                options={options}
                                                placeholder="Select user"
                                                classNamePrefix="react-select"
                                                isSearchable={true}
                                                />
                                        </div>
                                        <div className="flex space-x-2">
                                            <FilledGreyButton
                                              onClick={handleReset}
                                              className="btn-custom bg-gray-800 flex items-center justify-center !text-[13px] !rounded-md !text-white !h-[40px]"
                                            >
                                              Reset
                                            </FilledGreyButton>
                                            <ButtonFilled
                                              onClick={handleApply}
                                              disabled={!needsApply && !startDate && !endDate}
                                              className="btn-custom bg-orange-700 flex items-center justify-center !text-[13px] !rounded-md !text-white !h-[40px]"
                                            >
                                              Apply
                                            </ButtonFilled>
                                        </div>
                                    </div>
                                </div>
                                </div>
                            </div>
                            </div>
                        </div>
                        {tableLoading ? (
                            <div className="flex flex-col justify-center items-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <span className="mt-2 text-gray-600">Loading work data...</span>
                            </div>
                        ) : (
                          <div>
                            {pagination && pagination.dateRange && (
                              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                                <p className="text-sm text-gray-600">
                                  Showing data for: <span className="font-medium">{pagination.dateRange.startDate}</span> to <span className="font-medium">{pagination.dateRange.endDate}</span>
                                </p>
                              </div>
                            )}
                            <div
                              id="scrollableDiv"
                              className="w-full max-h-[80vh] overflow-auto scrollbar rounded-t-2xl border border-secondary-200"
                            >
                              <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                              <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                              <tr>
                                <th scope="col" className="px-6 py-3 whitespace-nowrap">User Name</th>
                                <th scope="col" className="px-6 py-3 whitespace-nowrap">Email</th>
                                <th scope="col" className="px-6 py-3 whitespace-nowrap">Total Responses</th>
                                <th scope="col" className="px-6 py-3 whitespace-nowrap">Work Duration</th>
                                <th scope="col" className="px-6 py-3 whitespace-nowrap">Start Date</th>
                                <th scope="col" className="px-6 py-3 whitespace-nowrap">End Date</th>
                                <th scope="col" className="px-6 py-3 whitespace-nowrap">View Responses</th>
                                {/* <th scope="col" className="px-6 py-3 whitespace-nowrap">Status</th> */}
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {workData.map((user, index) => (
                                <tr
                                  key={user.userId}
                                  className={`border-b  ${
                                    index % 2 === 0 ? "bg-white" : "bg-white"
                                  }`}
                                >
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="flex-shrink-0 h-10 w-10">
                                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                          <span className="text-white font-medium text-sm">
                                            {user.userName.charAt(0).toUpperCase()}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{user.userName}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.userEmail}</td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      {user.totalResponses} responses
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {user.workDurationMinutes >= 60 
                                ? `${Math.floor(user.workDurationMinutes / 60)}h ${user.workDurationMinutes % 60}m`
                                : `${user.workDurationMinutes}m`
                              }
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.firstWorkTime ? new Date(user.firstWorkTime).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    }) : 'N/A'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {user.lastWorkTime ? new Date(user.lastWorkTime).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    }) : 'N/A'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                      className="text-blue-600 underline cursor-pointer"
                                      onClick={() => setSelectedUser(user)}
                                    >
                                      View Responses
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            </table>
                          </div>
                          {pagination && pagination.totalPages > 1 && (
                            <div className="flex gap-3 items-center mt-4 pb-5">
                              <div>
                                <label htmlFor="limit-select" className="mr-2 text-[13px]">
                                  Show:
                                </label>
                                <Select
                                  labelId="limit-select-label"
                                  id="limit-select"
                                  value={pageLimit}
                                  onChange={(e) => {
                                    setPageLimit(Number(e.target.value));
                                    setPage(1);
                                  }}
                                  size="small"
                                  style={{ zoom: "80%" }}
                                >
                                  <MenuItem value={10}>10</MenuItem>
                                  <MenuItem value={20}>20</MenuItem>
                                  <MenuItem value={50}>50</MenuItem>
                                  <MenuItem value={100}>100</MenuItem>
                                </Select>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setPage(page - 1)}
                                  disabled={page === 1}
                                  className="p-2 border rounded-md disabled:opacity-50"
                                >
                                  <IoIosArrowBack />
                                </button>
                                <span className="text-[13px]">
                                  Page {page} of {pagination?.totalPages}
                                </span>
                                <button
                                  onClick={() => setPage(page + 1)}
                                  disabled={page === pagination?.totalPages}
                                  className="p-2 border rounded-md disabled:opacity-50"
                                >
                                  <IoIosArrowForward />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        )}
                        {!tableLoading && workData.length === 0 && (userId || (startDate && endDate)) && (
                            <div className="bg-white rounded-md shadow-md p-6 text-center">
                                <p className="text-gray-500">
                                    {userId && !startDate && !endDate
                                        ? "No work data found for the selected user."
                                        : "No work data found for the selected date range."}
                                </p>
                            </div>
                        )}
                    </div>
            ) : (
                <div className="mt-8 px-8">
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => { setSelectedUser(null); setDetailPage(1); }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 border border-gray-300 rounded hover:bg-gray-300 transition"
                        >
                            Back
                        </button>
                        <h4 className="text-xl font-bold text-gray-800">Responses for {selectedUser.userName}</h4>
                    </div>
                    {(() => {
                        const allQuestions: string[] = Array.from(
                            new Set(
                                selectedUser.responses.flatMap((row: any) =>
                                    (row.response.responses || []).map((q: any) => q.question)
                                )
                            )
                        ).filter((q): q is string => typeof q === 'string');
                        const handleMoreClick = (i: number) => {
                            setExpandedQuestions((prev) => ({ ...prev, [i]: !prev[i] }));
                        };
                        return (
                            <>
                                <div
                                    className="w-full max-h-[80vh] overflow-auto scrollbar rounded-t-2xl border border-secondary-200"
                                >
                                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                                            <tr>
                                                <th className="px-6 py-3 whitespace-nowrap">AC No</th>
                                                <th className="px-6 py-3 whitespace-nowrap">Booth No</th>
                                                <th className="px-6 py-3 whitespace-nowrap">Audio</th>
                                                <th className="px-6 py-3 whitespace-nowrap">Created At</th>
                                                {allQuestions.map((q: string, i: number) => {
                                                    const isExpanded = expandedQuestions[i];
                                                    const displayText = q;
                                                    return (
                                                        <th key={i} className="px-6 py-3 whitespace-nowrap">
                                                            {displayText.length > 18 && !isExpanded ? (
                                                                <>
                                                                    {displayText.slice(0, 18)}...{' '}
                                                                    <span
                                                                        className="text-primary-300 text-sm ml-2"
                                                                        style={{ color: '#FF914D', fontWeight: 'bold', cursor: 'pointer' }}
                                                                        onClick={() => handleMoreClick(i)}
                                                                    >
                                                                        More
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    {displayText}
                                                                    {displayText.length > 18 && isExpanded && (
                                                                        <span
                                                                            className="text-primary-300 text-sm ml-2"
                                                                            style={{ color: '#FF914D', fontWeight: 'bold', cursor: 'pointer', marginLeft: 4 }}
                                                                            onClick={() => handleMoreClick(i)}
                                                                        >
                                                                            Less
                                                                        </span>
                                                                    )}
                                                                </>
                                                            )}
                                                        </th>
                                                    );
                                                })}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white">
                                            {selectedUser.responses
                                                .slice((detailPage - 1) * detailPageLimit, detailPage * detailPageLimit)
                                                .map((row: any, idx: number) => {
                                                    const globalIdx = (detailPage - 1) * detailPageLimit + idx;
                                                    return (
                                                        <tr key={idx} className="odd:bg-white even:bg-gray-50 border-b">
                                                            <td className="px-6 py-4 whitespace-nowrap">{row.response.ac_no}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">{row.response.booth_no}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                {row.response.audio_recording_path && (
                                                                    <AudioComp
                                                                        audioUrl={`${SERVER_BUCKET}/${row.response.audio_recording_path}`}
                                                                        isPlaying={playingAudioIdx === globalIdx}
                                                                        onPlay={() => setPlayingAudioIdx(globalIdx)}
                                                                        onPause={() => setPlayingAudioIdx(null)}
                                                                    />
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">{row.response.createdAt ? new Date(row.response.createdAt).toLocaleString() : ""}</td>
                                                            {allQuestions.map((q: string, i: number) => {
                                                                const answerObj = (row.response.responses || []).find((ans: any) => ans.question === q);
                                                                return (
                                                                    <td key={i} className="px-6 py-4 whitespace-nowrap">
                                                                        {answerObj ? answerObj.response : ""}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    );
                                                })}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex gap-3 items-center mt-4 pb-5 w-full">
                                    <div>
                                        <label htmlFor="detail-limit-select" className="mr-2 text-[13px]">
                                            Show:
                                        </label>
                                        <Select
                                            labelId="detail-limit-select-label"
                                            id="detail-limit-select"
                                            value={detailPageLimit}
                                            onChange={e => { setDetailPageLimit(Number(e.target.value)); setDetailPage(1); }}
                                            size="small"
                                            style={{ zoom: "80%" }}
                                        >
                                            <MenuItem value={10}>10</MenuItem>
                                            <MenuItem value={20}>20</MenuItem>
                                            <MenuItem value={50}>50</MenuItem>
                                            <MenuItem value={100}>100</MenuItem>
                                        </Select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setDetailPage(detailPage - 1)}
                                            disabled={detailPage === 1}
                                            className="p-2 border rounded-md disabled:opacity-50"
                                        >
                                            <IoIosArrowBack />
                                        </button>
                                        <span className="text-[13px]">
                                            Page {detailPage} of {Math.ceil(selectedUser.responses.length / detailPageLimit)}
                                        </span>
                                        <button
                                            onClick={() => setDetailPage(detailPage + 1)}
                                            disabled={detailPage === Math.ceil(selectedUser.responses.length / detailPageLimit)}
                                            className="p-2 border rounded-md disabled:opacity-50"
                                        >
                                            <IoIosArrowForward />
                                        </button>
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </div>
            )}
        </>
    );
}