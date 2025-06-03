"use client";

import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Colors,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
} from "chart.js";
import Loader from "../ui/Loader";
import VRMChart from "../vrm-dashboard/VRMChart";
import RecentRatings from "../vrm-dashboard/RecentRatings";
import { getKaryakartaDashboard } from "@/networks/user_networks";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  Colors,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler
);

const options: any = {
  responsive: false,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "right",
      labels: {
        usePointStyle: true,
        pointStyle: "circle",
      },
    },
  },
};

function Kdashboard() {
  const [callRatingCategoryData, setCallRatingCategoryData] = useState<any>(null);
  const [totalRatings, setTotalRatings] = useState<number>(0);

  const [positiveBarChartData, setPositiveBarChartData] = useState<any>({
    daily: null,
    weekly: null,
    monthly: null,
  });
  const [negativeBarChartData, setNegativeBarChartData] = useState<any>({
    daily: null,
    weekly: null,
    monthly: null,
  });
  const [neutralBarChartData, setNeutralBarChartData] = useState<any>({
    daily: null,
    weekly: null,
    monthly: null,
  });
  const [overallBarChartData, setOverallBarChartData] = useState<any>({
    daily: null,
    weekly: null,
    monthly: null,
  });

  const [recentRatings, setRecentRatings] = useState<any>([]);
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    setLoading(true);
    try {
      const response = await getKaryakartaDashboard();
      console.log(response);

      // Check if response data is valid
      const data = response.data;

      if (data?.ratingCount?.[0]?.totalRatings) {
        setTotalRatings(data.ratingCount[0].totalRatings);
      }

      // Pie chart for call rating categories
      if (data?.totalCallRatings) {
        const categories = data.totalCallRatings.map(
          (rating: any) => rating._id
        );
        const categoryCount = data.totalCallRatings.map(
          (rating: any) => rating.count
        );
        setCallRatingCategoryData({
          labels: categories,
          datasets: [
            {
              label: "Ratings",
              data: categoryCount,
              borderWidth: 1,
            },
          ],
        });
      }

      // Bar chart data for all ratings
      if (data?.positiveDailyRatingCount) {
        setPositiveBarChartData({
          daily: {
            labels: data.positiveDailyRatingCount.map((el: any) => el._id),
            datasets: [
              {
                label: "Good Ratings",
                data: data.positiveDailyRatingCount.map((el: any) => el.count),
              },
            ],
          },
          weekly: {
            labels: data.positiveWeeklyRatingCount.map((el: any) => el._id),
            datasets: [
              {
                label: "Good Ratings",
                data: data.positiveWeeklyRatingCount.map((el: any) => el.count),
              },
            ],
          },
          monthly: {
            labels: data.positiveMonthlyRatingCount.map(
              (el: any) => `${el._id.month}-${el._id.year}`
            ),
            datasets: [
              {
                label: "Good Ratings",
                data: data.positiveMonthlyRatingCount.map((el: any) => el.count),
              },
            ],
          },
        });
      }

      if (data?.negativeDailyRatingCount) {
        setNegativeBarChartData({
          daily: {
            labels: data.negativeDailyRatingCount.map((el: any) => el._id),
            datasets: [
              {
                label: "Bad Ratings",
                data: data.negativeDailyRatingCount.map((el: any) => el.count),
              },
            ],
          },
          weekly: {
            labels: data.negativeWeeklyRatingCount.map((el: any) => el._id),
            datasets: [
              {
                label: "Bad Ratings",
                data: data.negativeWeeklyRatingCount.map((el: any) => el.count),
              },
            ],
          },
          monthly: {
            labels: data.negativeMonthlyRatingCount.map(
              (el: any) => `${el._id.month}-${el._id.year}`
            ),
            datasets: [
              {
                label: "Bad Ratings",
                data: data.negativeMonthlyRatingCount.map((el: any) => el.count),
              },
            ],
          },
        });
      }

      if (data?.neutralDailyRatingCount) {
        setNeutralBarChartData({
          daily: {
            labels: data.neutralDailyRatingCount.map((el: any) => el._id),
            datasets: [
              {
                label: "Great Ratings",
                data: data.neutralDailyRatingCount.map((el: any) => el.count),
              },
            ],
          },
          weekly: {
            labels: data.neutralWeeklyRatingCount.map((el: any) => el._id),
            datasets: [
              {
                label: "Great Ratings",
                data: data.neutralWeeklyRatingCount.map((el: any) => el.count),
              },
            ],
          },
          monthly: {
            labels: data.neutralMonthlyRatingCount.map(
              (el: any) => `${el._id.month}-${el._id.year}`
            ),
            datasets: [
              {
                label: "Great Ratings",
                data: data.neutralMonthlyRatingCount.map((el: any) => el.count),
              },
            ],
          },
        });
      }

      if (data?.overallDailyRatingCount) {
        setOverallBarChartData({
          daily: {
            labels: data.overallDailyRatingCount.map((el: any) => el._id),
            datasets: [
              {
                label: "Overall Ratings",
                data: data.overallDailyRatingCount.map((el: any) => el.count),
              },
            ],
          },
          weekly: {
            labels: data.overallWeeklyRatingCount.map((el: any) => el._id),
            datasets: [
              {
                label: "Overall Ratings",
                data: data.overallWeeklyRatingCount.map((el: any) => el.count),
              },
            ],
          },
          monthly: {
            labels: data.overallMonthlyRatingCount.map(
              (el: any) => `${el._id.month}-${el._id.year}`
            ),
            datasets: [
              {
                label: "Overall Ratings",
                data: data.overallMonthlyRatingCount.map((el: any) => el.count),
              },
            ],
          },
        });
      }

      // Recent Ratings
      if (data?.recentCallRatings) {
        setRecentRatings(data.recentCallRatings);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <Loader/>;
  }

  return (
    <div className="p-4 flex flex-col gap-8">
      <h1 className="text-2xl font-bold mb-4">VRM Team manager Dashboard</h1>

      <div className="flex gap-6 rounded-lg">
        {/* Pie Chart */}
        {callRatingCategoryData ? (
          <div className="w-1/2 bg-white p-4 rounded-xl flex flex-col items-center border-2">
            <div className="cursor-pointer flex justify-between items-center border-2 shadow-md rounded-[25px] px-10 py-10 bg-white w-full">
              <h2 className="text-[20px] font-bold">Total Ratings</h2>
              <img src="/images/right.png" className="h-3" />
              <h2 className="text-[20px] font-bold">{totalRatings}</h2>
            </div>
            <Pie
              data={callRatingCategoryData}
              options={options}
              width={300}
              height={300}
            />
          </div>
        ) : null}

        {overallBarChartData && (
          <div className="w-1/2 bg-white p-4 rounded-xl border-2">
            <VRMChart
              title="Overall Ratings"
              barChartData={overallBarChartData}
            />
          </div>
        )}
      </div>

      {recentRatings && <RecentRatings data={recentRatings} mode="karyakarta" />}

      <div className="flex gap-6">
        {positiveBarChartData && (
          <div className="w-1/2 bg-white p-4 rounded-xl border-2">
            <VRMChart
              title="Positive Ratings"
              barChartData={positiveBarChartData}
            />
          </div>
        )}
        {negativeBarChartData && (
          <div className="w-1/2 bg-white p-4 rounded-xl border-2">
            <VRMChart
              title="Negative Ratings"
              barChartData={negativeBarChartData}
            />
          </div>
        )}
      </div>

      {neutralBarChartData && (
        <div className="w-1/2 bg-white p-4 rounded-xl border-2">
          <VRMChart
            title="Neutral Ratings"
            barChartData={neutralBarChartData}
          />
        </div>
      )}
    </div>
  );
}

export default Kdashboard;
