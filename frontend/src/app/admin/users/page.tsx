"use client";
import ButtonBordered from "@/components/ui/buttons/ButtonBordered";
import ButtonFilled from "@/components/ui/buttons/ButtonFilled";
import { getAllUsers, updateUsers } from "@/networks/user_networks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import { IUser } from "@/types/user_interfaces";
import Switch from "react-switch";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import Loader from "@/components/ui/Loader";
import toast from "react-hot-toast";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Button from "@mui/material/Button";

function page() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchBarInput, setSearchBarInput] = useState<string>("");
  const [limit, setLimit] = useState<any>(10);
  const [page, setPage] = useState<any>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    getData();
  }, [limit, page]);

  async function getData() {
    const params = { searchBarInput, page, limit };
    setLoading(true);
    const res: any = await getAllUsers(params);
    setLoading(false);
    console.log("res::::", res);
    if (res.error) return;
    setUsers(res.data);
    setTotalPages(res.totalPages);
  }
  const router = useRouter();

  function handleEditUser(_id: string) {
    router.push(`/admin/users/add-user?_id=${_id}`);
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
  const doNothing = async (user_id: string, status: string) => {
    const response = await updateUsers({ user_id, status });
    if (response) {
      toast.success("User status updated successfully!");
      getData();
    }
  };
  return (
    <div className="w-full px-8 py-2">
      <nav className="h-16 w-full py-1 pt-0 flex justify-between items-center">
        <h3 className="text-[18px] font-[600]">Users</h3>
        <div className="flex justify-end space-x-3 text-xs">
          <Button
            variant="contained"
            className="!capitalize"
            size="small"
            onClick={() => router.push("/admin/users/manage-roles")}
          >
            Manage Roles
          </Button>
          {/* <ButtonFilled
            onClick={() => {
              router.push("./users/add-multiple-users");
            }}
          >
            Add Multiple Users
          </ButtonFilled> */}
          <Button
            variant="contained"
            className="!capitalize"
            color="success"
            size="small"
            onClick={() => {
              router.push("./users/add-user");
            }}
          >
            Add User
          </Button>
          {/* <ButtonFilled>Export Users</ButtonFilled> */}
        </div>
      </nav>

      <div className="p-3 text-sm text-my-gray-200 bg-white rounded-md shadow-md mb-4">
        <div className="flex justify-between">
          <input
            className="w-[250px] formInput "
            placeholder="Name / Username / Role"
            value={searchBarInput}
            onChange={(e) => setSearchBarInput(e.target.value)}
          />
          <div className="flex space-x-3">
            <ButtonFilled
              onClick={() => {
                getData();
              }}
              className="btn-custom bg-orange-600 text-white rounded-[5px]"
            >
              Search
            </ButtonFilled>
            <div className="flex space-x-3">
              <ButtonFilled className="btn-custom bg-gray-700 text-white rounded-[5px]">
                Reset
              </ButtonFilled>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <Loader className="h-[50vh] flex justify-center items-center w-full" />
      )}

      <div className="card p-4 py-2 rounded-md shadow-md bg-white">
        <div className="relative overflow-x-auto mt-5">
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
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
                <th scope="col" className="px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {!loading && users && users.length !== 0 ? (
                users.map((user, index) => (
                  <tr
                    className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 border-b dark:bg-gray-800 dark:border-gray-700"
                    key={index}
                  >
                    <td className="px-6 py-2 font-[500]">{user.name}</td>
                    <td className="px-6 py-2 font-[500]">{user.username}</td>
                    <td className="px-6 py-2 font-[500]">{user.email}</td>
                    <td className="px-6 py-2 font-[500]">
                      {user.role.map((role: any, roleIndex: number) => (
                        <span key={roleIndex} className="whitespace-nowrap">
                          {role.name}
                          {roleIndex < user.role.length - 1 ? "," : ""}
                        </span>
                      ))}
                    </td>
                    <td className="px-6 py-2 font-[500]">
                      {/* <p className="p-3 text-white">{user.status === 'active' ? <Active /> : <Inactive />}</p> */}
                      <Switch
                        onChange={() =>
                          doNothing(
                            user._id,
                            user.status === "active" ? "inactive" : "active"
                          )
                        }
                        checked={user.status === "active" ? true : false}
                        onColor="#4CAF50"
                        offColor="#DDDDDD"
                        uncheckedIcon={false}
                        checkedIcon={false}
                        className="transition-switch duration-300 ease-in-out"
                      />
                    </td>
                    <td
                      className="px-6 py-2 font-[500]"
                      onClick={() => {
                        handleEditUser(user._id);
                      }}
                    >
                      <FaRegEdit
                        size={20}
                        className="block mx-auto cursor-pointer"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <div className="flex justify-center items-center h-[20vh] w-full">
                  No user found
                </div>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && (
        <div className="flex gap-3 items-center mt-4 pl-4 py-3 sticky shadow-md bottom-0 left-0 bg-[#fff]">
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
              style={{ zoom: "80%" }}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePreviousPage}
              disabled={page === 1}
              className="p-1 border rounded-md disabled:opacity-50"
            >
              <IoIosArrowBack />
            </button>
            <span className="text-[13px]">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={page === totalPages}
              className="p-1 border rounded-md disabled:opacity-50"
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
