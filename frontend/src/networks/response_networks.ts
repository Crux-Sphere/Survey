import { delete_response, get_all_survey_responses, get_survey_responses, get_survey_responses_by_family, save_quality_remark, save_responses, SERVER_URI, update_response, get_report_2 } from "@/utils/constants";
import axios, { AxiosRequestConfig } from "axios";


export const saveResponses = async (params: any) => {
    try {
      const options = {
        method: "POST",
        url: `${SERVER_URI}/${save_responses}`,
        data: params,
      };
      const response = await axios.request(options);
      console.log(response);
      return response.data;
    } catch (error) {
      return { success: false, message: "Something Went Wrong", error };
    }
  };
export const getAllSurveyResponses = async (params:any) => {
    try {
      const options = {
        method: "GET",
        url: `${SERVER_URI}/${get_all_survey_responses}`,
        params
      };
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      return { success: false, message: "Something Went Wrong", error };
    }
  };
export const getSurveyResponses = async (params:any) => {
    try {
      const options = {
        method: "GET",
        url: `${SERVER_URI}/${get_survey_responses}`,
        params
      };
      const response = await axios.request(options);
      console.log("response --->",response)
      return response.data;
    } catch (error) {
      return { success: false, message: "Something Went Wrong", error };
    }
  };
export const getSurveyResponsesByFamily = async (params:any) => {
    try {
      const options = {
        method: "GET",
        url: `${SERVER_URI}/${get_survey_responses_by_family}`,
        params
      };
      const response = await axios.request(options);
      console.log("response --->",response)
      return response.data;
    } catch (error) {
      return { success: false, message: "Something Went Wrong", error };
    }
  };
export const downloadResponses = async (params:any) => {
    try {
      const options :AxiosRequestConfig = {
        method: "GET",
        url: `${SERVER_URI}/${get_survey_responses}`,
        params,
        responseType: "blob",
      };
      const response = await axios.request(options);
      console.log("response --->",response)
      return response;
    } catch (error) {
      return { success: false, message: "Something Went Wrong", error };
    }
  };

export const updateResponse = async(params:any) =>{
  try {
    const options :AxiosRequestConfig = {
      method: "POST",
      url: `${SERVER_URI}/${update_response}`,
      data:params
    };
    const response = await axios.request(options);
    console.log("response --->",response)
    return response.data;
  } catch (error) {
    return { success: false, message: "Something Went Wrong", error };
  }
}
export const saveQualityRemark = async(params:any) =>{
  try {
    const options :AxiosRequestConfig = {
      method: "POST",
      url: `${SERVER_URI}/${save_quality_remark}`,
      data:params
    };
    const response = await axios.request(options);
    console.log("response --->",response)
    return response.data;
  } catch (error) {
    return { success: false, message: "Something Went Wrong", error };
  }
}
export const deleteResponse = async(params:any) =>{
  try {
    const options :AxiosRequestConfig = {
      method: "POST",
      url: `${SERVER_URI}/${delete_response}`,
      data:params
    };
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    return { success: false, message: "Something Went Wrong", error };
  }
}
export const getReport2 = async(params:any) =>{
  try {
    const { surveyId, caste, startDate, endDate } = params;
    
    const options :AxiosRequestConfig = {
      method: "GET",
      url: `${SERVER_URI}/api/response/getCasteBasedData`,
      params: {
        surveyId,
        caste,
        startDate,
        endDate
      }
    };
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    return { success: false, message: "Something Went Wrong", error };
  }
}

export const importSurveyFromExcel = async(formData: FormData) =>{
  try {
    const options :AxiosRequestConfig = {
      method: "POST",
      url: `${SERVER_URI}/api/response/importSurveyFromExcel`,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    return { success: false, message: "Something Went Wrong", error };
  }
}