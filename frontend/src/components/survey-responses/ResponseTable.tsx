"use client";

import { truncateText, formatDate } from "@/utils/common_functions";
import React, { useState } from "react";
import ButtonFilled from "../ui/buttons/ButtonFilled";
import toast from "react-hot-toast";
import { updateKaryakartas } from "@/networks/user_networks";
import { useSearchParams } from "next/navigation";
import Response from "./Response";
import { IoLocationOutline } from "react-icons/io5";
import { FaRegEye } from "react-icons/fa";
import { useJsApiLoader } from "@react-google-maps/api";
import AudioComp from "./AudioComp";
import { SERVER_URI } from "@/utils/constants";


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
  setCoordinates?:any
}
function ResponseTable({
  responses,
  users,
  assignMode,
  setSelectedResponse,
  setResponseModalIsOpen,
  setMapModalIsOpen,
  setMore,
  more,
  setAssignedMode,
  selectedPanna,
  getUserResponses,
  setSelectedPanna,
  setCoordinates
}: ResponseTableProps) {
  console.log("all responses /////////////// ", responses);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyAVRCw7DcpEsnXzMvUq5SpPwvPusPfI7DI",
  });

  const [startIndex, setStartIndex] = useState<number | null>(null);
  const [endIndex, setEndIndex] = useState<number | null>(null);
  const [selectedResponses, setSelectedResponses] = useState<string[]>([]);

  const searchParams = useSearchParams();
  const surveyId = searchParams.get("survey_id");

  console.log("selectedResponses are from outside --->", selectedResponses);

  function handleMemberClick(responseId: string, index: number) {
    // If no start index is set, set the current index as the start index
    if (startIndex === null) {
      setStartIndex(index);
      setSelectedResponses([responseId]);
    } else {
      // If the clicked index is the same as the start index, reset all states
      if (index === startIndex) {
        setStartIndex(null);
        setEndIndex(null);
        setSelectedResponses([]);
        return; // Early return since we've reset everything
      }

      // If clicking before the start index, update the start index to the current index
      if (index < startIndex) {
        setStartIndex(index);
        setEndIndex(null);
        setSelectedResponses([responseId]);
        return; // Early return after resetting states
      }

      // Handle the case where the index is greater than the start index
      if (index > startIndex) {
        // Set the end index
        setEndIndex(index);

        // Calculate the range of selections
        const range = Math.abs(index - startIndex) + 1;

        // Check if the selected range exceeds the maximum allowed
        if (range > 60) {
          toast.error("Maximum of 60 responses are allowed");
          return;
        }
        console.log("all responses are ------>", responses);
        // Create an array to hold selected responses
        const selected: string[] = [];
        for (let i = startIndex; i <= index; i++) {
          if (!responses[i].panna_pramukh_assigned) {
            //only if response is not assigned to any panna pramukh
            selected.push(responses[i]._id); // Use `_id` from the `responses` array
          }
        }
        // console.log("selected response are ------>",selected);
        // Update selected responses state
        setSelectedResponses(selected);
      }

      // Handle case where a user clicks on an index lower than the current end index
      if (endIndex !== null && index < endIndex) {
        setEndIndex(index);

        // Create a new selected array up to the new end index
        const selected: string[] = [];
        for (let i = startIndex; i <= index; i++) {
          selected.push(responses[i]._id);
        }

        // Update selected responses state
        setSelectedResponses(selected);
      }
    }
  }

  async function updatePannaPramukhs() {
    const response = await updateKaryakartas({
      id: selectedPanna,
      responses: selectedResponses,
      surveyId,
    });
    console.log("after updation ----->", response);
    if (response.success) {
      toast.success("Data assigned successfully");
      setAssignedMode(false);
      setSelectedResponses([]);
      setSelectedPanna(null);
      getUserResponses();
    } else {
      console.log("error response --->", response);
      toast.error(response.message);
    }
  }

  return (
    <div
      id="scrollableDiv"
      className="w-full max-h-[80vh] overflow-auto  scrollbar rounded-t-2xl border border-secondary-200"
    >
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3"></th>
            <th scope="col" className="px-6 py-3"></th>
            {assignMode && <th scope="col" className="px-6 py-3"></th>}

            <th scope="col" className="px-6 py-3 whitespace-nowrap">
              Panna pramukh
            </th>
            <th scope="col" className="px-6 py-3">
              Status
            </th>
            <th scope="col" className="px-6 py-3">
              Remark
            </th>
            <th scope="col" className="px-6 py-3 whitespace-nowrap">
              Response date
            </th>
            <th scope="col" className="px-6 py-3">
              User
            </th>
            {responses &&
              responses.length > 0 &&
              responses[0].responses.map((response: any, index: number) => (
                <th
                  key={index}
                  scope="col"
                  className="px-6 py-3 whitespace-nowrap"
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
                </th>
              ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {responses &&
            responses.map((response: any, rowIndex: number) => (
              <tr
                onClick={() => {
                  setSelectedResponse(response);
                  setResponseModalIsOpen(true);
                }}
                className="odd:bg-white even:bg-gray-50 border-b dark:bg-gray-800 dark:border-gray-700"
                key={rowIndex}
              >
                {assignMode && (
                  <td
                    onClick={(e) => e.stopPropagation()}
                    className="px-6 py-4 font-[500]"
                  >
                    <input
                      disabled={response.panna_pramukh_assigned}
                      onChange={() => handleMemberClick(response._id, rowIndex)}
                      checked={selectedResponses.includes(response._id)}
                      className="h-5 w-5"
                      type="checkbox"
                    />
                  </td>
                )}
                <td className="px-6 py-4 font-[500]">
                  <ButtonFilled
                    className="w-10 p-0 cursor-pointer flex justify-center items-center rounded-full h-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("clicked on -->",response.location_data?.latitude,response.location_data?.longitude)
                      const lat = response.location_data?.latitude || 0;
                      const lng = response.location_data?.longitude || 0;
                      setCoordinates({lat,lng});
                      setMapModalIsOpen(true);
                    }}
                  >
                    <IoLocationOutline size={20} />
                  </ButtonFilled>
                </td>
                <td className="px-6 py-4 font-[500] cursor-pointer">
                  <FaRegEye size={18} />
                </td>
                <td className="px-6 py-4 font-[500]">
                  {response.panna_pramukh_assigned
                    ? response.panna_pramukh_assigned.name
                    : "--"}
                </td>
                <td className="px-6 py-4 font-[500]">
                  {response.contacted ? (
                    <p className="w-full p-2 py-1 bg-green-200 rounded-md text-[12px] text-gray-800">
                      Complete
                    </p>
                  ) : response.panna_pramukh_assigned ? (
                    <p className="w-full p-2 py-1 bg-amber-300 rounded-md text-[12px] text-gray-800">
                      Pending
                    </p>
                  ) : (
                    "---"
                  )}
                </td>
                <td className="px-6 py-4 font-[500]">
                  {response.remark ? truncateText(response.remark, 15) : "---"}
                </td>

                <td className="px-6 py-4 font-[500]">
                  {formatDate(response.createdAt)}
                </td>
                <td className="px-6 py-4 font-[500] whitespace-nowrap">
                  {users.find((user) => user._id === response.user_id)?.name ||
                    "-"}
                </td>
                <td className="px-6 py-4 font-[500] whitespace-nowrap">
                  {/* <AudioComp audioUrl="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"/> */}
                  <AudioComp audioUrl={`${SERVER_URI}/${response.audio_recording_path}`}/>
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
          {/* </InfiniteScroll> */}

            

        </tbody>
      </table>
      {assignMode && (
        <div className="flex gap-2 mt-5 ml-3 sticky bottom-0 bg-white left-3">
          <ButtonFilled
            onClick={() => {
              updatePannaPramukhs();
            }}
          >
            Assign
          </ButtonFilled>
          <ButtonFilled
            onClick={() => {
              setAssignedMode(false);
              setSelectedResponses([]);
              setStartIndex(null);
              setEndIndex(null);
            }}
          >
            Cancel
          </ButtonFilled>
        </div>
      )}
    </div>
  );
}

export default ResponseTable;
