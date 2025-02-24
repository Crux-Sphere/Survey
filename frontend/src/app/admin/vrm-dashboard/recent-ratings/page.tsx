"use client";
import Loader from "@/components/ui/Loader";
import Pagination from "@/components/ui/pagination/Pagination";
import RecentRatings from "@/components/vrm-dashboard/RecentRatings";
import { getAllCallRatings } from "@/networks/vrm-networks";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

function Page() {
  const [callRatingData, setCallRatingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [ratingFilter, setRatingFilter] = useState(""); // Rating filter
  const [dateFilter, setDateFilter] = useState(""); // Date filter

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response: any = await getAllCallRatings({ rating: ratingFilter, date: dateFilter });
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

  if (loading) return <Loader />;

  return (
    <main className="p-5">
      {/* Filters Section */}
      <div className="flex gap-5 mb-4 items-center">
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
    </main>
  );
}

export default Page;
