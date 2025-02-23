"use client";

import { useState } from "react";
import ButtonBordered from "../ui/buttons/ButtonBordered";
import { CiImport } from "react-icons/ci";
import CreateSurveyModal from "./CreateSurveyModal";
import ImportSurveyModal from "./ImportSurveyModal";
import { useCreateSurveyContext } from "@/hooks/contextHooks/useCreateSurvey";
import ButtonFilled from "../ui/buttons/ButtonFilled";
import { IoIosAddCircle } from "react-icons/io";
import { CgImport } from "react-icons/cg";
import Button from "@mui/material/Button";

interface props {
  setUpdated: any;
}
function SurveyHeader({ setUpdated }: props) {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const { setName, setAcList } = useCreateSurveyContext();

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => {
    setName("");
    setAcList([]);
    setModalIsOpen(false);
  };
  const openImportModal = () => setImportModalOpen(true);
  const closeImportModal = () => setImportModalOpen(false);

  return (
    <header className="w-full">
      <div className="w-full py-3 flex justify-between items-center">
        <h3 className="text-[18px] font-[600]">Surveys</h3>
        <div className="flex gap-2">
          <Button onClick={openModal} variant="contained" size="small" className="!capitalize gap-2">
            <IoIosAddCircle size={18}/> <span>Create survey</span>
          </Button>
          <Button
            onClick={openImportModal}
            className="gap-2 !capitalize"
            variant="contained" size="small"
            color="success"
          >
            <CgImport size={18}/>
            <span>Import survey</span>
          </Button>
        </div>
      </div>

      {/* modal */}
      <CreateSurveyModal
        setUpdated={setUpdated}
        modalIsOpen={modalIsOpen}
        closeModal={closeModal}
      />
      <ImportSurveyModal
        setUpdated={setUpdated}
        importModalOpen={importModalOpen}
        closeImportModal={closeImportModal}
      />
    </header>
  );
}

export default SurveyHeader;
