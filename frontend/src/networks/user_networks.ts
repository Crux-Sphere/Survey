import { IUser } from "@/types/user_interfaces";
import {
  SERVER_URI,
  update_user,
  get_user,
  add_multiple_users,
  get_all_users,
  add_users,
  get_all_chats_data,
  update_users,
  get_all_karyakartas,
  create_karyakarta,
  update_karyakarta,
  get_karyakarta,
  get_panna_pramukh,
  updateMultipleKaryakarta,
} from "@/utils/constants";
import axios from "axios";

export const updateUsers = async (params: any) => {
  try {
    const bearerToken = localStorage.getItem("token");
    const options = {
      method: "POST",
      url: `${SERVER_URI}/${update_user}`,
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
      data: params,
    };
    const response = await axios.request(options);
    return response.data.success;
  } catch (error) {
    return { success: false, message: "Something Went Wrong", error };
  }
};
export const updateMultipleUsers = async (params: any) => {
  try {
    const bearerToken = localStorage.getItem("token");
    const options = {
      method: "POST",
      url: `${SERVER_URI}/${update_users}`,
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
      data: params,
    };
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    return { success: false, message: "Something Went Wrong", error };
  }
};

export const getUser = async (params: any) => {
  try {
    const bearerToken = localStorage.getItem("token");
    const options = {
      method: "GET",
      url: `${SERVER_URI}/${get_user}?userId=${params}`,
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    };
    const response = await axios.request(options);
    return response.data.data;
  } catch (error) {
    return { success: false, message: "Something Went Wrong", error };
  }
};

export const getAllUsers = async (params: {
  searchBarInput?: string;
  selectedRole?: string;
  withProfilePic?: boolean;
  page?: number;
  limit?: number;
}) => {
  try {
    const bearerToken = localStorage.getItem("token");
    const options = {
      method: "GET",
      url: `${SERVER_URI}/${get_all_users}`,
      params: {
        filter: params.searchBarInput || "",
        getWithProfilePicture: params.withProfilePic ?? false,
        role: params.selectedRole || "",
        page: params.page,
        limit: params.limit,
      },
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


export const addUsers = async (params: any) => {
  try {
    // const bearerToken =localStorage.getItem('token');
    const options = {
      method: "POST",
      url: `${SERVER_URI}/${add_users}`,
      // headers: {
      //   Authorization: `Bearer ${bearerToken}`,
      //   'Content-Type': 'application/json'
      // },
      data: params,
    };
    console.log(options);
    const response = await axios.request(options);
    //   const response = await axios.post(`${SERVER_URI}/${add_users}`,params,{
    //       headers: {
    //         Authorization: `Bearer ${bearerToken}`,
    //         'Content-Type': 'application/json'
    //       }
    //     }
    //   );
    console.log(response);
    return response.data.success;
  } catch (error) {
    return { success: false, message: "Something Went Wrong", error };
  }
};

export const addMultipleUsers = async (params: any) => {
  try {
    const options = {
      method: "POST",
      url: `${SERVER_URI}/${add_multiple_users}`,
      data: params,
    };
    const response = await axios.request(options);
    console.log(response);
    return response.data;
  } catch (error) {
    return { success: false, message: "Something Went Wrong", error };
  }
};

export const getAllChatsData = async (params: {
  currentUserId: string;
  searchBarInput: string;
  selectedRole: string;
  page?:number;
  limit?: number;
}) => {
  try {
    const options = {
      method: "GET",
      url: `${SERVER_URI}/${get_all_chats_data}`,
      params: {
        filter: params.searchBarInput,
        role: params.selectedRole,
        currentUserId:params.currentUserId,
        page:params.page,
        limit:params.limit
      },
    };
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: "Something Went Wrong while getting all chats data",
      error,
    };
  }
};


// karyakartas

export const getAllKaryakarta = async (params: {
  searchBarInput?: string;
  role?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const bearerToken = localStorage.getItem("token");
    const options = {
      method: "GET",
      url: `${SERVER_URI}/${get_all_karyakartas}`,
      params: {
        filter: params.searchBarInput || "",
        role: params.role || "",
        page: params.page,
        limit: params.limit,
      },
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
export const createKaryakarta = async (params: any) => {
  try {
    const bearerToken = localStorage.getItem("token");
    const options = {
      method: "POST",
      url: `${SERVER_URI}/${create_karyakarta}`,
      data:params,
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
export const updateKaryakarta = async (params: any) => {
  try {
    const bearerToken = localStorage.getItem("token");
    const options = {
      method: "POST",
      url: `${SERVER_URI}/${update_karyakarta}`,
      data:params,
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
export const updateKaryakartas = async (params: any) => {
  try {
    const bearerToken = localStorage.getItem("token");
    const options = {
      method: "POST",
      url: `${SERVER_URI}/${updateMultipleKaryakarta}`,
      data:params,
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    };
    const response = await axios.request(options);
    return response.data;
  } catch (error:any) {
    console.log("error in network",error)
    return { success: false, message: error.response.data.message, error };
  }
};
export const getKaryakarta = async (params: any) => {
  try {
    const bearerToken = localStorage.getItem("token");
    const options = {
      method: "GET",
      url: `${SERVER_URI}/${get_karyakarta}?id=${params}`,
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    };
    const response = await axios.request(options);
    return response.data.data;
  } catch (error) {
    return { success: false, message: "Something Went Wrong", error };
  }
};
export const getPannaPramukh= async (params: any) => {
  try {
    const bearerToken = localStorage.getItem("token");
    const options = {
      method: "GET",
      url: `${SERVER_URI}/${get_panna_pramukh}`,
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
      params
    };
    const response = await axios.request(options);
    return response.data.data;
  } catch (error) {
    return { success: false, message: "Something Went Wrong", error };
  }
};

