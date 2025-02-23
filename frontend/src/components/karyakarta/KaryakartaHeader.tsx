"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { CgImport } from "react-icons/cg";
import { IoIosAddCircle } from "react-icons/io";
import ButtonFilled from "../ui/buttons/ButtonFilled";
import { importKaryakartas } from "@/networks/user_networks";
import CustomModal from "../ui/Modal";
import { PropagateLoader } from "react-spinners";
import toast from "react-hot-toast";
import Button from '@mui/material/Button';

function KaryakartaHeader({ setReset }: { setReset: any }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [boothModal, setBoothModal] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Prevent default to allow drop
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Prevent default behavior (file download)
    const droppedFile = e.dataTransfer.files[0]; // Get the dropped file
    if (droppedFile) {
      setFile(droppedFile); // Set the dropped file to the state
    }
  };

  const handleFileUpload = async () => {
    setLoading(true);
    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await importKaryakartas(formData);
      console.log("Import Response:", response);
      if(response.success){
        toast.success("Karyakartas imported successfully!");
      }
      setBoothModal(false); // Close the modal after successful upload
    } catch (error: any) {
      console.error("Import Error:", error.response?.data);
      toast.error("Error importing Karyakartas");
    }
    setLoading(false);
    setReset((prev: boolean) => !prev);
  };

  return (
    <nav className="h-16 w-full py-3 flex justify-between items-center">
      <h1 className="text-[18px] font-[600]">All Karyakarta</h1>
      <div className="flex justify-end space-x-3 text-xs">
        <Button
          className="flex gap-2 items-center btn-custom bg-orange-600"
          variant="contained"
          size={"small"}
          onClick={() => {
            router.push("./karyakarta/add-karyakarta");
          }}
        >
          <IoIosAddCircle className="text-2xl" />
          Add Karyakarta
        </Button>
        <Button
          className="flex gap-2 items-center btn-custom !bg-green-600"
          variant="contained"
          size={"small"}
          onClick={() => setBoothModal(true)} // Open the modal on click
        >
          <CgImport className="text-2xl" />
          Import from Excel
        </Button>
      </div>

      {/* Modal for File Upload */}
      <CustomModal open={boothModal} closeModal={() => setBoothModal(false)}>
        <div className="relative min-h-[50vh] max-h-[90vh] w-[40vw] flex items-center gap-5 p-8 flex-col bg-secondary-100 overflow-y-auto">
          {loading && (
            <div className="absolute inset-0 z-30 bg-black/65 flex flex-col justify-center items-center gap-10 h-full w-full">
              <PropagateLoader speedMultiplier={1.25} color="#FF8437" />
              <h3 className="text-white font-semibold">
                Importing karyakartas, please wait...
              </h3>
            </div>
          )}
          <h1 className="text-xl font-bold text-primary-300">
            Import Karyakartas
          </h1>

          {/* Drop Zone for File Upload */}
          <div
            className="w-full h-40 border-dashed border-2 border-primary-300 flex justify-center items-center cursor-pointer"
            onClick={() => document.getElementById("file-upload")?.click()}
            onDragOver={handleDragOver} // Add drag over handler
            onDrop={handleDrop} // Add drop handler
          >
            <span>Drag & Drop or Click to Upload Excel File</span>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {file && (
            <div className="mt-4">
              <p>Selected file: {file.name}</p>
            </div>
          )}

          <ButtonFilled
            className="mt-6 disabled:bg-primary-100"
            onClick={handleFileUpload}
            disabled={!file}
          >
            Upload File
          </ButtonFilled>
        </div>
      </CustomModal>
    </nav>
  );
}

export default KaryakartaHeader;
