"use client"

import EditSurveysHeader from "@/components/surveys/EditSurveysHeader";
import ButtonFilled from "@/components/ui/buttons/ButtonFilled";
import Loader from "@/components/ui/Loader";
import { getSurvey, updateSurvey } from "@/networks/survey_networks";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

function Page() {
  const [surveyData, setSurveyData] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const params = useSearchParams();
  const surveyId = params.get("survey_id");

  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: surveyData,
  });

  useEffect(() => {
    getSurveyData();
  }, []);

  useEffect(() => {
    if (surveyData) {
      Object.keys(surveyData).forEach((key) => {
        if (key !== "questions") {
          setValue(key, surveyData[key]);
        }
      });
    }
  }, [surveyData, setValue]);

  async function getSurveyData() {
    const params = { _id: surveyId };
    setLoading(true);
    const response = await getSurvey(params);
    setLoading(false);
    if (response.success) {
      setSurveyData(response.data);
    } else {
      toast.error("Something went wrong");
    }
  }

  async function submitHandler(data: any) {
    setLoading(true);
    const params = {
      _id: surveyId,
      formData: data,
    };
    try {
      const res = await updateSurvey(params);
      if (res.success) {
        toast.success("Survey updated successfully!");
      } else {
        toast.error("Failed to update survey.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col w-full min-h-screen">
      <div className="w-full flex flex-grow flex-col gap-5">
        <EditSurveysHeader
          id={surveyId || ""}
          created_by={surveyData?.created_by}
          name={surveyData?.name}
        />

        {loading && (
          <Loader className="h-[50vh] w-full flex justify-center items-center" />
        )}
        {!loading && (
          <form className="grid grid-cols-2 gap-8 m-10 border-2 bg-lighter-gray p-4 rounded-[20px]">
            {/* left */}
            <div className="flex flex-col gap-5 w-full">
              <div className="grid grid-cols-3">
                <label className="text-secondary-300 font-medium">Name</label>
                <input
                  value={surveyData?.name || ""}
                  disabled
                  {...register("name")}
                  className="col-span-2 w-full border-secondary-200 px-4 py-[10px] focus:outline-none border rounded-md"
                />
              </div>

              {/* AC List */}
              <div className="grid grid-cols-3">
                <label className="text-secondary-300 font-medium">AC List</label>
                <div className="col-span-2 px-4 py-[10px]">
                  
                  {surveyData.ac_list && surveyData.ac_list.length > 0 ? (
                  surveyData.ac_list.map((item:any, index:number) => (
                    <div className="flex flex-col">
                      <span className="text-primary-300 font-bold">
                        AC_NO: {item.ac_no}
                      </span>
                      <div className="flex gap-2 flex-wrap">
                        {
                          item.booth_numbers.map((booth:string)=>booth.trim().length > 0 ? <span>{booth},</span>:null)
                        }
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-secondary-300">This survey does'nt belong to an AC_NO</p>
                )}
                </div>
              </div>
            </div>

            {/* right */}
            <div className="flex flex-col gap-5 w-full">
              <div className="grid grid-cols-3">
                <label className="text-secondary-300 font-medium">Access pin</label>
                <input
                  {...register("access_pin")}
                  className="col-span-2 w-full border-secondary-200 px-4 py-[10px] focus:outline-none border rounded-md"
                />
              </div>

              <div className="grid gap-5 grid-cols-3">
                <label className="text-secondary-300 font-medium">
                  Background location capture
                </label>
                <input
                  type="checkbox"
                  {...register("background_location_capture")}
                  className="border-secondary-200 h-1/2 px-4 py-[10px] focus:outline-none border rounded-md"
                />
              </div>
            </div>
          </form>
        )}
      </div>
      <div className="sticky bottom-0 left-0 py-2 px-5 bg-white col-span-2 flex gap-4 justify-end mt-[10%] border-t border-gray-200">
        <ButtonFilled
          onClick={handleSubmit(submitHandler)}
          className="px-4 py-[10px] w-[95px]"
        >
          Update
        </ButtonFilled>
        <button
          onClick={() => router.back()}
          type="button"
          className="px-4 py-[10px] w-[95px] border border-secondary-200 rounded-md"
        >
          Cancel
        </button>
      </div>
    </main>
  );
}

const SuspendedCreateSurveyPage = () => (
  <Suspense>
    <Page />
  </Suspense>
);

export default SuspendedCreateSurveyPage;
