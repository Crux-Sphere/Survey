"use client";
import RecentRatings from "@/components/vrm-dashboard/RecentRatings";
import { getAllCallRatings } from "@/networks/vrm-networks";
import React, { useEffect, useState } from "react";

function page() {
  const [callRatingData, setCallRatingData] = useState<any>(null);
  console.log("callRatingData", callRatingData);
  useEffect(() => {
    async function fetchData() {
      const response:any = await getAllCallRatings();
      console.log("response --- ",response)
      setCallRatingData(response.data.data);
    }

    fetchData();
  }, []);
  return <div>{callRatingData && <RecentRatings data={callRatingData} />}</div>;
}

export default page;
