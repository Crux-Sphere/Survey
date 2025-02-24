"use client";
import ButtonFilled from "@/components/ui/buttons/ButtonFilled";
import { getAllTodos, updateTodo } from "@/networks/todo_networks";
import { checkToken, formatDate } from "@/utils/common_functions";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaFilter } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { MdRestartAlt } from "react-icons/md";

import "flatpickr/dist/themes/material_green.css";
import Loader from "@/components/ui/Loader";
import { getAllUsers } from "@/networks/user_networks";
import Flatpickr from "react-flatpickr";

import "flatpickr/dist/themes/material_orange.css";

const borderColors: any = {
  Open: "border-blue-200",
  Rescheduled: "border-amber-400",
  Completed: "border-green-500",
  Cancelled: "border-red-400",
};
const activityColors: any = {
  Call: "bg-violet-200",
  Task: "bg-amber-400",
};

function page() {
  const [scheduleModal, setScheduleModal] = useState<boolean>(false);
  const [assignedBy, setAssignedBy] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [filters, setFilters] = useState<any>({});
  const [reset, setReset] = useState<boolean>(false);
  const [searchTitle, setSearchTitle] = useState<string | null>(null);
  const [showData, setShowData] = useState<String | null>(null);
  const [tasks, setTasks] = useState<any[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [pageLimit, setPageLimit] = useState<number>(10);
  const [totalResponsePages, setTotalResponsePages] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [users, setUsers] = useState<any[]>([]);
  const [user, setUser] = useState<{ label: string; value: string } | null>(
    null
  );

    console.log("assigned_by-->",assignedBy)
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (assignedBy !== null) {
        handleGetAllTodos();
      }
  }, [reset, page, pageLimit, assignedBy]);

  useEffect(()=>{
    getUsers();
  },[])

  useEffect(() => {
    const token = checkToken();
    if (token) {
      setAssignedBy(token.id);
    }
  }, []);

  useEffect(() => {
    if (showMenu !== null) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside); // Cleanup
    };
  }, [showMenu]);

  // event handlers

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setShowMenu(null);
    }
  };

  //api calls

  async function getUsers() {
    const response = await getAllUsers({});
    console.log("users------>", response);
    if (response.success) {
      setUsers(response.data);
    } else {
      toast.error("Error fetching users!");
    }
  }

  async function handleGetAllTodos() {
    console.log("filters inside --?",filters)
    let params: any = { page, limit: pageLimit };
    setLoading(true);
    params.filters = {};
    if (Object.keys(filters).length > 0) params.filters = filters;
    if(assignedBy) params.filters = {...params.filters,assigned_to:assignedBy}
    if (searchTitle) params.title = searchTitle;

    console.log("params are -->",params)
    const response = await getAllTodos(params);
    console.log("res---->", response);
    if (response.success) {
      setTotalResponsePages(response.totalPages);
      setTasks(response.data);
    } else {
      toast.error("Error fetching todos!");
    }
    setLoading(false);
  }

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value, 10);
    setPageLimit(newLimit);
  };

  const handleNextPage = () => {
    setPage(page + 1);
  };

  const handlePreviousPage = () => {
    setPage(page - 1);
  };

  async function handleUpdateTodo(e:any,id:string) {
    e.preventDefault();
    const params: any = { id };
    params.updates = {status: "Completed"};
    const response = await updateTodo(params);
    console.log("res----->", response);
    if (response.success) {
      toast.success("Updated successfully!");
      handleGetAllTodos();
    } else {
      toast.error("Error updating todos");
    }
  }


  if (loading) return <Loader />;
  return (
    <main className="min-h-[calc(100vh-80px)] bg-light-gray">
      <nav className="w-full sticky top-0 bg-light-gray z-10 left-0 p-4 flex justify-between items-center">
        <h1 className="text-xl text-secondary-300">Your Tasks</h1>
      </nav>
      {/* search todo section */}
      <section className="flex gap-2 px-4 py-2 w-full bg-secondary-100">
        <input
          value={searchTitle || ""}
          onChange={(e) => setSearchTitle(e.target.value)}
          className="px-4 py-3 outline-none border w-[40%] text-secondary-300 focus:ring-2 focus:ring-blue-100 rounded-md"
          placeholder="Search tasks here"
        />
        <ButtonFilled onClick={handleGetAllTodos}>Search</ButtonFilled>
        <ButtonFilled
          onClick={() => {
            setSearchTitle("");
            setReset(!reset);
          }}
          className="bg-dark-gray px-4 text-white rounded-md"
        >
          Reset
        </ButtonFilled>
      </section>

      {/* todos listing */}
      <section className="my-4">
        <div className="w-[96%] mx-auto flex flex-col flex-1 max-h-[70vh] rounded-lg">
          {/* headings */}
          <div className="grid bg-dark-gray grid-cols-6 gap-2 rounded-lg p-4 border-b-2">
            {[
              "Due",
              "Status",
              "Activity",
              "Title",
              "Assigned by",
              "Action",
            ].map((el) => (
              <h3 className="text-white font-semibold">{el}</h3>
            ))}
          </div>

          {/* filters */}
          <div className="grid grid-cols-6 gap-2 mt-4">
            <Flatpickr
              className="border px-4 py-2"
              value={filters.date} // Pass state as the value
              onChange={(selectedDate) =>
                setFilters((prev: any) => ({
                  ...prev,
                  due_date: selectedDate[0],
                }))
              }
              options={{
                dateFormat: "Y-m-d", // Customize the date format
                minDate: "today", // Disable past dates
              }}
              placeholder="Select a date"
            />
            <select
              value={filters && filters.status ? filters.status : null}
              onChange={(e) =>
                setFilters((prev: any) => ({ ...prev, status: e.target.value }))
              }
              className=" border px-4 py-2"
            >
              <option selected disabled value={""}>
                Select
              </option>
              {["Open", "Rescheduled", "Cancelled", "Completed"].map((st) => (
                <option value={st}>{st}</option>
              ))}
            </select>
            <select
              value={filters && filters.activity ? filters.activity : null}
              onChange={(e) =>
                setFilters((prev: any) => ({
                  ...prev,
                  activity: e.target.value,
                }))
              }
              className=" border px-4 py-2"
            >
              <option selected disabled value={""}>
                Select
              </option>
              <option value="Call">Call</option>
              <option value="Task">Task</option>
            </select>
            <div className="flex gap-2 items-center col-start-7 text-xl">
              <button
                onClick={handleGetAllTodos}
                className="border rounded-md h-10 w-10 flex justify-center items-center bg-dark-gray text-white"
              >
                <FaFilter />
              </button>
              <button
                onClick={() => {
                  setFilters({});
                  setUser(null);
                  setReset(!reset);
                }}
                className="border rounded-md h-10 w-10 flex justify-center items-center bg-dark-gray text-white"
              >
                <MdRestartAlt />
              </button>
            </div>
          </div>

          {/* TODO list */}
          <div className="flex flex-col h-[50vh] max-h-[60vh] overflow-y-auto vertical-scrollbar gap-2 mt-4">
            {tasks && tasks.length > 0 ? (
              tasks.map((task) => (
                <div
                  onClick={() =>
                    setShowData((prev) => (prev === task._id ? null : task._id))
                  }
                  className={`bg-lighter-gray border-l-4 grid grid-cols-6 pl-1 rounded-tl-md rounded-bl-md cursor-pointer py-3 gap-4 ${
                    borderColors[task.status]
                  }`}
                >
                  <p>{formatDate(task.due_date)}</p>
                  <p>{task.status}</p>
                  <p
                    className={`w-fit rounded-lg flex items-center justify-center px-4 h-8 py-1 text-sm ${
                      activityColors[task.activity]
                    }`}
                  >
                    {task.activity}
                  </p>
                  <p>{task.title}</p>
                  <p className="h-8 w-8 rounded-full bg-primary-300 flex justify-center items-center text-white">
                    {task.assigned_by.name.charAt(0)}
                  </p>
                  <button onClick = {(e)=>handleUpdateTodo(e,task._id)} disabled={task.status === "Completed"} className={`text-white disabled:cursor-not-allowed rounded-md text-sm p-2 ${task.status === "Completed" ? "bg-green-700" : "bg-primary-300"}`}>
                   {task.status === "Completed" ? "Completed" : "Mark as completed"}
                  </button>
                  {/* Task details section with transition */}
                  <div
                    className={`col-span-6 flex flex-col transition-all duration-500 ease-in-out overflow-hidden ${
                      showData === task._id
                        ? "max-h-screen opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    {showData === task._id && (
                      <div className="w-full flex flex-col gap-2">
                        <div className="w-full border border-dashed border-dark-gray"></div>
                        <div className="grid grid-cols-12 w-3/4 gap-2">
                          <p className="col-span-2 font-semibold text-dark-gray">Due Date: </p>
                          <p className="col-span-10">
                            {formatDate(task.due_date)}
                          </p>
                          <p className="col-span-2 font-semibold text-dark-gray">Title: </p>
                          <p className="col-span-10">{task.title}</p>
                          <p className="col-span-2 font-semibold text-dark-gray">Description:</p>
                          <p className="col-span-10">{task.description}</p>
                          <p className="col-span-2 font-semibold text-dark-gray">Activity: </p>
                          <p className="col-span-10">{task.activity}</p>
                          <p className="col-span-2 font-semibold text-dark-gray">Status:</p>
                          <p className="col-span-10">{task.status}</p>
                          <p className="col-span-2 font-semibold text-dark-gray">Priority:</p>
                          <p className="col-span-10"> {task.priority}</p>
                          <p className="col-span-2 font-semibold text-dark-gray">Assigned By:</p>
                          <p className="col-span-10">{task.assigned_by.name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="h-[20vh] w-full flex justify-center items-center">
                No todos found
              </div>
            )}
          </div>
        </div>
      </section>
      {!loading && (
        <div className="flex gap-3 items-center mt-4 pb-4 bg-light-gray ml-3 sticky bottom-0 left-0">
          {/* Limit Select */}
          <div>
            <label htmlFor="limit-select" className="mr-2">
              Show:
            </label>
            <select
              id="limit-select"
              value={pageLimit}
              onChange={handleLimitChange}
              className="p-2 border rounded-md"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePreviousPage}
              disabled={page === 1}
              className="p-2 border rounded-md disabled:opacity-50"
            >
              <IoIosArrowBack />
            </button>
            <span>
              Page {page} of {totalResponsePages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={page === totalResponsePages}
              className="p-2 border rounded-md disabled:opacity-50"
            >
              <IoIosArrowForward />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default page;
