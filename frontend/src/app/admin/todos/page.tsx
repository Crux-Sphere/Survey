"use client";
import ButtonFilled from "@/components/ui/buttons/ButtonFilled";
import { deleteTodo, getAllTodos } from "@/networks/todo_networks";
import { checkToken, formatDate } from "@/utils/common_functions";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { BsThreeDots } from "react-icons/bs";
import { FaFilter } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward, IoIosCall } from "react-icons/io";
import { MdRestartAlt } from "react-icons/md";

import "flatpickr/dist/themes/material_green.css";
import AddTodo from "@/components/todo-list/AddTodo";
import Loader from "@/components/ui/Loader";
import { getAllUsers } from "@/networks/user_networks";
import Select from "react-select";
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

  console.log("date is --->", filters);

  console.log("selected user ----->", user);

  const router = useRouter();

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    handleGetAllTodos();
    getUsers();
  }, [reset, page, pageLimit]);
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
    const params: any = { page, limit: pageLimit };
    setLoading(true);
    if (Object.keys(filters).length > 0) params.filters = filters;
    if (searchTitle) params.title = searchTitle;

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

  async function handleDeleteTodo(id: string) {
    const response = await deleteTodo({ id });
    console.log("res----->", response);
    if (response.success) {
      toast.success("Deleted successfully!");
      setScheduleModal(false);
      setEditing(null);
      handleGetAllTodos();
    } else {
      toast.error("Error deleting todos");
    }
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
  if (loading) return <Loader />;
  return (
    <main>
      <nav className="w-full sticky top-0 bg-white z-10 left-0 p-4 flex justify-between items-center">
        <h1 className="text-xl text-secondary-300">To-Do List</h1>
        <div className="flex gap-2">
          <ButtonFilled onClick={() => setScheduleModal(true)}>
            Add schedule
          </ButtonFilled>
          <ButtonFilled className="bg-dark-gray" onClick={() => router.back()}>
            Back
          </ButtonFilled>
        </div>
      </nav>
      {/* search todo section */}
      <section className="flex gap-2 px-4 py-2 w-full bg-secondary-100">
        <input
          value={searchTitle || ""}
          onChange={(e) => setSearchTitle(e.target.value)}
          className="px-4 py-3 outline-none border w-[40%] text-secondary-300 focus:ring-2 focus:ring-blue-100 rounded-md"
          placeholder="Search todos here"
        />
        <ButtonFilled onClick={handleGetAllTodos}>Search</ButtonFilled>
        <ButtonFilled
          onClick={() => {
            setSearchTitle("");
            setReset(!reset);
          }}
          className="bg-dark-gray"
        >
          Reset
        </ButtonFilled>
      </section>

      {/* todos listing */}
      <section className="my-4">
        <div className="w-[96%] mx-auto flex flex-col flex-1 h-[70vh] max-h-[70vh] rounded-lg">
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
            <Select
              options={users.map((user: any) => ({
                label: user.name,
                value: user._id, // Map `option` to `user._id`
              }))}
              value={user} // Correct structure for `value`
              onChange={(selectedValue) => {
                setUser(selectedValue);
                if (selectedValue) {
                  setFilters((prev: any) => ({
                    ...prev,
                    assigned_to: selectedValue.value,
                  }));
                }
              }} // Update selected users on change
              className="basic-multi-select"
              classNamePrefix="select"
              placeholder="Select user"
            />
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
                  <div
                    ref={menuRef}
                    className="relative cursor-pointer w-fit"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu((prev) => (prev === null ? task._id : null));
                    }}
                  >
                    <BsThreeDots />
                    {showMenu === task._id && (
                      <div className="flex transition duration-300 ease-in-out flex-col gap-3 absolute right-[110%] top-0 px-4 w-32 bg-white shadow-md border-2 rounded-md">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditing(task._id);
                            setShowMenu(null);
                            setScheduleModal(true);
                          }}
                          className="w-full text-left border-b py-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTodo(task._id);
                          }}
                          className="w-full text-left py-2"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
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
      <AddTodo
        assignedBy={assignedBy}
        editing={editing}
        handleGetAllTodos={handleGetAllTodos}
        scheduleModal={scheduleModal}
        setAssignedBy={setAssignedBy}
        setEditing={setEditing}
        setScheduleModal={setScheduleModal}
        users={users}
        getUsers={getUsers}
      />
      {!loading && (
        <div className="flex gap-3 items-center my-4 ml-3">
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
