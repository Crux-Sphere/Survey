import { formatDate, truncateText } from "@/utils/common_functions";
import { SERVER_BUCKET } from "@/utils/constants";
import React, { useState } from "react";
import ImageSlider from "./ImageSlider";
import ImagesModal from "./ImagesModal";
import { CiImageOn } from "react-icons/ci";
interface props {
  questionType: string;
  response: string;
  expand: boolean;
}
function Response({ questionType, response, expand }: props) {
  const [showImageModal, setShowImageModal] = useState(false);
  if (
    [
      "Radio Grid",
      "DropDown Grid",
      "Single line Text Grid",
      "Number Grid",
      "Checkbox Grid",
    ].includes(questionType)
  ) {
    const lines = response.split("\n");
    return (
      <td className="px-4 py-2 border-b min-w-44 whitespace-nowrap ">
        {expand
          ? lines.map((line: string, index: number) => (
              <p key={index}>{line}</p>
            ))
          : lines
              .slice(0, 2)
              .map((line: string, index: number) => <p key={index}>{line}</p>)}
        {!expand && lines.length > 2 && <p key="ellipsis">...</p>}
      </td>
    );
  } else if (questionType === "Date") {
    return formatDate(response);
  } else if (questionType === "Image") {
    const imageUrls = Array.isArray(response)
      ? response.map((el: any) => `${SERVER_BUCKET}/${el.name}`)
      : [];
    return (
      <td className="px-6 py-2 min-w-44">
        <button
          className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
          onClick={(e: any) => {
            console.log("clicked on view button");
            e.stopPropagation();
            setShowImageModal(true);
          }}
        >
          <CiImageOn className="font-bold text-xl"/>
          View Images
        </button>
        {showImageModal && (
          <ImagesModal
            closeModal={(e:any) => {
              e.stopPropagation();
              setShowImageModal(false)
            }}
            images={imageUrls}
            open={showImageModal}
          />
        )}
      </td>
    );
  }
  return (
    <td className="px-6 py-2 min-w-44">
      {expand ? response : truncateText(response, 20)}
    </td>
  );
}

export default Response;
