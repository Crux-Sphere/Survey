"use client";

import ButtonBordered from "@/components/ui/buttons/ButtonBordered";
import ButtonFilled from "@/components/ui/buttons/ButtonFilled";
import Loader from "@/components/ui/Loader";
import CustomModal from "@/components/ui/Modal";
import {
  createRole,
  deleteRole,
  getAllRoles,
  updateRole,
} from "@/networks/role_networks";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const permissions = [
  "Create survey",
  "Assign data",
  "View survey",
  "Edit survey",
  "Call voter",
  "SMS voter",
  "Whatsapp voter",
  "View panna pramukh",
  "View booth adhyaksh",
];
const customPermissions: any = {
  "Operation team": [
    "Create survey",
    "Assign data",
    "View survey",
    "Edit survey",
  ],
  "Panna Pramukh": ["Call voter", "SMS voter", "Whatsapp voter"],
  "Mandal Adhyaksh": ["View panna pramukh", "View booth adhyaksh"],
  "Support Executive": [
    "Create survey",
    "Assign data",
    "View survey",
    "Edit survey",
  ],
  "Survey Collector": [
    "Create survey",
    "Assign data",
    "View survey",
    "Edit survey",
  ],
  "Survey Manager": [
    "Create survey",
    "Assign data",
    "View survey",
    "Edit survey",
  ],
  "Booth Adhyaksh": [
    "Create survey",
    "Assign data",
    "View survey",
    "Edit survey",
  ],
  Supervisor: ["View survey collectors", "View survey collector data"],
  "Quality Check": ["Accept/Reject data"],
  "Data Analyst": ["Access report"],
  "Data Manager": ["Download report"],
  "District President": ["View data", "Edit data"],
  "Shakti Kendra": ["View data", "Edit data"],
  "VRM Team Manager":["Call voter"],
  "VRM Voter Relationship Executive":["Call voter"]
};

function Page() {
  //states
  const [allRoles, setAllRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [editRole, setEditRole] = useState<string | null>(null);
  const [editedRole, setEditedRole] = useState<string | null>(null);
  const [addRoleModal, setAddRoleModal] = useState<boolean>(false);
  const [role, setRole] = useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<
    string[] | null
  >(null);
  const [category, setCategory] = useState<string | null>("user");

  //router
  const router = useRouter();

  //side effects
  useEffect(() => {
    handleGetAllRoles();
  }, []);

  //api calls
  async function handleAddRole() {
    const params = {
      name: role,
      category,
      permissions: selectedPermissions,
    };
    const response = await createRole(params);
    console.log("response is --->", response);
    if (response.success) {
      toast.success("Role added successfully!");
      setAddRoleModal(false);
      handleGetAllRoles();
    } else {
      toast.error("Failed to add role");
    }
  }

  async function handleDeleteRole(role_id: string) {
    console.log(role_id);
    const params = {
      role_id,
    };
    const response = await deleteRole(params);
    if (response.success) {
      toast.success("Role deleted successfully!");
      handleGetAllRoles();
    } else {
      toast.error("Failed to delete role");
    }
  }

  async function handleGetAllRoles() {
    setLoading(true);
    const response = await getAllRoles();
    if (response.success) {
      setAllRoles(response.roles);
    } else {
      toast.error("Something went wrong");
    }
    setLoading(false);
  }

  async function handleUpdateRoles(
    role_id: string,
    permissionsToChange?: string[],
    add?: boolean
  ) {
    const params: any = {
      role_id,
    };
    if (add)
      params.permissionsToAdd = permissionsToChange
        ? [...permissionsToChange]
        : [];
    else
      params.permissionsToRemove = permissionsToChange
        ? [...permissionsToChange]
        : [];

    if (editedRole) {
      params.name = editedRole;
      setEditedRole(null);
      setEditRole(null);
    }

    const response = await updateRole(params);
    if (response.success) {
      toast.success("Role updated successfully");
      handleGetAllRoles();
    } else {
      toast.error("Something went wrong");
    }
  }

  //event handlers

  function handlePermissionSelect(permission: string) {
    setSelectedPermissions((prev: any) => {
      if (prev) {
        if (prev.includes(permission)) {
          return prev.filter((p: string) => p !== permission);
        } else {
          return [...prev, permission];
        }
      } else {
        return [permission];
      }
    });
  }

  function arrayIsSame(arr1: any[], arr2: any[]): boolean {
    if (arr1.length !== arr2.length) return false;

    for (let item of arr1) {
      if (!arr2.includes(item)) return false;
    }

    return true;
  }

  return (
    <main className="flex flex-col">
      <nav className="w-full sticky top-0 left-0 p-4 flex justify-between items-center bg-white border-b">
        <h1 className="text-xl text-secondary-300">Manage Roles</h1>
        <div className="flex gap-2">
          {/* <ButtonFilled onClick={()=>setAddRoleModal(true)}>Add role</ButtonFilled> */}
          <ButtonFilled className="bg-dark-gray" onClick={() => router.back()}>
            Back
          </ButtonFilled>
        </div>
      </nav>
      <section className="w-[96%] mx-auto rounded-lg overflow-hidden border bg-lighter-gray mt-5 overflow-y-auto max-h-[70vh] vertical-scrollbar flex flex-col gap-5">
        <div className="sticky top-0 grid grid-cols-6 border-b-2 pb-2 bg-dark-gray text-white p-4">
          <h3 className="font-medium">Sr.no.</h3>
          <h3 className="col-span-2 font-medium">Role</h3>
          <h3 className="col-span-2 font-medium">Permissions</h3>
        </div>
        {loading && (
          <Loader className="w-full h-[50vh] flex justify-center items-center" />
        )}
        {allRoles.length > 0 ? (
          allRoles.map((role, ind) => (
            <div key={role._id} className="grid grid-cols-6 border-b-2 p-2">
              <h3 className="font-medium">{ind + 1}.</h3>
              {editRole === role._id ? (
                <input
                  className="h-[40px] w-3/4 border focus:ring-1 focus:ring-blue-200 rounded-md outline-none col-span-2 p-4"
                  value={editedRole || ""}
                  onChange={(e) => setEditedRole(e.target.value)}
                />
              ) : (
                <div className="col-span-2 font-medium flex gap-2">
                  <div className="flex items-center h-fit gap-2">
                    <p>{role.name}</p>
                    <input
                      checked={arrayIsSame(
                        customPermissions[role.name],
                        role.permissions
                      )}
                      onChange={() =>
                        handleUpdateRoles(
                          role._id,
                          customPermissions[role.name],
                          !arrayIsSame(
                            customPermissions[role.name],
                            role.permissions
                          )
                        )
                      }
                      type="checkbox"
                      className="appearance-none w-4 h-4 border-2 border-primary-300 checked:bg-primary-100 checked:text-white rounded-full mt-1 cursor-pointer"
                    />
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-3 col-span-2">
                {customPermissions[role.name]?.map(
                  (permission: string, index: number) => (
                    <label
                      key={index}
                      className="cursor-pointer flex gap-2 items-center"
                    >
                      <input
                        onChange={() =>
                          handleUpdateRoles(
                            role._id,
                            [permission],
                            !role.permissions.includes(permission)
                          )
                        }
                        type="checkbox"
                        checked={role.permissions.includes(permission)}
                        className="appearance-none w-4 h-4 border-2 border-primary-300 checked:bg-primary-100 checked:text-white rounded-full mt-1"
                      />
                      <p>{permission}</p>
                    </label>
                  )
                )}
              </div>
              {/* <div className="flex flex-col justify-start items-end gap-2">
                <ButtonBordered
                  onClick={() => handleDeleteRole(role._id)}
                  className="min-w-[120px] border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                >
                  Delete role
                </ButtonBordered>
                <ButtonBordered
                  onClick={() => {
                    setEditedRole(role.name);
                    setEditRole(role._id);
                    if (editRole === role._id) {
                      handleUpdateRoles(role._id);
                    }
                  }}
                  className="min-w-[120px]"
                >
                  {editRole === role._id ? "Save changes" : "Edit role"}
                </ButtonBordered>
              </div> */}
            </div>
          ))
        ) : (
          <div className="w-full h-[50vh] flex justify-center items-center">
            No roles found
          </div>
        )}
      </section>
      <CustomModal
        closeModal={() => setAddRoleModal(false)}
        open={addRoleModal}
      >
        <section className="w-[60vw]">
          <div className="flex flex-col items-center p-5 gap-5">
            <h1 className="text-xl font-semibold">Add new Role</h1>
            <div className="grid grid-cols-2 w-3/4 mt-10 gap-6">
              <label>Name</label>
              <input
                onChange={(e) => setRole(e.target.value)}
                className="h-[40px] border border-secondary-200 focus:ring-1 focus:ring-blue-200 rounded-md outline-none p-4"
              />
              <label>Permissions</label>
              <div className="flex flex-col gap-5">
                {permissions.map((permission: string, index: number) => (
                  <label
                    key={index}
                    className="cursor-pointer flex gap-2 items-center"
                  >
                    <input
                      onChange={() => handlePermissionSelect(permission)}
                      className="h-5 w-5"
                      type="checkbox"
                    />
                    <p>{permission}</p>
                  </label>
                ))}
              </div>
              <label>Category</label>
              <div className="flex flex-col gap-5">
                <select
                  onChange={(e) => setCategory(e.target.value)}
                  value={category || ""}
                  className="cursor-pointer flex gap-2 items-center p-3 border-secondary-200 rounded-md border outline-none"
                >
                  {["user", "karyakarta", "custom"].map(
                    (cat: string, index: number) => (
                      <option key={index} value={cat}>
                        {cat}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          </div>
          <div className="w-full p-4 flex items-center gap-4 justify-end">
            <ButtonFilled onClick={() => setAddRoleModal(false)}>
              Cancel
            </ButtonFilled>
            <ButtonFilled onClick={handleAddRole}>Add</ButtonFilled>
          </div>
        </section>
      </CustomModal>
    </main>
  );
}

export default Page;
