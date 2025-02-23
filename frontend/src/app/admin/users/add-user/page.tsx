"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useForm, SubmitHandler,Controller } from "react-hook-form";
import { IUser } from "@/types/user_interfaces";
import { addUsers, getAllUsers, updateUsers } from "@/networks/user_networks";
import { useRouter, useSearchParams } from "next/navigation";
import { getUser } from "@/networks/user_networks";
import { getRoles } from "@/networks/role_networks";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";
import { supervisorId } from "@/utils/constants";
import Select from "react-select"

function Page() {
  const [userData, setUserData] = useState<any>();
  const [userId, setUserId] = useState<string | null>(null);
  const [rolesData, setRolesData] = useState<any>([]);
  const [rolesLoading, setRolesLoading] = useState<boolean>(false);
  const [supervisors,setSupervisors] = useState<any>(null);
  const [submitting,setSubmitting] = useState<boolean>(false);
  const {
    register,
    watch,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<IUser>({ defaultValues: userData });
  const searchParams = useSearchParams();
  const role = watch("role");
  const supervisor = watch("supervisor");
  let collectorRoleId;
  if (rolesData.length > 0) {
    const collector = rolesData.find(
      (el: any) => el.name === "Survey Collector"
    );
    collectorRoleId = collector._id;
  }
  console.log("supervisor selected is ---->", supervisor);
  // console.log("role is --->", role);

  useEffect(() => {
    const user_Id = searchParams.get("_id");
    setUserId(user_Id);

    const fetchRolesAndSupervisors = async () => {
      try {
        setRolesLoading(true);
        const response = await getRoles({ category: "user" });
        const userResponse = await getAllUsers({selectedRole:supervisorId});
        if(userResponse.success){
          console.log("supervisors from response --->",userResponse.data)
          const options = userResponse.data.map((el:any)=>({label:el.name,value:el._id}))
          setSupervisors(options)
        }
        else{
          toast.error("Error fetching users!");
        }
        if (response.success) {
          setRolesData(response.roles);
        } else {
          toast.error("something went wrong while fetching users");
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
      } finally {
        setRolesLoading(false);
      }
    };

    fetchRolesAndSupervisors();
  }, []);

  const router = useRouter();
  const onSubmit: SubmitHandler<IUser> = async (data: any) => {
    setSubmitting(true);
    console.log(data);
    if (data.password){
      if(!data.confirm_password){
        toast.error("Please confirm password!")
        return;
      }
      else if (data.password.length === 0) {
        toast.error("Password cannot be empty!");
        return;
      } else if (data.password !== data.confirm_password) {
        toast.error("Passwords do not match!");
        return;
      }
    }
    delete data.confirm_password;
    if (userId) delete data._id;
    const params: any = data;
    console.log("datatata::::", params);
    let res;
    if (userId) {
      params.user_id = userId;
      res = await updateUsers(params);
    } else {
      console.log("add user calling");

      res = await addUsers(params);
    }
    console.log("response of adding user --->", res);
    if (res.success) {
      toast.success("Success");
      router.replace("/admin/users");
    } else {
      if (res.error) toast.error(res.error.response.data.message);
      else toast.error("Failed");
    }
    setSubmitting(false);
  };

  useEffect(() => {
    if (userId) {
      console.log("user_id::");
      getUserData();
    }
  }, [userId]);

  useEffect(() => {
    if (userData) {
      console.log("userData::", userData);
      Object.keys(userData).forEach((key: any) => {
        if (key === "password") return;
        if(key === "role"){
          setValue(key, userData[key][0]);
        }
        else{
          setValue(key, userData[key]);
        }
      });
    }
  }, [userData]);

  async function getUserData() {
    const response = await getUser({userId:userId});
    console.log("ressese:://", response);
    if (response.success) {
      setUserData(response.data);
    } else {
      toast.error("something went wrong");
    }
  }
  if (rolesLoading || submitting) return <Loader />;
  
  return (
    <div className="w-full bg-my-gray-100 h-[calc(100vh-80px)]">
      <nav className="bg-mid-gray w-full flex items-center h-20 px-4 shadow-md ">
        <div>
          <h1 className="text-2xl font-bold">Add User</h1>
        </div>
      </nav>

      <div className="p-5 text-sm text-[#797979] bg-light-gray">
        <div className="justify-center items-center bg-lighter-gray">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="border-2  shadow-lg p-6 rounded-[20px] h-full"
          >
            <div className="flex gap-10 space-x-4">
              {/* Left Section */}
              <div className="w-[60%]">
                {/* user details */}
                <div className="w-full">
                  {[
                    {
                      label: "User Name",
                      name: "username",
                      type: "text",
                      placeholder: "User Name",
                    },
                    {
                      label: "Name",
                      name: "name",
                      type: "text",
                      placeholder: "Name",
                    },
                    {
                      label: "Email",
                      name: "email",
                      type: "email",
                      placeholder: "Email",
                    },
                    {
                      label: "Password",
                      name: "password",
                      type: "password",
                      placeholder: "Password",
                    },
                    {
                      label: "Confirm Password",
                      name: "confirm_password",
                      type: "password",
                      placeholder: "Confirm password",
                    },
                  ].map((field, index) => (
                    <div className="flex w-full space-y-2 gap-3" key={index}>
                      <div className="w-[20%] py-2">
                        <label className="block  font-medium ">
                          {field.label}
                        </label>
                      </div>
                      <div className="w-[80%]">
                        <input
                          type={field.type}
                          placeholder={field.placeholder}
                          {...register(field.name as keyof IUser, {
                            required: userId
                              ? !["confirm_password", "password"].includes(
                                  field.name
                                )
                              : true,
                          })}
                          className="border border-gray-300 rounded-md p-3 w-full outline-none focus:ring-2 focus:ring-primary-50"
                        />
                        {userId && field.name === "password" && (
                          <p className="text-sm">
                            <span className="font-bold">Note: </span>Entering a
                            new password will result in{" "}
                            <strong>overriding</strong> the older password.
                            Leave the password and confirm password empty to
                            avoid any change.
                          </p>
                        )}
                        {errors[field.name as keyof IUser] && (
                          <p className="text-red-500">This field is required</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {/* only display this if role is collector */}
                  {
                    role && role.includes(collectorRoleId) && (
                      <div className="flex w-full space-y-2 gap-3">
                        <div className="w-[20%] py-2">
                          <label className="block  font-medium">
                            Supervisor
                          </label>
                        </div>
                        <div className="w-[80%]">
                          <Controller
                           name="supervisor" 
                           control={control}
                           rules={{ required: role.includes(collectorRoleId) }}
                           render={({ field }) => (
                            <Select
                              {...field} // Spread field props to ensure full integration
                              options={supervisors} // Options for the Select
                              isSearchable
                              value={supervisors.find((option:any) => option.value === field.value)} // Set value to match form state
                              onChange={(selectedValue) => {
                                console.log("Selected value --->", selectedValue);
                                setValue('supervisor', selectedValue?.value || null); // Update form state
                              }}
                            />
                            
                          )}
                          />
                          {errors.supervisor && <p className="text-red-500">This field is required</p>}
                        </div>
                      </div>
                    )
                  }
                </div>

                <div className="flex space-y-2 items-center mt-3 space-x-2 w-full">
                  <div className="w-[20%] font-medium">User Status</div>
                  <div className="w-[80%]">
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setValue("status", "active")}
                        className={`px-4 py-2 rounded-md ${
                          watch("status") === "active"
                            ? "bg-primary-300 text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        Active
                      </button>
                      <button
                        type="button"
                        onClick={() => setValue("status", "inactive")}
                        className={`px-4 py-2 rounded-md ${
                          watch("status") === "inactive"
                            ? "bg-primary-300 text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        Inactive
                      </button>
                    </div>
                    {errors.status && (
                      <p className="text-red-500 mt-2">
                        User status is required
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* right side */}
              <div className="w-[40%]">
                {/* Roles */}
                {rolesData.length > 0 && (
                  <div className="flex flex-col gap-3 w-full border-2 p-3 rounded-[20px]">
                    <div className="font-semibold text-xl">Role</div>
                    <div className="gap-3 flex flex-col w-1/2">
                      {rolesData.map((role: any) => {
                        return (
                          <div
                            key={role._id}
                            className="flex items-center space-x-2 w-full"
                          >
                            <input
                              id={role.name} // Match the label's htmlFor attribute
                              type="radio"
                              value={role._id}
                              {...register("role", { required: true })}
                              className="flex-shrink-0 appearance-none w-4 h-4 border-2 border-primary-300 checked:bg-primary-100 checked:text-white rounded-full mt-1"
                            />
                            <label
                              htmlFor={role.name}
                              className="font-medium cursor-pointer whitespace-nowrap"
                            >
                              {role.name}
                            </label>
                          </div>
                        );
                      })}
                      {errors.role && (
                        <p className="text-red-500">
                          At least one role must be selected
                        </p>
                      )}
                    </div>
                  </div>
                )}
               
              </div>
            </div>

            {/* save, cancel button */}
            <div className="flex justify-center space-x-5 mt-3">
              <button
                type="submit"
                className="bg-primary-300 text-white py-2 px-4 rounded-md "
              >
                {userId ? "Update" : "Save"}
              </button>
              <button
                onClick={() => router.back()}
                type="button"
                className="bg-white border-[#7C7C7C] border-2  py-2 px-4 rounded-md "
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const SuspendedCreateSurveyPage = () => (
  <Suspense>
    <Page />
  </Suspense>
);

export default SuspendedCreateSurveyPage;
