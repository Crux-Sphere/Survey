"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Tooltip } from "react-tooltip";
import { checkToken } from "@/utils/common_functions";
import { MdKeyboardArrowRight } from "react-icons/md";
import { IoMdLogOut } from "react-icons/io";
import Button from "@mui/material/Button";
import { AiOutlineLogout } from "react-icons/ai";
import { AiOutlineDashboard } from "react-icons/ai";
import { GoChecklist } from "react-icons/go";
import { BsDatabaseCheck } from "react-icons/bs";
import { TbReportAnalytics } from "react-icons/tb";
import { FaRegListAlt } from "react-icons/fa";
import { LuListTodo } from "react-icons/lu";
import { FaRegUser } from "react-icons/fa6";
import { FiUsers } from "react-icons/fi";
import { BiSupport } from "react-icons/bi";



// Paths that should have a small sidebar
function Sidebar({ sidebarOpen, onSidebarToggle }: any) {
  const path = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const token = checkToken();
    if (token) {
      setUser(token);
    }
  }, []);

  // Define Sidebar items
  let SidebarScreens: any = [
    {
      icon: <AiOutlineDashboard size={20} />,
      name: "Dashboard",
      path: "/admin",
      tooltip: "Dashboard",
    },
    {
      icon: <AiOutlineDashboard size={20} />,
      name: "Karyakarta Dashboard",
      path: "/admin/karyakarta-dashboard",
      tooltip: "Karyakarta Dashboard",
    },
    {
      icon: <AiOutlineDashboard size={20} />,
      name: "Karyakarta Performance",
      path: "/admin/karyakarta-performance",
      tooltip: "Karyakarta performance",
    },
    {
      icon: <GoChecklist size={20}/>,
      name: "Surveys",
      path: "/admin/surveys",
      tooltip: "Surveys",
    },
    {
      icon: <BsDatabaseCheck size={20} />,
      name: "Data",
      path: "/admin/data",
      tooltip: "Data",
    },
    {
      icon: <BsDatabaseCheck size={20} />,
      name: "Daily Work Reports",
      path: "/admin/daily-work",
      tooltip: "Daily Work Reports",
    },
    {
      icon: <TbReportAnalytics size={22}/>,
      name: "Report",
      path: "/admin/report2",
      tooltip: "Report",
    },
    // {
    //   icon: <TbReportAnalytics size={22}/>,
    //   name: "Report 2",
    //   path: "/admin/report2",
    //   tooltip: "Report 2",
    // },
    {
      icon: <FaRegListAlt size={16}/>,
      name: "Survey Sampling",
      path: "/admin/survey-sampling",
      tooltip: "Survey Sampling",
    },
    {
      icon: <LuListTodo size={20}/>,
      name: "To-Do list",
      path: "/admin/todos",
      tooltip: "todo-list",
    },
   

  ];

  let bottomTabs = [
    {
     icon: <LuListTodo size={20}/>,
     name: "VRE Performance",
     path: "/admin/vre",
     tooltip: "todo-list",
   },
    {
      icon: <BiSupport size={20}/>,
      name: "Support",
      path: "/admin/support",
      tooltip: "Support",
    },
  ];

  // Filter out "Karyakarta" and "Users" tabs if the user has "operation team" role
  console.log("users from sidebar -->", user);
  if (user?.role) {
    const roleName = user.role.map((el: any) => el.name);
    console.log("roleNmae are ---->", roleName);

    if (roleName.includes("Operation team")) {
      SidebarScreens = SidebarScreens.filter(
        (item: any) => item.name !== "Karyakarta" && item.name !== "Users"
      );
    } else if (roleName.includes("Supervisor")) {
      SidebarScreens.push({
        icon: <FaRegUser size={17}/>,
        name: "Collectors",
        path: "/admin/collectors",
        tooltip: "Collectors",
      });
      SidebarScreens = SidebarScreens.filter(
        (item: any) => item.name === "Collectors"
      );
    } else if (roleName.includes("Survey Manager")) {
      SidebarScreens = SidebarScreens.filter(
        (item: any) => item.name === "Surveys"
      );
    } else if (roleName.includes("Quality Check")) {
      SidebarScreens.push({
        icon: <FaRegUser size={17}/>,
        name: "All surveys",
        path: "/admin/quality-check-surveys",
        tooltip: "All surveys",
      });
      SidebarScreens = SidebarScreens.filter(
        (item: any) => item.name === "All surveys"
      );
    } else if (
      roleName.includes("Data Analyst") ||
      roleName.includes("Data Manager")
    ) {
      SidebarScreens = SidebarScreens.filter(
        (item: any) => item.name === "Data"
      );
    } else if (roleName.includes("Support Executive")) {
      SidebarScreens = SidebarScreens.filter(
        (item: any) => item.name === "Support"
      );
    } else if (roleName.includes("VRM Team Manager")) {
      SidebarScreens = SidebarScreens.filter(
        (item: any) => item.name === "Support" || item.name === "VRE Performance"
      );
      SidebarScreens.push({
        icon:<AiOutlineDashboard size={20} />,
        name: "VRM Dashboard",
        path: "/admin/vrm-dashboard",
        tooltip: "VRM Dashboard",
      });
    }else {
      SidebarScreens.push(
        {
          icon: <FaRegUser size={17}/>,
          name: "Karyakarta",
          path: "/admin/karyakarta",
          tooltip: "Karyakarta",
        },
        {
          icon: <FiUsers size={20}/>,
          name: "Users",
          path: "/admin/users",
          tooltip: "Users",
        }
      );
    }

    if(!roleName.includes("Admin")){
      console.log("adding tasks")
      SidebarScreens.push({
        icon: <LuListTodo size={20} />,
        name: "Tasks",
        path: "/admin/tasks",
        tooltip: "Tasks",
      });
    } 
  }
  function getSidebarButtonClass(el: any) {
    return `relative flex rounded-md ${
      sidebarOpen ? "w-full my-1" : "w-fit self-center mb-5"
    } transition-all ease-in-out duration-200 ${
      el.path === "/admin" || el.path === "/admin/karyakarta-dashboard" || el.path === "/admin/karyakarta" || el.path === "/admin/karyakarta-performance" // Exact match for Dashboard
        ? path === el.path
          ? "bg-[rgba(255,255,255,0.1)] activeTab hover:bg-[rgba(255,255,255,0.1)]"
          : "text-[#fff] hover:bg-[rgba(255,255,255,0.1)] text-[14px]"
        : path.includes(el.path) // For all other paths
        ? "bg-[rgba(255,255,255,0.1)] activeTab hover:bg-[rgba(255,255,255,0.1)]"
        : "text-[#fff] hover:bg-[rgba(255,255,255,0.1)] text-[14px]"
    }`;
  }

  return (
    <aside
      className={`sidebar font-nunito-sans h-screen overflow-visible relative flex flex-col transition-all duration-300 ease-in-out pb-5 bg-[#112143] ${
        sidebarOpen ? "w-[280px]" : "w-[75px]"
      }`}
    >
      <div className="flex flex-col h-full w-full">
        <h1
          onClick={() => router.push("/admin")}
          className="flex flex-col font-semibold gap-3 cursor-pointer justify-center pt-4 px-3 items-center"
        >
          {sidebarOpen ? (
            // <Image
            //   src={surveyProfile.src}
            //   alt="logo"
            //   height={80}
            //   width={80}
            // />
            <div className="flex items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-primary-300 flex-shrink-0">
                <img src="/icons/logo.png" className="h-full w-full" />
              </div>
              <h1 className="font-[500] text-[15px] text-white leading-5 opacity-90">
                BHARAT DEMOGRAPHIC RESEARCH
              </h1>
            </div>
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary-300 flex-shrink-0">
              <img src="/icons/logo.png" className="h-full w-full" />
            </div>
          )}
          {/* <Button>Profile</Button> */}
        </h1>

        <div className="sidebarScroll ">
          {/* upper section of tabs */}
          <div
            className={`flex flex-col items-start pt-5 ${
              sidebarOpen ? "px-2" : ""
            }`}
          >
            {SidebarScreens.map((el: any, ind: number) => (
              <div key={ind} className={getSidebarButtonClass(el)}>
                <Button
                  onClick={() => {
                    router.push(el.path);
                  }}
                  className={`!text-[rgba(255,255,255,0.8)] !capitalize font-[500]  rounded-md !px-3 !py-[9px] flex items-center gap-3  ${
                    !sidebarOpen ? "w-fit" : "w-full"
                  }`}
                >
                  {!sidebarOpen && (
                    <div
                      className="w-full"
                      data-tooltip-id={`tooltip-${ind}`}
                      data-tooltip-content={el.tooltip}
                      data-tooltip-place="right"
                    >
                      {el.icon}
                      
                    </div>
                  )}
                  {sidebarOpen && el.icon}
                  <span className="text-[14px]">{sidebarOpen && el.name}</span>
                  {sidebarOpen && (
                    <MdKeyboardArrowRight className="ml-auto text-[18px]" />
                  )}
                </Button>
                <Tooltip
                  id={`tooltip-${ind}`}
                  style={{ zIndex: 30, position: "fixed" }}
                />
              </div>
            ))}
          </div>

          {/* lower section of tabs */}
          <div className={`flex flex-col w-full ${sidebarOpen ? "px-2" : ""}`}>
            {bottomTabs.map((el: any, ind: number) => (
              <div key={ind} className={getSidebarButtonClass(el)}>
                <Button
                  onClick={() => {
                    router.push(el.path);
                  }}
                  className={`!text-[rgba(255,255,255,0.8)] !capitalize font-[500]  rounded-md !px-3 !py-[9px] flex items-center gap-3 ${
                    !sidebarOpen ? "" : "w-full"
                  }`}
                >
                  {!sidebarOpen && (
                    <div
                      className="w-full"
                      data-tooltip-id={`tooltip-${ind}`}
                      data-tooltip-content={el.tooltip}
                      data-tooltip-place="right"
                    >
                      {el.icon}
                    </div>
                  )}
                  {sidebarOpen &&  el.icon}
                  {sidebarOpen && el.name}
                  {sidebarOpen && (
                    <MdKeyboardArrowRight className="ml-auto text-[18px]" />
                  )}
                </Button>
                <Tooltip
                  id={`tooltip-${ind}`}
                  style={{ zIndex: 30, position: "fixed" }}
                />
              </div>
            ))}

            <div className="hover:bg-[rgba(255,255,255,0.1)] rounded-md">
              <Button
                onClick={() => {
                  localStorage.removeItem("jwt");
                  router.push("/");
                }}
                className={`!text-[rgba(255,255,255,0.8)] !capitalize font-[500]  rounded-md !px-3 !py-[9px] flex items-center gap-3 ${
                  !sidebarOpen ? "" : "w-full"
                }`}
              >
                {!sidebarOpen && (
                  <div
                    className="w-full"
                    data-tooltip-id={`tooltip-logout`}
                    data-tooltip-content={"Logout"}
                    data-tooltip-place="right"
                  >
                    <AiOutlineLogout size={18} />
                  </div>
                )}
                {sidebarOpen && <AiOutlineLogout size={18} />}
                {sidebarOpen && "Logout"}
                {sidebarOpen && (
                  <MdKeyboardArrowRight className="ml-auto text-[18px]" />
                )}
              </Button>
              <Tooltip
                id={`tooltip-logout`}
                style={{ zIndex: 30, position: "fixed" }}
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
