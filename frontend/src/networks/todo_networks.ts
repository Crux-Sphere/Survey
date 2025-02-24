import { create_todo, delete_todo, get_all_todos, get_todo, SERVER_URI, update_todo } from "@/utils/constants";
import axios from "axios";

export const createTodo = async (params: any) => {
    try {
      const bearerToken = localStorage.getItem("token");
      const options = {
        method: "POST",
        url: `${SERVER_URI}/${create_todo}`,
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
export const updateTodo = async (params: any) => {
    try {
      const bearerToken = localStorage.getItem("token");
      const options = {
        method: "POST",
        url: `${SERVER_URI}/${update_todo}`,
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
export const deleteTodo = async (params: any) => {
    try {
      const bearerToken = localStorage.getItem("token");
      const options = {
        method: "POST",
        url: `${SERVER_URI}/${delete_todo}`,
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
export const getAllTodos = async (params:any) => {
  console.log("params from todos network-->",params)
    try {
      const bearerToken = localStorage.getItem("token");
      const options = {
        method: "GET",
        url: `${SERVER_URI}/${get_all_todos}`,
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
        params
      };
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      return { success: false, message: "Something Went Wrong", error };
    }
  };
export const getTodo = async (params:any) => {
    try {
      const bearerToken = localStorage.getItem("token");
      const options = {
        method: "GET",
        url: `${SERVER_URI}/${get_todo}`,
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
        params
      };
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      return { success: false, message: "Something Went Wrong", error };
    }
  };