"use client";

import React, { createContext, useContext, useState } from "react";

// Define the type for your context state
interface ACEntry {
  ac_no: string;
  booth_numbers: string;
}

interface CreateSurveyContextType {
  name: string;
  ac_list: ACEntry[];
  setName: (name: string) => void;
  addAcEntry: (ac_no: string, booth_numbers: string) => void;
  removeAcEntry: (index: number) => void;
  setAcList:(ac_list: ACEntry[]) => void;
  resetContext: () => void;
}

const CreateSurveyContext = createContext<CreateSurveyContextType | undefined>(
  undefined
);

export function CreateSurveyContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [name, setName] = useState<string>("");
  const [acList, setAcList] = useState<ACEntry[]>([]);

  const addAcEntry = (ac_no: string, booth_numbers: string) => {
    setAcList((prev) => [...prev, { ac_no, booth_numbers }]);
  };

  const removeAcEntry = (index: number) => {
    setAcList((prev) => prev.filter((_, i) => i !== index));
  };
  const resetContext = () => {
    setName("");
    setAcList([]);
  };

  return (
    <CreateSurveyContext.Provider
      value={{ name, ac_list: acList, setName, addAcEntry, removeAcEntry,setAcList ,resetContext}}
    >
      {children}
    </CreateSurveyContext.Provider>
  );
}

export default CreateSurveyContext;
