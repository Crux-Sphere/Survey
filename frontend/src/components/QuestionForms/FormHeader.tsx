"use client";
import React from "react";
import { useForm, useWatch } from "react-hook-form";
import { CiMail } from "react-icons/ci";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { IoDuplicateOutline } from "react-icons/io5";
import { MdOutlineDelete } from "react-icons/md";
import { VscThreeBars } from "react-icons/vsc";
import { Tooltip } from "react-tooltip";

interface Props {
  id: string;
  index?: number;
  register: ReturnType<typeof useForm>["register"];
  input: boolean;
  handleDelete: (id: number) => void;
  handleHide: (id: number) => void;
  handleDuplicate: (id: number) => void;
  hide: boolean;
  control: ReturnType<typeof useForm>["control"];
  defaultQuestionTitle?: string;
}
function FormHeader({
  index,
  input,
  register,
  handleDelete,
  handleDuplicate,
  defaultQuestionTitle,
  hide,
  control,
  handleHide,
}: Props) {
  const media = useWatch({
    control,
    name: `questions.${index || 0}.parameters.question`,
    defaultValue: "",
  });

  return (
    <div className="flex gap-3 items-center w-full bg-white p-2">
      <p>
        <VscThreeBars />
      </p>
      <div className="flex items-center gap-2 w-full">
        <CiMail />
        {input && hide ? (
          <p>{media}</p>
        ) : (
          <input
            defaultValue={defaultQuestionTitle}
            placeholder="Type your question here..."
            {...register(`questions.${index}.parameters.question`, {
              required: true,
            })}
            className="py-2 px-4 text-secondary-300 flex-grow focus:outline-none"
          />
        )}
      </div>
      <label className="whitespace-nowrap flex gap-2 items-center cursor-pointer">
        Common
        <input
          {...register(`questions.${index}.common`, {
            required: true,
          })}
          type="checkbox"
          className="cursor-pointer appearance-none w-4 h-4 border-2 border-primary-300 checked:bg-primary-100 checked:text-white rounded-full"
        />
      </label>
      <label className="whitespace-nowrap flex gap-2 items-center cursor-pointer">
        Unique
        <input
          {...register(`questions.${index}.unique`, {
            required: true,
          })}
          type="checkbox"
          className="cursor-pointer appearance-none w-4 h-4 border-2 border-primary-300 checked:bg-primary-100 checked:text-white rounded-full"
        />
      </label>
      <button
        data-tooltip-id={`tooltip-arrow`}
        data-tooltip-content="Expand/Shrink survey"
        data-tooltip-place="bottom"
        onClick={() => handleHide(index || 0)}
        type="button"
      >
        {hide ? <IoIosArrowDown /> : <IoIosArrowUp />}
      </button>
      <button
        onClick={() => handleDuplicate(index || 0)}
        data-tooltip-id={`tooltip-duplicate`}
        data-tooltip-content="Duplicate question"
        data-tooltip-place="bottom"
        type="button"
      >
        <IoDuplicateOutline />
      </button>
      <button
        type="button"
        className="hover:text-red-500"
        onClick={() => handleDelete(index || 0)}
      >
        <MdOutlineDelete />
      </button>
      <Tooltip id={`tooltip-arrow`} style={{ zIndex: 30, position: "fixed" }} />
      <Tooltip
        id={`tooltip-duplicate`}
        style={{ zIndex: 30, position: "fixed" }}
      />
    </div>
  );
}

export default FormHeader;
