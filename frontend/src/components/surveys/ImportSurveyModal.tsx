"use client";

import React, { useEffect, useRef, useState } from "react";
import ButtonBordered from "../ui/buttons/ButtonBordered";
import CustomModal from "../ui/Modal";
import { saveResponses } from "@/networks/response_networks";
import { createSurvey } from "@/networks/survey_networks";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { checkToken } from "@/utils/common_functions";
import Loader from "../ui/Loader";

interface props {
  importModalOpen: boolean;
  closeImportModal: () => void;
  setUpdated:any
}
function ImportSurveyModal({ importModalOpen, closeImportModal, setUpdated }: props) {
  const [acNo, setAcNo] = useState<string>("");
  const [boothNo, setBoothNo] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [excelData, setExcelData] = useState<any[]>([]);
  const[loading,setLoading] = useState<boolean>(false);

  useEffect(() => {
    const userData = checkToken();
    setUser(userData);
  }, []);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.preventDefault();
    const file = event.target.files?.[0];

    if (file) {
      setLoading(true);
      const reader = new FileReader();
      let jsonData: any;
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        jsonData = XLSX.utils.sheet_to_json(worksheet);
        console.log("json data iis ------->", jsonData);
        console.log("json data length iis ------->", jsonData.length);
        const uniquePairs:any = [];
        const seen:any = {}; // Hashmap to track unique pairs

        jsonData.forEach((item:any) => {
          const key = `${item.AC_NO}-${item.SECTION_NO}`;
          if (!seen[key]) {
            seen[key] = true;
            uniquePairs.push({
              AC_NO: item.AC_NO,
              SECTION_NO: item.SECTION_NO,
            });
          }
        });
        console.log("unique pairs ---->",uniquePairs);
        const ac_obj:any = {}
        uniquePairs.forEach((item: any) => {
          if (!ac_obj[item.AC_NO]) {
            ac_obj[item.AC_NO] = [];
          }
          ac_obj[item.AC_NO] = [...ac_obj[item.AC_NO], item.SECTION_NO];
        });
        console.log("ac_object is --->",ac_obj)
        const ac_list = Object.keys(ac_obj).map(key=>({ac_no:key,booth_numbers:ac_obj[key]}));
        console.log("ac_list is ===>",ac_list);

        if (user){
          const questions: any[] = [];
          const responseObj = jsonData[0];
          Object.keys(responseObj).forEach((key, index) => {
            if(["AC_NO","SECTION_NO"].includes(key)) return;
            const questionObj = {
              question_id: index + 10,
              type: "Single line Text Input",
              randomize: false,
              dependency: [],
              children: [],
              parameters: {
                question: key,
              },
            };
            questions.push(questionObj);
          });
          const params = {
            name,
            ac_list,
            imported:true,
            response_count:jsonData.length,
            published: false,
            questions,
          };
          console.log("survey structure --- >",params)
          const response = await createSurvey(params);
       
          if (response.success) {
            toast.success("Survey created successfully!");
            console.log(response.survey._id);
            const allResponses: any = [];
            jsonData.forEach((data: any, index: number) => {
              const responses: any = [];

              Object.keys(data).forEach((key, ind) => {
                if(["AC_NO","SECTION_NO"].includes(key)) return;
                let obj: any = {};
                obj.response = String(data[key]);
                obj.question_id = ind + 10;
                obj.question = key;
                obj.question_type = "Single line Text Input";
                responses.push(obj);
              });
              allResponses.push({
                survey_id: response.survey._id,
                ac_no : data.AC_NO,
                booth_no : data.SECTION_NO,
                house_no: data.C_HOUSE_NO,  
                phone_no: data.MOBILE_NO,
                name: data.FM_NAME_EN,
                responses,
              });
            });
            handleSaveResponses(allResponses);
          } else {
            toast.error("Failed to create survey!");
          }
          closeImportModal();
          setUpdated((prev:any)=>!prev)
        }
        setExcelData(jsonData);
      };
      reader.readAsArrayBuffer(file);
      setLoading(false);
    }
  };

  async function handleSaveResponses(params: any) {
    const response = await saveResponses(params);
    if (response.success) {
      toast.success("Responses saved successfully");
    } else {
      toast.error("Something went wrong while saving responses");
    }
  }
  if(loading) return <Loader/>
  return (
    <CustomModal open={importModalOpen} closeModal={closeImportModal}>
      <div className="min-w-[600px] h-[400px] flex flex-col justify-center items-center">
        <div className="relative z-10 text-primary-300 px-8 py-4 text-[24px] font-bold border-b w-full">
          Import survey
        </div>
        <div className="flex w-full h-full p-4">
          <img
            src="/images/create-survey.png"
            className="w-[300px] h-[223px]"
          />
          <form className="flex flex-col w-full gap-2">
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              className="flex items-center border border-secondary-200 rounded-md px-8 py-3 w-full focus:ring-1 focus:ring-blue-200 outline-none"
              type="text"
              placeholder="Survey name"
            />

            <div className="flex items-center gap-10 mt-auto">
              <ButtonBordered
                onClick={closeImportModal}
                type="button"
                className="border-secondary-200"
              >
                Cancel
              </ButtonBordered>
              <label>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (inputRef.current) {
                      inputRef.current.click();
                    }
                  }}
                  disabled={!name}
                  className="px-6 py-2 bg-primary-300 text-white rounded-md disabled:bg-primary-100 disabled:cursor-not-allowed"
                >
                  Import questions
                </button>
              </label>
            </div>
          </form>
        </div>
      </div>
    </CustomModal>
  );
}

export default ImportSurveyModal;
