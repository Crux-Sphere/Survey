"use client";
import ButtonFilled from "@/components/ui/buttons/ButtonFilled";
import FilledGreyButton from "@/components/ui/buttons/FilledGreyButton";
import TwoDatePicker from "@/components/ui/date/TwoDatePicker";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SlCalender } from "react-icons/sl";
import Select2 from "react-select";
import { getAllSurveys } from "@/networks/survey_networks";
import { getReport2 } from "@/networks/response_networks";
import PieCard from "@/components/ui/PieCard";
import ChartCard from "@/components/ui/ChartCard";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

 const defaultColors = [
    "#FF8437", "#3498db", "#e74c3c", "#2ecc71", "#9b59b6",
    "#f1c40f", "#1abc9c", "#e67e22", "#34495e", "#95a5a6",
  ];

export default function Report2() {
  const router = useRouter();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [needsApply, setNeedsApply] = useState<boolean>(false);
  const [selectKey, setSelectKey] = useState<number>(0);
  const [surveyId, setSurveyId] = useState<string | null>(null);
  const [caste, setCaste] = useState<string | null>(null);
  const [options, setOptions] = useState<any[]>([]);
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<any>({});
  const [page, setPage] = useState<number>(1);
  const [pageLimit, setPageLimit] = useState<number>(10);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loadingPDF, setLoadingPDF] = useState<boolean>(false);
  const [pdfMode, setPdfMode] = useState<boolean>(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!reportRef.current || !surveyId || !caste || !startDate || !endDate) {
      toast.error("Missing data to export PDF.");
      return;
    }

    setLoadingPDF(true);

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const margin = 20;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Cover Page Content
      const surveyName =
        options.find((o) => o.value === surveyId)?.label || "N/A";
      const formatDate = (date: Date) =>
        `${String(date.getDate()).padStart(2, "0")}/${String(
          date.getMonth() + 1
        ).padStart(2, "0")}/${date.getFullYear()}`;
      const start = formatDate(startDate);
      const end = formatDate(endDate);

      // Add Cover Page Title
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24);
      pdf.text("Survey Report", pageWidth / 2, 50, { align: "center" });

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(16);
      const lineSpacing = 10;
      let y = 80;

      pdf.text(`Survey Name: ${surveyName}`, pageWidth / 2, y, {
        align: "center",
      });
      y += lineSpacing;
      pdf.text(`Caste: ${caste}`, pageWidth / 2, y, { align: "center" });
      y += lineSpacing;
      pdf.text(`Date Range: ${start} to ${end}`, pageWidth / 2, y, {
        align: "center",
      });

      // Add a new page for charts
      pdf.addPage();

      const charts = reportRef.current.querySelectorAll(".chart-container");
      let yPosition = margin;

      for (let i = 0; i < charts.length; i++) {
        const chart = charts[i] as HTMLElement;
        const canvas = await html2canvas(chart, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL("image/png");
        const imgWidth = pageWidth - 2 * margin;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (yPosition + imgHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.addImage(imgData, "PNG", margin, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
      }

      pdf.save("survey-report.pdf");
    } catch (error) {
      toast.error("Failed to generate PDF.");
      console.error(error);
    } finally {
      setLoadingPDF(false);
    }
  };

  const casteOptions = [
    { value: "General", label: "General" },
    { value: "SC", label: "SC" },
    { value: "ST", label: "ST" },
    { value: "OBC", label: "OBC" },
  ];
  const handleApply = async () => {
    if (!surveyId || !caste || !startDate || !endDate) {
      alert("Please select all required fields");
      return;
    }

    setTableLoading(true);
    try {
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const response = await getReport2({
        surveyId,
        caste,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
      });

      console.log("Report2 Response:", response);

      if (response.success) {
        console.log("Data received:", response.data);
        setChartData(response.data);
      } else {
        console.error("API Error:", response.message);
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setTableLoading(false);
      setNeedsApply(false);
    }
  };

  const handleReset = () => {
    setSurveyId(null);
    setCaste(null);
    setStartDate(null);
    setEndDate(null);
    setNeedsApply(false);
  };

  useEffect(() => {
    const fetchSurveys = async () => {
      setLoading(true);
      try {
        const response = await getAllSurveys({ page: page, limit: pageLimit });
        console.log("API Response:", response);

        if (response.success === false) {
          console.error("API Error:", response.message);
          return;
        }

        const surveysData = response.data?.surveys || response.surveys || [];
        const paginationData =
          response.data?.pagination || response.pagination || {};

        setSurveys(surveysData);
        setOptions(
          surveysData.map((survey: any) => ({
            value: survey._id,
            label: survey.name,
          }))
        );
        setPagination(paginationData);
      } catch (error) {
        console.error("Error fetching surveys:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSurveys();
  }, [page, pageLimit]);
  const sortedData = chartData
    .slice()
    .sort((a, b) => a.question_id - b.question_id);
  return (
    <div className="flex flex-col w-full px-8">
      <nav className="w-full py-3 px-3 flex flex-col gap-3">
        <h3 className="text-[18px] font-[500]">Report</h3>

        <div className="flex w-full gap-12">
          <div>
            <div className="flex space-x-2 text-black text-base font-semibold">
              <ButtonFilled
                view={
                  "btn-custom bg-red-500 flex items-center justify-center !text-[13px] !rounded-md !text-white !h-[40px] !w-[140px]"
                }
                loading={loadingPDF}
                onClick={downloadPDF}
              >
                Export to Pdf
              </ButtonFilled>
              <FilledGreyButton
                onClick={() => router.back()}
                className="btn-custom !bg-gray-600 flex items-center justify-center !text-[13px] !rounded-md !text-white !h-[40px]"
              >
                Back
              </FilledGreyButton>
            </div>
          </div>
        </div>
      </nav>
      <div className="mt-2 font-semibold text-sm ">
        <div className="bg-light-gray  w-full rounded-md shadow-md px-4 py-6 mb-5">
          <div className="w-full">
            <div className="flex flex-col gap-5">
              <div>
                <div className="flex gap-3 items-center mb-5">
                  <h2 className="text-[16px]">Date Range</h2>
                  <SlCalender size={20} />
                </div>
                <div className="w-fit flex items-center gap-4">
                  <TwoDatePicker
                    className="w-[352px] h-10 relative"
                    startDate={startDate}
                    endDate={endDate}
                    setStartDate={(date) => {
                      setStartDate(date);
                      setNeedsApply(true);
                    }}
                    setEndDate={(date) => {
                      setEndDate(date);
                      setNeedsApply(true);
                    }}
                  />
                </div>
              </div>
              {/* Select Survey and Caste */}
              <div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col w-[352px]">
                    <Select2
                      key={selectKey}
                      value={
                        surveyId
                          ? options.find((option) => option.value === surveyId)
                          : null
                      }
                      onChange={(selectedOption) => {
                        setSurveyId(selectedOption?.value || "");
                        setNeedsApply(true);
                      }}
                      options={options}
                      placeholder="Select Survey"
                      classNamePrefix="react-select"
                      isSearchable={true}
                    />
                  </div>
                  <div className="flex flex-col w-[352px]">
                    <Select2
                      value={
                        caste
                          ? casteOptions.find(
                              (option) => option.value === caste
                            )
                          : null
                      }
                      onChange={(selectedOption) => {
                        setCaste(selectedOption?.value || "");
                        setNeedsApply(true);
                      }}
                      options={casteOptions}
                      placeholder="Select Caste"
                      classNamePrefix="react-select"
                      isSearchable={true}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <FilledGreyButton
                      onClick={handleReset}
                      className="btn-custom !bg-gray-600 flex items-center justify-center !text-[13px] !rounded-md !text-white !h-[40px]"
                    >
                      Reset
                    </FilledGreyButton>
                    <ButtonFilled
                      onClick={handleApply}
                      loading={tableLoading}
                      disabled={
                        !needsApply ||
                        !surveyId ||
                        !caste ||
                        !startDate ||
                        !endDate
                      }
                      className="btn-custom bg-orange-700 flex items-center justify-center !text-[13px] !rounded-md !text-white !h-[40px]"
                    >
                      Apply
                    </ButtonFilled>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {chartData.length > 0 && (
        <div className="mt-8 h-full">
          <h3 className="text-[18px] font-[500] mb-6">
            Survey Response Charts
          </h3>
          <div
            ref={reportRef}
            className="h-full mb-15 grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {sortedData.map((q, idx) =>
              q.question_type === "Radio Button" ? (
                <div className="chart-container">
                  <PieCard
                    key={idx}
                    data={q.responses}
                    dataKey="count"
                    nameKey="response_value"
                    title={q.question}
                  />
                </div>
              ) : (
                <div className="chart-container">
                  <ChartCard
                    key={idx}
                    data={q.responses}
                    xName="response_value"
                    yName="count"
                    title={q.question}
                    colors={defaultColors}
                  />
                </div>
              )
            )}
          </div>
        </div>
      )}
      {!tableLoading && chartData.length === 0 && (
        <div className="mt-8 text-center text-gray-500">
          No data found for the selected filters.
        </div>
      )}
    </div>
  );
}
