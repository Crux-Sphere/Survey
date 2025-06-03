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
  const userId = params.get("id");
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

