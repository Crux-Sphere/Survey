"use client";

import { useState } from "react";
import ButtonFilled from "../ui/buttons/ButtonFilled";
import { questions, advanceQuestions } from "@/utils/devData";
import { RiInputMethodFill, RiInputMethodLine } from "react-icons/ri";

function AllQuestions() {
  const [level, setLevel] = useState("Standard");
  return (
    <aside className="h-full min-w-[283px] min-h-screen pt-4 pl-2 overflow-hidden">
      <div className="flex flex-col gap-2 w-full">
        <ButtonFilled className="w-full text-[14px] font-semibold border text-white px-4 py-[10px] rounded-md text-left ">
          Questionnaire
        </ButtonFilled>
        <div className="flex gap-1">
          {level === "Standard" ? (
            <ButtonFilled
              onClick={() => setLevel("Standard")}
              className="w-full py-[10px] text-[14px] font-semibold"
            >
              Standard
            </ButtonFilled>
          ) : (
            <ButtonFilled
              onClick={() => setLevel("Standard")}
              className="py-[10px] px-4 bg-dark-gray w-full font-semibold"
            >
              Standard
            </ButtonFilled>
          )}
          {level === "Advance" ? (
            <ButtonFilled
              onClick={() => setLevel("Advance")}
              className="w-full py-[10px] text-[14px] font-semibold"
            >
              Advance
            </ButtonFilled>
          ) : (
            <ButtonFilled
              onClick={() => setLevel("Advance")}
              className="py-[10px] px-4 bg-dark-gray w-full font-semibold"
            >
              Advance
            </ButtonFilled>
          )}
        </div>
        <div className="flex flex-col gap-2 h-[600px] overflow-y-auto">
          {level === "Standard"
            ? questions.map((question, ind) => (
                <div
                  key={ind}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", question||'');
                  }}
                  className="p-2 flex gap-3 rounded-md bg-white cursor-grab"
                >
                  <RiInputMethodFill />
                  <div className="text-[14px] text-secondary-500">
                    {question}
                  </div>
                </div>
              ))
            : advanceQuestions.map((question, ind) => (
                <div
                  key={ind}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", question);
                  }}
                  className="p-2 flex gap-3 rounded-md bg-white cursor-grab"
                >
                  <RiInputMethodFill />
                  <div className="text-[14px] text-secondary-500">
                    {question}
                  </div>
                </div>
              ))}
        </div>
      </div>
    </aside>
  );
}

export default AllQuestions;
