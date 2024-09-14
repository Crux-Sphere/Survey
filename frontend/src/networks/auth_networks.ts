import {
    SERVER_URI,
    login,
    forgot_password,
    reset_password
  } from "@/utils/constants";
  import axios from "axios";


  export const loginUser = async (params: any) => {
    try {
      const options = {
        method: "POST",
        url: `${SERVER_URI}/${login}`,
        data: params,
      };
      const response = await axios.request(options);
      return response.data; // Successful login
    } catch (error: any) {
      // Handle the error response correctly
      if (error.response) {
        // Error response from the backend (with status code and message)
        return {
          success: false,
          message: error.response.data.message || "Something went wrong",
          error: error.response.data, // Capture entire error object from backend
        };
      } else {
        // Network error or other Axios error
        return {
          success: false,
          message: "Network error. Please try again.",
          error: error.message,
        };
      }
    }
  };
  
  export const forgotPassword = async (params: any) => {
    try {
      const options = {
        method: "POST",
        url: `${SERVER_URI}/${forgot_password}`,
        data: params,
      };
      const response = await axios.request(options);
  
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to send email.");
      }
  
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || "Something went wrong");
      } else {
        throw new Error("Network error. Please try again.");
      }
    }
  };

  export const resetPassword = async (params: any) => {
    try {
      const options = {
        method: "POST",
        url: `${SERVER_URI}/${reset_password}`,
        data: params,
      };
      const response = await axios.request(options);
      return response.data;
    } catch (error:any) {
      if (error.response) {
        return {
          success: false,
          message: error.response.data.message || "Something went wrong",
          error: error.response.data,
        };
      } else {
        return {
          success: false,
          message: "Network error. Please try again.",
          error: error.message,
        };
      }
    }
  }