"use client";

import React, { useEffect, useState } from "react";
import ButtonBordered from "../ui/buttons/ButtonBordered";
import CustomModal from "../ui/Modal";
import ButtonFilled from "../ui/buttons/ButtonFilled";
import { useCreateSurveyContext } from "@/hooks/contextHooks/useCreateSurvey";
import { useRouter } from "next/navigation";
import { createSurvey } from "@/networks/survey_networks";
import toast from "react-hot-toast";
import { PropagateLoader } from "react-spinners";

interface Props {
  modalIsOpen: boolean;
  closeModal: () => void;
  survey: any; // Accept the survey to pre-fill from
}

function DuplicateSurveyModal({ modalIsOpen, closeModal, survey }: Props) {
  const { ac_list, addAcEntry, name, removeAcEntry, setName, resetContext } = useCreateSurveyContext();
  const [currentAcNo, setCurrentAcNo] = useState<string>("");
  const [currentBoothNo, setCurrentBoothNo] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();   
  console.log("selected survey inside modal -- ",survey)

  // Load survey data into context on modal open
  useEffect(() => {
    if (modalIsOpen && survey) {
      resetContext(); // Optional: clear previous state
      setName(survey.name || "");

      if (survey.ac_list && Array.isArray(survey.ac_list)) {
        survey.ac_list.forEach((entry: any) => {
          addAcEntry(entry.ac_no, entry.booth_numbers.join(", "));
        });
      }
    }

    return ()=>{
        resetContext()
    }
  }, [modalIsOpen, survey]);

  const handleCreateSurvey = async () => {
    const body: any = {
      ...survey,
      name:name,
      response_count:0,
      published:false,
      ac_list: ac_list.map((entry) => ({
        ac_no: entry.ac_no,
        booth_numbers: entry.booth_numbers.split(",").map((num) => num.trim()),
      })),
    };

    try {
      setLoading(true);
      const response = await createSurvey(body);
      if (response.success) {
        toast.success("Survey created successfully!");
        closeModal();
        // setUpdated((prev: any) => !prev);
        router.push(`/admin/surveys/edit?survey_id=${response.survey._id}`);
      }
    } catch (error) {
      console.error("Error creating survey:", error);
      toast.error("Something went wrong while creating the survey.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomModal preventOutsideClose={loading} open={modalIsOpen} closeModal={closeModal}>
      <div className="relative w-[50vw] min-h-[60vh] max-h-[90vh] overflow-y-auto vertical-scrollbar-orange flex flex-col items-center">
        {loading && (
          <div className="absolute inset-0 z-30 bg-black/65 flex flex-col justify-center items-center gap-10 h-full w-full">
            <PropagateLoader speedMultiplier={1.25} color="#FF8437" />
            <h3 className="text-white font-semibold">Getting survey ready...</h3>
          </div>
        )}

        <div className="sticky top-0 left-0 z-10 text-primary-300 px-8 py-4 text-[24px] bg-white font-bold border-b w-full">
          Duplicate {survey?.name}
        </div>

        <div className="flex p-4 gap-5 justify-center w-full h-full">
          <img src="/images/create-survey.png" className="w-[300px] h-[223px]" />

          <form className="grid grid-cols-4 gap-5 w-full h-fit place-items-center">
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              className="col-span-4 border border-secondary-200 rounded-[20px] px-8 py-4 w-full focus:ring-2 focus:ring-primary-50 outline-none"
              type="text"
              placeholder="Survey name"
            />
            <input
              onChange={(e) => setCurrentAcNo(e.target.value)}
              value={currentAcNo}
              className="col-span-4 border border-secondary-200 rounded-[20px] px-8 py-4 w-full focus:ring-2 focus:ring-primary-50 outline-none"
              type="text"
              placeholder="AC_NO"
            />
            <input
              onChange={(e) => setCurrentBoothNo(e.target.value)}
              value={currentBoothNo}
              className="col-span-4 border border-secondary-200 rounded-[20px] px-8 py-4 w-full focus:ring-2 focus:ring-primary-50 outline-none"
              type="text"
              placeholder="BOOTH_NO (comma-separated)"
            />
          </form>
        </div>

        <div className="w-full px-4">
          {ac_list.map((entry, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b">
              <div className="flex flex-col">
                <span className="text-primary-300 font-bold">AC_NO: {entry.ac_no}</span>
                <span>Booth Numbers: {entry.booth_numbers}</span>
              </div>
              <button
                type="button"
                onClick={() => removeAcEntry(index)}
                className="text-red-500 font-semibold"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 justify-end p-4 flex items-center gap-10 z-20 bg-white w-full">
          <ButtonBordered onClick={closeModal} type="button" className="border-secondary-200">
            Cancel
          </ButtonBordered>

          <ButtonFilled
            type="button"
            onClick={() => {
              if (currentAcNo && currentBoothNo) {
                addAcEntry(currentAcNo, currentBoothNo);
                setCurrentAcNo("");
                setCurrentBoothNo("");
              }
            }}
            className="px-4 py-2 bg-primary-300 text-white rounded-md"
          >
            Add AC_NO
          </ButtonFilled>

          <ButtonFilled
            disabled={!name}
            className="px-6 py-2 bg-primary-300 text-white rounded-md disabled:bg-primary-100 disabled:cursor-not-allowed"
            type="button"
            onClick={handleCreateSurvey}
          >
            Duplicate Survey
          </ButtonFilled>
        </div>
      </div>
    </CustomModal>
  );
}

export default DuplicateSurveyModal;
