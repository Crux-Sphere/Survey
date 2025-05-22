"use client";
import ChartCard from "@/components/ui/ChartCard";
import Loader from "@/components/ui/Loader";
import Pagination from "@/components/ui/pagination/Pagination";
import PieCard from "@/components/ui/PieCard";
import RecentRatings from "@/components/vrm-dashboard/RecentRatings";
import { getAllCallRatings, getUserPerformance } from "@/networks/vrm-networks";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Legend,
} from "recharts";

function Page() {
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [callRatingData, setCallRatingData] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [ratingFilter, setRatingFilter] = useState(""); // Rating filter
  const [dateFilter, setDateFilter] = useState(""); // Date filter
  const [mode,setMode] = useState<"daily"|"weekly"|"monthly">("daily");
  const params = useSearchParams();
  const userId = params.get("userId");
  const fetchUserPerformance = async () => {
    try {
      setLoading(true);
      const response: any = await getUserPerformance({ userId: userId , mode:mode});
      console.log("performance response", response);
      if (response.data && response.data.success) {
        setPerformanceData(response.data);
      }
    } catch (err) {
      toast.error("something went wrong");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUserPerformance();
  }, [mode]);

  console.log("performanceData", performanceData);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response: any = await getAllCallRatings({
          rating: ratingFilter,
          date: dateFilter,
          userId: userId,
          page,
          limit,
        });
        setCallRatingData(response.data.data);
        setTotal(response.data.totalPages);
        setPage(response.data.currentPage);
      } catch (error) {
        toast.error("Error while fetching data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [page, limit, ratingFilter, dateFilter]);

  // Reset Filters
  const resetFilters = () => {
    setDateFilter("");
    setRatingFilter("");
  };
  if(loading) return <Loader/>
  return (
    <main className="p-5">
      {/* Filters Section */}
      <div className="sticky top-0 left-0 bg-white p-4 rounded-md z-50 flex gap-5 mb-4 items-center">
        {/* Date Filter */}
        <input
          type="date"
          className="p-2 border rounded"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />

        {/* Rating Filter */}
        <select
          className="p-2 border rounded"
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
        >
          <option value="">All Ratings</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
        </select>

        {/* mode Filter */}
        <select
          className="p-2 border rounded"
          value={mode}
          onChange={(e) => setMode(e.target.value as "daily" | "weekly" | "monthly")}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>

        {/* Reset Button */}
        <button
          className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 transition"
          onClick={resetFilters}
        >
          Reset
        </button>
      </div>

      {/* Ratings List */}
      {callRatingData && <RecentRatings data={callRatingData} />}
      {/* Pagination */}
      <Pagination
        page={page}
        pageLimit={limit}
        totalResponsePages={total}
        setPage={setPage}
        setPageLimit={setLimit}
      />

      {performanceData && (
        <div className="mt-10 pb-10 flex flex-col gap-5">
          <ChartCard
            title="Total Call Ratings"
            data={performanceData?.data.datewiseStats.map((stat: any) => ({
              name: stat._id,
              value: stat.total,
            }))}
            xName="name"
            yName="value"
          />
          <div className="flex gap-5 w-full">
            <PieCard
              className="w-1/2"
              data={[
                {
                  name: "Positive",
                  value: performanceData?.data.positiveCalls,
                },
                {
                  name: "Negative",
                  value: performanceData?.data.negativeCalls,
                },
                { name: "Neutral", value: performanceData?.data.neutralCalls },
              ]}
              dataKey="value"
              nameKey="name"
              title="Rating distribution"
            />
            <ChartCard
              className="w-1/2"
              title="Positive Call Ratings"
              data={performanceData?.data.datewiseStats.map((stat: any) => ({
                name: stat._id,
                value: stat.positive,
              }))}
              xName="name"
              yName="value"
            />
          </div>
          <div className="flex gap-5 w-full">
            <ChartCard
              className="w-1/2"
              title="Neutral Call Ratings"
              data={performanceData?.data.datewiseStats.map((stat: any) => ({
                name: stat._id,
                value: stat.neutral,
              }))}
              xName="name"
              yName="value"
            />
            <ChartCard
              className="w-1/2"
              title="Negative Call Ratings"
              data={performanceData?.data.datewiseStats.map((stat: any) => ({
                name: stat._id,
                value: stat.negative,
              }))}
              xName="name"
              yName="value"
            />
          </div>
        </div>
      )}
    </main>
  );
}

export default Page;

// {
//     "callRatings": [
//         {
//             "_id": "67a4527a356bcd12b9acae2a",
//             "user_id": {
//                 "_id": "67a4516cef2a4440bceec19a",
//                 "username": "vre2",
//                 "name": "vre2",
//                 "email": "vre2@gmail.com",
//                 "password": "$2b$10$JYqa2c7icNC03/EziSmKPu7CwOZBzszUQM5EeCKMeZbRYdA4f5gp6",
//                 "role": [
//                     "6793cb217ad0c3539d615831"
//                 ],
//                 "auto_assign_survey": false,
//                 "veiw_own_collected_data": false,
//                 "prevent_data_download": false,
//                 "prevent_data_analytics": false,
//                 "prevent_spatial_report": false,
//                 "remove_audio_recording_access": false,
//                 "view_pending_data": false,
//                 "assigned_survey": [
//                     "67a44a9eef2a4440bceebe3a"
//                 ],
//                 "status": "active",
//                 "isOnline": false,
//                 "notification_token": "dwHKSZ78Q46YIB64pZAefF:APA91bEpL7_Q0kzuHuF7HcTzGmSe8WDeZpt39XjYNcb7Xx2OrviVGcTgvgNfILZyju9pgA4AiMH3clKrRNYfowsUCQnzztUtmTQu4paDgBEWG_jmF1NW4eo",
//                 "assigned_sample_surveys": [],
//                 "ac_list": [
//                     {
//                         "survey_id": "67a44a9eef2a4440bceebe3a",
//                         "ac_no": "1",
//                         "booth_numbers": [
//                             "1",
//                             "2"
//                         ],
//                         "_id": "67a451d1ef2a4440bceec1f3"
//                     }
//                 ],
//                 "createdAt": "2025-02-06T06:06:36.629Z",
//                 "updatedAt": "2025-05-15T03:22:04.731Z",
//                 "__v": 1
//             },
//             "response_id": "67a44df2356bcd12b9acacbf",
//             "rating": "positive",
//             "comment": "This is a good rating",
//             "createdAt": "2025-02-06T06:11:06.820Z",
//             "updatedAt": "2025-02-06T06:11:06.820Z",
//             "__v": 0
//         },
//         {
//             "_id": "67a4527a356bcd12b9acae28",
//             "user_id": {
//                 "_id": "67a4516cef2a4440bceec19a",
//                 "username": "vre2",
//                 "name": "vre2",
//                 "email": "vre2@gmail.com",
//                 "password": "$2b$10$JYqa2c7icNC03/EziSmKPu7CwOZBzszUQM5EeCKMeZbRYdA4f5gp6",
//                 "role": [
//                     "6793cb217ad0c3539d615831"
//                 ],
//                 "auto_assign_survey": false,
//                 "veiw_own_collected_data": false,
//                 "prevent_data_download": false,
//                 "prevent_data_analytics": false,
//                 "prevent_spatial_report": false,
//                 "remove_audio_recording_access": false,
//                 "view_pending_data": false,
//                 "assigned_survey": [
//                     "67a44a9eef2a4440bceebe3a"
//                 ],
//                 "status": "active",
//                 "isOnline": false,
//                 "notification_token": "dwHKSZ78Q46YIB64pZAefF:APA91bEpL7_Q0kzuHuF7HcTzGmSe8WDeZpt39XjYNcb7Xx2OrviVGcTgvgNfILZyju9pgA4AiMH3clKrRNYfowsUCQnzztUtmTQu4paDgBEWG_jmF1NW4eo",
//                 "assigned_sample_surveys": [],
//                 "ac_list": [
//                     {
//                         "survey_id": "67a44a9eef2a4440bceebe3a",
//                         "ac_no": "1",
//                         "booth_numbers": [
//                             "1",
//                             "2"
//                         ],
//                         "_id": "67a451d1ef2a4440bceec1f3"
//                     }
//                 ],
//                 "createdAt": "2025-02-06T06:06:36.629Z",
//                 "updatedAt": "2025-05-15T03:22:04.731Z",
//                 "__v": 1
//             },
//             "response_id": "67a44df2356bcd12b9acacbf",
//             "rating": "positive",
//             "comment": "This is a good rating",
//             "createdAt": "2025-02-06T06:11:06.144Z",
//             "updatedAt": "2025-02-06T06:11:06.144Z",
//             "__v": 0
//         },
//         {
//             "_id": "67a45279356bcd12b9acae26",
//             "user_id": {
//                 "_id": "67a4516cef2a4440bceec19a",
//                 "username": "vre2",
//                 "name": "vre2",
//                 "email": "vre2@gmail.com",
//                 "password": "$2b$10$JYqa2c7icNC03/EziSmKPu7CwOZBzszUQM5EeCKMeZbRYdA4f5gp6",
//                 "role": [
//                     "6793cb217ad0c3539d615831"
//                 ],
//                 "auto_assign_survey": false,
//                 "veiw_own_collected_data": false,
//                 "prevent_data_download": false,
//                 "prevent_data_analytics": false,
//                 "prevent_spatial_report": false,
//                 "remove_audio_recording_access": false,
//                 "view_pending_data": false,
//                 "assigned_survey": [
//                     "67a44a9eef2a4440bceebe3a"
//                 ],
//                 "status": "active",
//                 "isOnline": false,
//                 "notification_token": "dwHKSZ78Q46YIB64pZAefF:APA91bEpL7_Q0kzuHuF7HcTzGmSe8WDeZpt39XjYNcb7Xx2OrviVGcTgvgNfILZyju9pgA4AiMH3clKrRNYfowsUCQnzztUtmTQu4paDgBEWG_jmF1NW4eo",
//                 "assigned_sample_surveys": [],
//                 "ac_list": [
//                     {
//                         "survey_id": "67a44a9eef2a4440bceebe3a",
//                         "ac_no": "1",
//                         "booth_numbers": [
//                             "1",
//                             "2"
//                         ],
//                         "_id": "67a451d1ef2a4440bceec1f3"
//                     }
//                 ],
//                 "createdAt": "2025-02-06T06:06:36.629Z",
//                 "updatedAt": "2025-05-15T03:22:04.731Z",
//                 "__v": 1
//             },
//             "response_id": "67a44df2356bcd12b9acacbf",
//             "rating": "positive",
//             "comment": "This is a good rating",
//             "createdAt": "2025-02-06T06:11:05.945Z",
//             "updatedAt": "2025-02-06T06:11:05.945Z",
//             "__v": 0
//         },
//         {
//             "_id": "67a45279356bcd12b9acae24",
//             "user_id": {
//                 "_id": "67a4516cef2a4440bceec19a",
//                 "username": "vre2",
//                 "name": "vre2",
//                 "email": "vre2@gmail.com",
//                 "password": "$2b$10$JYqa2c7icNC03/EziSmKPu7CwOZBzszUQM5EeCKMeZbRYdA4f5gp6",
//                 "role": [
//                     "6793cb217ad0c3539d615831"
//                 ],
//                 "auto_assign_survey": false,
//                 "veiw_own_collected_data": false,
//                 "prevent_data_download": false,
//                 "prevent_data_analytics": false,
//                 "prevent_spatial_report": false,
//                 "remove_audio_recording_access": false,
//                 "view_pending_data": false,
//                 "assigned_survey": [
//                     "67a44a9eef2a4440bceebe3a"
//                 ],
//                 "status": "active",
//                 "isOnline": false,
//                 "notification_token": "dwHKSZ78Q46YIB64pZAefF:APA91bEpL7_Q0kzuHuF7HcTzGmSe8WDeZpt39XjYNcb7Xx2OrviVGcTgvgNfILZyju9pgA4AiMH3clKrRNYfowsUCQnzztUtmTQu4paDgBEWG_jmF1NW4eo",
//                 "assigned_sample_surveys": [],
//                 "ac_list": [
//                     {
//                         "survey_id": "67a44a9eef2a4440bceebe3a",
//                         "ac_no": "1",
//                         "booth_numbers": [
//                             "1",
//                             "2"
//                         ],
//                         "_id": "67a451d1ef2a4440bceec1f3"
//                     }
//                 ],
//                 "createdAt": "2025-02-06T06:06:36.629Z",
//                 "updatedAt": "2025-05-15T03:22:04.731Z",
//                 "__v": 1
//             },
//             "response_id": "67a44df2356bcd12b9acacbf",
//             "rating": "positive",
//             "comment": "This is a good rating",
//             "createdAt": "2025-02-06T06:11:05.766Z",
//             "updatedAt": "2025-02-06T06:11:05.766Z",
//             "__v": 0
//         }
//     ],
//     "totalCallRatings": 4,
//     "positiveCalls": 4,
//     "negativeCalls": 0,
//     "neutralCalls": 0,
//     "datewiseStats": [
//         {
//             "_id": "2025-02-06",
//             "positive": 4,
//             "negative": 0,
//             "neutral": 0,
//             "total": 4
//         }
//     ]
// }
  