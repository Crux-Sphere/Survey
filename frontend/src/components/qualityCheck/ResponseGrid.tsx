"use client";

import { truncateText, formatDate } from "@/utils/common_functions";
import React, { useState } from "react";
import { FaCircleXmark } from "react-icons/fa6";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import Response from "../survey-responses/Response";
import {
  saveQualityRemark,
  updateResponse,
} from "@/networks/response_networks";
import { GoCheckCircleFill } from "react-icons/go";
import CustomModal from "../ui/Modal";
import ButtonFilled from "../ui/buttons/ButtonFilled";

interface ResponseTableProps {
  responses: any;
  users: {
    _id: string;
    name: string;
  }[];
  assignMode?: boolean;
  setSelectedResponse: (response: any) => void;
  setResponseModalIsOpen: (isOpen: boolean) => void;
  setMapModalIsOpen: (isOpen: boolean) => void;
  setMore: (questionId: string | null) => void;
  more: string | null;
  setAssignedMode: (val: boolean) => void;
  selectedPanna: string | null;
  getUserResponses: any;
  setSelectedPanna: (val: string | null) => void;
  update:(val:boolean)=>void
  setResponses :any
}

function ResponseGrid({
  responses,
  users,
  setSelectedResponse,
  setResponseModalIsOpen,
  setMore,
  getUserResponses,
  more,
  update,
  setResponses
}: ResponseTableProps) {
  const [localResponses, setLocalResponses] = useState(responses);
  const [notes, setNotes] = useState<string | null>(null);
  const [isEditingNote, setIsEditingNote] = useState<boolean>(false);
  const [selectedResponseId, setSelectedResponseId] = useState<string>("");

  async function updateStatus(response_id: string, status: string, e: any) {
    e.stopPropagation();

    // Update the local state instantly
    setLocalResponses((prevResponses: any) =>
      prevResponses.map((res: any) =>
        res._id === response_id ? { ...res, status } : res
      )
    );

    // Call the backend to update the status
    const params = { response_id, status };
    const response = await updateResponse(params);

    if (response.success) {
      toast.success("Successfully updated!");
    } else {
      // Revert the local state if the backend update fails
      setLocalResponses(responses);
      toast.error("Failed to update!");
    }
  }
  async function saveRemark(response_id: string) {
    // Call the backend to update the status
    const params = { response_id, note: notes };
    const response = await saveQualityRemark(params);

    if (response.success) {
      toast.success("Successfully saved quality remark!");
      getUserResponses()
    } else {
      toast.error("Failed to save!");
    }
    setIsEditingNote(false);
    setSelectedResponseId("");
  }

  const closeModal = () => {
    setIsEditingNote(false);
    setSelectedResponseId("");
  };

  return (
    <div
      id="scrollableDiv"
      className="w-[96%] mx-auto max-h-[80vh] overflow-auto vertical-scrollbar rounded-t-2xl border border-secondary-200"
    >
      <table className="w-full table-auto">
        <thead className="">
          <tr className="bg-dark-gray text-white sticky top-0 left-0 z-50 ">
            <td className="min-w-32 px-4 py-2 border-b text-center whitespace-nowrap sticky left-0 bg-dark-gray">
              {" "}
              Quality check status
            </td>
            <td className="px-4 py-2 border-b min-w-32 whitespace-nowrap text-center font-semibold">
              Quality remark
            </td>
            <td className="px-4 py-2 border-b min-w-32 whitespace-nowrap text-center font-semibold">
              Panna pramukh
            </td>
            <td className="px-4 py-2 border-b min-w-32 whitespace-nowrap text-center font-semibold">
              Status
            </td>
            <td className="px-4 py-2 border-b min-w-32 whitespace-nowrap text-center font-semibold">
              Remark
            </td>
            <td className="px-4 py-2 border-b min-w-32 whitespace-nowrap text-center font-semibold">
              Response date
            </td>
            <td className="px-4 py-2 border-b min-w-32 whitespace-nowrap text-center font-semibold">
              User
            </td>
            {responses &&
              responses.length > 0 &&
              responses[0].responses.map((response: any, index: number) => (
                <td
                  key={index}
                  className="gap-2 font-semibold px-4 py-2 border-b min-w-32 whitespace-nowrap text-center"
                >
                  {more !== response.question_id
                    ? truncateText(response.question, 10)
                    : response.question}
                  <button
                    className="text-primary-300 text-sm ml-2"
                    onClick={() => setMore(response.question_id)}
                  >
                    {more !== response.question_id &&
                    response.question.length > 10
                      ? "More"
                      : ""}
                  </button>
                  <button
                    className="text-primary-300 text-sm ml-2"
                    onClick={() => setMore(null)}
                  >
                    {more === response.question_id &&
                    response.question.length > 10
                      ? "Less"
                      : ""}
                  </button>
                </td>
              ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {localResponses &&
            localResponses.map((response: any, rowIndex: number) => (
              <tr
                onClick={() => {
                  setSelectedResponse(response);
                  setResponseModalIsOpen(true);
                }}
                className="cursor-pointer"
                key={rowIndex}
              >
                <td className="min-w-32 px-4 py-4 border-b h-full sticky left-0 bg-white w-full text-center">
                  {response.status === "Pending" ? (
                    <div className="flex gap-3">
                      <button
                        onClick={(e) =>
                          updateStatus(response._id, "Approved", e)
                        }
                        className="bg-green-500 p-2 rounded-md text-white"
                      >
                        <GoCheckCircleFill />
                      </button>
                      <button
                        onClick={(e) =>
                          updateStatus(response._id, "Rejected", e)
                        }
                        className="bg-red-400 p-2 rounded-md text-white"
                      >
                        <FaCircleXmark />
                      </button>
                    </div>
                  ) : response.status === "Approved" ? (
                    <div className="flex gap-3">
                      <p className="bg-green-500 p-2 rounded-md flex gap-2 items-center w-fit text-white">
                        <GoCheckCircleFill /> Approved
                      </p>
                      <button
                        onClick={(e) =>
                          updateStatus(response._id, "Pending", e)
                        }
                        className="bg-amber-500 p-2 rounded-md text-white"
                      >
                        Revert
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <p className="bg-red-400 p-2 rounded-md flex gap-2 items-center w-fit text-white">
                        <FaCircleXmark /> Rejected
                      </p>

                      <button
                        onClick={(e) =>
                          updateStatus(response._id, "Pending", e)
                        }
                        className="bg-amber-500 p-2 rounded-md text-white"
                      >
                        Revert
                      </button>
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditingNote(true);
                            setSelectedResponseId(response._id);
                          }}
                          className="text-sm text-gray-500"
                        >
                          📝
                        </button>
                      </div>
                    </div>
                  )}
                </td>
                <td className="min-w-32 px-4 py-4 border-b text-center">
                  {response.quality_check_remarks
                    && response.quality_check_remarks.length > 0 ? response.quality_check_remarks[response.quality_check_remarks.length -1].note
                    : "--"}
                </td>
                <td className="min-w-32 px-4 py-4 border-b text-center">
                  {response.panna_pramukh_assigned
                    ? response.panna_pramukh_assigned.name
                    : "--"}
                </td>
                <td className="min-w-32 px-4 py-4 border-b text-center">
                  {response.contacted ? (
                    <p className="w-full p-2 bg-green-200 rounded-md">
                      Complete
                    </p>
                  ) : response.panna_pramukh_assigned ? (
                    <p className="w-full p-2 bg-amber-300 rounded-md">
                      Pending
                    </p>
                  ) : (
                    "---"
                  )}
                </td>
                <td className="min-w-32 px-4 py-4 border-b text-center">
                  {response.remark ? truncateText(response.remark, 15) : "---"}
                </td>

                <td className="min-w-32 px-4 py-4 border-b text-center">
                  {formatDate(response.createdAt)}
                </td>
                <td className="min-w-44 whitespace-nowrap px-4 py-2 border-b text-center">
                  {users.find((user) => user._id === response.user_id)?.name ||
                    "-"}
                </td>

                {response.responses.map((res: any, colIndex: any) => (
                  <Response
                    expand={false}
                    questionType={res.question_type}
                    response={res.response}
                  />
                ))}
              </tr>
            ))}
        </tbody>
      </table>
      <CustomModal open={isEditingNote} closeModal={closeModal}>
        <div className="min-h-[40vh] w-[40vw] p-4">
          <h1 className="text-xl font-semibold text-dark-gray text-center mb-5">
            Add quality check remark here
          </h1>
          <textarea
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border-2 border-mid-gray rounded-md outline-none p-4"
            rows={10}
          />
          <div className="flex gap-2 items-center justify-end">
            <ButtonFilled
              className="bg-dark-gray hover:bg-mid-gray"
              onClick={closeModal}
            >
              Cancel
            </ButtonFilled>
            <ButtonFilled onClick={() => saveRemark(selectedResponseId)}>
              Save
            </ButtonFilled>
          </div>
        </div>
      </CustomModal>
    </div>
  );
}

export default ResponseGrid;
