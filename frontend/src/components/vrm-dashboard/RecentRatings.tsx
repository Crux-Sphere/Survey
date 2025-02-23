"use client";
import { formatDate, truncateText } from "@/utils/common_functions";
import { useRouter } from "next/navigation";
import React from "react";

function RecentRatings({ data }: any) {
  const router = useRouter()
  return (
    <div className="w-full rounded-[25px] flex flex-col gap-4 bg-white shadow-md p-5">
      <div className="flex justify-between items-center">
        <h3 className="text-[20px] font-bold">Recent Logs and Ratings</h3>
        <button onClick={()=>router.push("/admin/vrm-dashboard/recent-ratings")} className="text-[13px] text-blue-500 font-semibold">
          View all
        </button>
      </div>
      <div className="rounded-[25px] flex flex-col gap-4 bg-lighter-gray h-[50vh] p-4 w-full border-2 vertical-scrollbar-orange overflow-y-scroll">
        {/* Table Header */}
        <div className="grid grid-cols-5 w-full text-[13px] font-semibold place-items-center border-b pb-2">
          <p>Comment</p>
          <p>Response ID</p>
          <p>User</p>
          <p>Rating</p>
          <p>Created At</p>
        </div>
        {/* Data Rows */}
        {data.length > 0 ? (
          data.map((rating: any) => (
            <div
              key={rating._id}
              className="cursor-pointer grid grid-cols-5 w-full place-items-center text-[13px] py-2 hover:bg-gray-100 rounded-md"
            >
              <p>{truncateText(rating.comment, 20)}</p>
              <p>{truncateText(rating.response_id, 10)}</p>
              <p>{rating.user && truncateText(rating.user?.name, 20)}</p>
              <p
                className={`text-center font-semibold ${
                  rating.rating === "positive"
                    ? "text-green-500"
                    : rating.rating === "negative"
                    ? "text-red-500"
                    : "text-amber-500"
                }`}
              >
                {rating.rating || "N/A"}
              </p>
              <p className="text-dark-gray">{formatDate(rating.createdAt)}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-dark-gray">
            No recent logs or ratings available.
          </p>
        )}
      </div>
    </div>
  );
}

export default RecentRatings;
