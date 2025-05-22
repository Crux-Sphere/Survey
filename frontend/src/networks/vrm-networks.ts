import { SERVER_URI , call_ratings, get_vrm_dashboard, user_performance } from "@/utils/constants";
import axios from "axios";

export const getVrmDashboard = async (params?:any) => {
    console.log("params from network --- >", params);
    try {
      const bearerToken = localStorage.getItem("token");
      const options = {
        method: "GET",
        url: `${SERVER_URI}/${get_vrm_dashboard}`,
        params:params,
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      };
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      return { success: false, message: "Something Went Wrong", error };
    }
  };
export const getAllCallRatings = async (params?:any) => {
    try {
      const bearerToken = localStorage.getItem("token");
      const options = {
        method: "GET",
        url: `${SERVER_URI}/${call_ratings}`,
        params:params,
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      };
      const response = await axios.request(options);
      return response
    } catch (error) {
      return { success: false, message: "Something Went Wrong", error };
    }
  };
export const getUserPerformance = async (params?:any) => {
    try {
      const bearerToken = localStorage.getItem("token");
      const options = {
        method: "GET",
        url: `${SERVER_URI}/${user_performance}`,
        params:params,
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      };
      const response = await axios.request(options);
      return response
    } catch (error) {
      return { success: false, message: "Something Went Wrong", error };
    }
  };

  