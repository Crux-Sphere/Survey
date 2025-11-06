import React from "react";
import { RxCross2 } from "react-icons/rx";
import Chip from '@mui/material/Chip';

interface filtersProps {
  filters: any[];
  responses: any[];
  surveyQuestions: any[];
  appliedFilters: any[];
  setAppliedFilters: (arg: any) => void;
  selectedFilter: any;
  setSelectedFilter: (arg: any) => void;
}
function Filters({
  filters,
  responses,
  surveyQuestions,
  appliedFilters,
  setAppliedFilters,
  selectedFilter,
}: filtersProps) {
  return (
    <div className="w-[30%]">
      {/* Filters Dropdown */}
      <div className="space-y-2">
        <select
          onChange={(e) => {
            const filt = JSON.parse(e.target.value);
            const obj = appliedFilters.find(
              (el) =>
                el.question === filt.question &&
                el.operator === filt.operator &&
                el.response === filt.response
            );
            if (obj) return;
            else
              setAppliedFilters((prev: any) => [
                ...prev,
                JSON.parse(e.target.value),
              ]);
          }}
          value={selectedFilter}
          name="filters"
          id="filters"
          className="outline-none shadow-floating w-full rounded-[5px] h-[40px] text-[13px] px-4 py-2"
        >
          <option value="" disabled selected>
            Select filter
          </option>
          {filters &&
            filters.length > 0 &&
            filters.map((filter) => {
              let questionText = "";
              if (responses && responses.length > 0) {
                const questionResponse = surveyQuestions?.find(
                  (res: any) =>
                    Number(res.question_id) === Number(filter.question)
                );
                if (questionResponse) {
                  questionText = questionResponse.parameters?.question || "Untitled Question";
                }
              }
              const value = JSON.stringify({
                question: filter.question,
                operator: filter.operator,
                response: filter.response,
              });
              return (
                <option value={value} key={filter.question}>
                  {`${questionText} ${filter.operator} ${filter.response}`}
                </option>
              );
            })}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        {appliedFilters.map((el) => {
          const questionResponse = surveyQuestions?.find(
            (res: any) => Number(res.question_id) === Number(el.question)
          );
          let questionText;
          if (questionResponse) {
            questionText = questionResponse.parameters?.question || "Untitled Question";
          }
          return (
            <div className="flex items-center w-[250px] relative top-2">
                <Chip label={`${questionText} ${el.operator} ${el.response}`} variant="outlined" onDelete={()=>setAppliedFilters((prev: any) =>
                      prev.filter(
                        (fil: any) =>
                          !(
                            fil.question === el.question &&
                            fil.operator === el.operator &&
                            fil.response === el.response
                          )
                      )
                    )} />
             
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Filters;
