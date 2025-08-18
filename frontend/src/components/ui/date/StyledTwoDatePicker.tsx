import { format } from "date-fns";
import DatePicker from "react-datepicker";
import { MdCompareArrows } from "react-icons/md";
import { twMerge } from "tailwind-merge";
import "react-datepicker/dist/react-datepicker.css";

interface Props {
  startDate: Date | null;
  endDate: Date | null;
  setStartDate: (date: Date | null) => void;
  setEndDate: (date: Date | null) => void;
  className?: string;
}

function StyledTwoDatePicker({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  className,
}: Props) {
  const formatDate = (date: Date | null) =>
    date ? format(date, "dd-MMM-yyyy") : "";

  const normalizeDate = (date: Date | null): Date | null => {
    if (!date) return null;
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  return (
    <>
      {/* Style each popup differently by targeting the custom popperClassName */}
      <style>{`
        .picker1-popper {
          z-index: 100 !important;
          transform: translate(-5px, 50px) !important;
        }
        .picker2-popper {
          z-index: 100 !important;
          transform: translate(100px, 50px) !important;
        }
      `}</style>
      <div
        className={twMerge(
          "styled-two-datepicker w-fit flex font-medium text-lg py-2 items-center space-x-2 rounded-md focus:outline-none cursor-pointer",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(normalizeDate(date))}
            dateFormat="dd.MM.yyyy"
            scrollableYearDropdown
            scrollableMonthYearDropdown
            popperClassName="picker1-popper"
            customInput={
              <div className="relative picker1-popup">
                <input
                  type="text"
                  value={startDate ? formatDate(startDate) : ""}
                  onChange={() => {}}
                  placeholder="Select start"
                  className="w-[150px] h-[40px] rounded-md bg-white pl-2 text-[13px] border border-[rgba(0,0,0,0.1)] outline-none"
                />
              </div>
            }
          />
          <MdCompareArrows size={27} />
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(normalizeDate(date))}
            dateFormat="dd.MM.yyyy"
            scrollableYearDropdown
            scrollableMonthYearDropdown
            popperClassName="picker2-popper"
            customInput={
              <div className="relative picker2-popup">
                <input
                  type="text"
                  value={endDate ? formatDate(endDate) : ""}
                  onChange={() => {}}
                  placeholder="Select end"
                  className="w-[150px] h-[40px] rounded-md bg-white pl-2 text-[13px] border border-[rgba(0,0,0,0.1)] outline-none"
                />
              </div>
            }
          />
        </div>
      </div>
    </>
  );
}

export default StyledTwoDatePicker;