"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import FormHeader from "./FormHeader";
import { FormProps } from "@/types/forms_interfaces";

function Image({
  id,
  index,
  register,
  handleHide,
  control,
  hide,
  handleDelete,
  handleDuplicate,
  handleDragStart,
  handleDragEnter,
  endIndex,
  defaultQuestionTitle,
}: FormProps) {
  return (
    <div
      onDragStart={handleDragStart}
      onDragEnter={handleDragEnter}
      draggable
      className={`flex justify-center items-center flex-col gap-2 border border-secondary-200 rounded-md overflow-hidden cursor-move ${
        endIndex?.toString() === id ? "border-2 border-blue-500" : ""
      }`}
    >
      <FormHeader
        handleDelete={handleDelete}
        handleDuplicate={handleDuplicate}
        register={register}
        id={id}
        index={index}
        input={true}
        hide={hide}
        handleHide={handleHide}
        defaultQuestionTitle={defaultQuestionTitle}
        control={control}
      />
      {!hide && (
        <div className="bg-primary-50 p-5 w-full">
          <div className="flex flex-col justify-center items-center p-5 gap-3 bg-white w-full">
            <div className="grid grid-cols-12 w-3/4">
              <label className="col-span-4 text-secondary-300">
                Allow multiple images
              </label>
              <input
                {...register(`questions.${index}.parameters.multiple_images`)}
                type="checkbox"
                className="border border-secondary-200 rounded-md p-2 col-span-1 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-12 w-3/4">
              <label className="col-span-4 text-secondary-300">
                Is question required
              </label>
              <input
                {...register(`questions.${index}.parameters.question_required`)}
                type="checkbox"
                className="border border-secondary-200 rounded-md p-2 col-span-1 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Image;
