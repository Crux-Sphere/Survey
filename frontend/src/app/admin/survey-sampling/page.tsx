"use client";

import { useEffect, useState } from "react";
import SurveyHeader from "@/components/surveys/SurveyHeader";
import useUser from "@/hooks/useUser";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { FaFilter } from "react-icons/fa6";
import Button from "@mui/material/Button";
import SampleSurveyTable from "@/components/survey-sampling/SampleSurveyTable";
import CreateSurveyModal from "@/components/surveys/CreateSurveyModal";
import ImportSurveyModal from "@/components/surveys/ImportSurveyModal";
import { CgImport } from "react-icons/cg";
import ImportSampleSurveyModal from "@/components/survey-sampling/ImportSampleSurveyModal";

interface Params {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
  published?: string;
  created_by: string;
  filter: string;
}

const defaultParams: Params = {
  page: 1,
  limit: 10,
  sortBy: "createdAt",
  sortOrder: "desc",
  published: "all",
  created_by: "rohitchand490@gmail.com",
  filter: "",
};

function Page() {
  const [queryParams, setQueryParams] = useState<Params>(defaultParams);
  const [searchBarInput, setSearchBarInput] = useState("");
  const [published, setPublished] = useState("all");
  const [sortSelect, setSortSelect] = useState("dateDesc");
  const [updated, setUpdated] = useState(false);
  const [importModal,setImportModal] = useState(false)

  const handleChangeFilterBy = (event: SelectChangeEvent) => {
    setPublished(event.target.value as string);
  };

  const handleChangeSortSelect = (event: SelectChangeEvent) => {
    setSortSelect(event.target.value as string);
  };

  const userData = useUser();
  const isSurveyManager = userData?.role
    .map((el: any) => el.name)
    .includes("Survey Manager");

  useEffect(() => {}, [queryParams]);

  const handleApplyFilters = () => {
    setQueryParams((prev) => ({
      ...prev,
      filter: searchBarInput,
      sampling:true,
      published: published,
      sortBy: sortSelect.includes("name") ? "name" : "createdAt",
      sortOrder: sortSelect.includes("Asc") ? "asc" : "desc",
      page: 1,
    }));
  };

  const handleClearFilters = () => {
    setSearchBarInput("");
    setPublished("all");
    setSortSelect("dateDesc");
    setQueryParams(() => defaultParams);
  };

  return (
    <section className=" bg-[#ECF0FA] min-h-[calc(100vh-80px)] w-full flex flex-col px-8">
      <header className="w-full">
        <div className="w-full py-3 flex justify-between items-center">
          <h3 className="text-[18px] font-[600]">Surveys</h3>
          <div className="flex gap-2">
            <Button
              onClick={()=>setImportModal(true)}
              className="gap-2 !capitalize"
              variant="contained"
              size="small"
              color="success"
            >
              <CgImport size={18} />
              <span>Import survey</span>
            </Button>
          </div>
        </div>
        <ImportSampleSurveyModal
          refetch={()=>setUpdated(!updated)}
          importModalOpen={importModal}
          closeImportModal={()=>setImportModal(false)}
        />
      </header>

      <div className="p-3 text-sm text-my-gray-200 bg-white  rounded-md shadow-md my-2">
        <div className="flex gap-10 justify-between items-center">
          <input
            className="w-[387px] formInput "
            placeholder="Search Surveys here"
            value={searchBarInput}
            onChange={(e) => setSearchBarInput(e.target.value)}
          />
          <div className="flex items-center gap-4">
            <div className="flex  h-10 items-center space-x-1 text-secondary-300 font-[500] text-[14px] whitespace-nowrap">
              <p>Filter By:</p>

              <div className="w-[150px] pl-2" style={{ zoom: "85%" }}>
                <Select
                  labelId="demo-simple-select-label"
                  id="filterby"
                  value={published}
                  size="small"
                  onChange={handleChangeFilterBy}
                  className="w-full"
                >
                  <MenuItem value={"All"}>All</MenuItem>
                  <MenuItem value={"Published"}>Published</MenuItem>
                  <MenuItem value={"Unpublished"}>Unpublished</MenuItem>
                </Select>
              </div>
            </div>
            <div className="flex h-10 items-center space-x-1 mr-8 text-secondary-300 font-[500] text-[14px] whitespace-nowrap">
              <p className="">Sort By:</p>

              <div className="w-[150px] pl-2" style={{ zoom: "85%" }}>
                <Select
                  labelId="demo-simple-select-label"
                  id="sortby"
                  value={sortSelect}
                  size="small"
                  name="sortby"
                  onChange={handleChangeSortSelect}
                  className="w-full"
                >
                  <MenuItem value={"nameAsc"}>Name ASC</MenuItem>
                  <MenuItem value={"nameDesc"}>Name DESC</MenuItem>
                  <MenuItem value={"dateDesc"}>Date DESC</MenuItem>
                  <MenuItem value={"dateAsc"}>Date ASC</MenuItem>
                </Select>
              </div>
            </div>
            <Button
              color="secondary"
              variant="outlined"
              className="text-[14px] !capitalize gap-1 !font-[500]"
              onClick={handleApplyFilters}
            >
              <FaFilter />
              <span className="whitespace-nowrap">Apply filters</span>
            </Button>
            <Button
              color="error"
              variant="outlined"
              className="text-[14px] !capitalize gap-1 !font-[500]"
              onClick={handleClearFilters}
            >
              <p className="whitespace-nowrap">Clear Filters</p>
            </Button>
          </div>
        </div>
      </div>

      <SampleSurveyTable
        updated={updated}
        setQueryParams={(params: any) =>
          setQueryParams((prev) => ({ ...prev, ...params }))
        }
        queryParams={queryParams}
      />
    </section>
  );
}

export default Page;
