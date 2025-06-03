"use client";
import ButtonFilled from "@/components/ui/buttons/ButtonFilled";
import { getAllKaryakarta, updateKaryakarta } from "@/networks/user_networks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import { IUser } from "@/types/user_interfaces";
import Switch from "react-switch";
import {
  IoIosAddCircle,
  IoIosArrowBack,
  IoIosArrowForward,
} from "react-icons/io";
import Loader from "@/components/ui/Loader";
import { CgImport } from "react-icons/cg";
import KaryakartaHeader from "@/components/karyakarta/KaryakartaHeader";
import Button from "@mui/material/Button";
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';

function page() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [searchBarInput, setSearchBarInput] = useState<string>("");
  const [limit, setLimit] = useState<any>(10);
  const [page, setPage] = useState<any>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [reset, setReset] = useState<boolean>(false);

  useEffect(() => {
    getData();
  }, [limit, page, reset]);

  async function getData() {
    const params = { searchBarInput, page, limit };
    setLoading(true);
    const res: any = await getAllKaryakarta(params);
    setLoading(false);
    console.log("res::::", res);
    if (res.error) return;
    setUsers(res.data);
    setTotalPages(res.totalPages);
  }
  const router = useRouter();

  function handleEditUser(_id: string) {
    router.push(`/admin/karyakarta/add-karyakarta?_id=${_id}`);
  }
  const handleLimitChange = (event: SelectChangeEvent) => {
    const newLimit = parseInt(event.target.value, 10);
    setLimit(newLimit);
    setPage(1);
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };
  const doNothing = async ({
    id,
    status,
    role,
  }: {
    id: string;
    status: string;
    role: string;
  }) => {
    const params = { id, status, role };
    await updateKaryakarta(params);
    getData();
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] px-8">
      {/* <KaryakartaHeader setReset={setReset} /> */}
       <nav className="h-16 w-full py-1 pt-0 flex justify-between items-center">
        <h3 className="text-[18px] font-[600]">Karyakarta Users</h3>
      </nav>

      <div className="p-3 text-sm bg-white rounded-md shadow-md my-2">
        <div className="flex justify-between">
          <input
            className="w-[387px] formInput "
            placeholder="Name / Username / Role"
            value={searchBarInput}
            onChange={(e) => setSearchBarInput(e.target.value)}
          />
          <div className="flex space-x-2">
            <Button
              onClick={() => {
                getData();
              }}
              className="btn-custom !bg-orange-600 !text-white"
            >
              Search
            </Button>
            <div className="flex space-x-3">
              <ButtonFilled
                className="btn-custom !bg-dark-gray !text-white"
                onClick={() => {
                  setSearchBarInput("");
                  setReset(!reset);
                }}
              >
                Reset
              </ButtonFilled>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-3 my-4 rounded-md shadow-md sm:rounded-lg bg-white">
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                <th scope="col" className="px-6 py-3">
                  User Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Email
                </th>
                <th scope="col" className="px-6 py-3">
                  Role
                </th>
              </tr>
            </thead>

            <tbody>
              {!loading && users && users.length !== 0 ? (
                users.map((user, index) => (
                  <tr
                    onClick={()=>router.push(`/admin/karyakarta-performance/performance?id=${user._id}`)}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 cursor-pointer"
                    key={index}
                  >
                    <td className="px-6 py-2 font-[500]">{user.name}</td>

                    <td className="px-6 py-2 font-[500]">{user.username}</td>

                    <td className="px-6 py-2 font-[500]">{user.email}</td>

                    <td className="px-6 py-2 font-[500]">
                      {user.role.map((role: any, roleIndex: number) => {
                        return (
                          <span key={roleIndex} className="whitespace-nowrap">
                            {role.name}
                            {roleIndex < user.role.length - 1 ? "," : ""}
                          </span>
                        );
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <div className="flex justify-center items-center h-[20vh] w-full">
                  No karyakartas found
                </div>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && (
        <div className="flex gap-3 items-center mt-4 pl-4 py-3 sticky bottom-2 left-0 bg-[#fff] rounded-md shadow-md">
          {/* Limit Select */}
          <div>
            <label htmlFor="limit-select" className="mr-2 text-[13px]">
              Show:
            </label>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={limit}
              onChange={handleLimitChange}
              size="small"
              style={{zoom:'80%'}}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={page === 1}
              className="p-2 border rounded-md disabled:opacity-50"
            >
              <IoIosArrowBack />
            </button>
            <span className="text-[13px]">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={page === totalPages}
              className="p-2 border rounded-md disabled:opacity-50"
            >
              <IoIosArrowForward />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default page;
