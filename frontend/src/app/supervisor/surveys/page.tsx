"use client";

import { useEffect, useState } from "react";
import SurveyHeader from "@/components/surveys/SurveyHeader";
import ButtonFilled from "@/components/ui/buttons/ButtonFilled";
import filter from "../../../../public/icons/Filter.png";
import Image from "next/image";
import AllSurveys from "@/components/surveys/AllSurveys";

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
  const [updated,setUpdatd] = useState(false)
  

  useEffect(() => {}, [queryParams]);

  const handleApplyFilters = () => {
    setQueryParams((prev) => ({
      ...prev,
      filter: searchBarInput,
      published: published,
      sortBy: sortSelect.includes("name") ? "name" : "createdAt",
      sortOrder: sortSelect.includes("Asc") ? "asc" : "desc",
      page: 1, // Reset to first page when applying new filters
    }));
  };

  const handleClearFilters = () => {
    setSearchBarInput("");
    setPublished("all");
    setSortSelect("dateDesc");
    setQueryParams(() => defaultParams);
  };

  return (
    <section className=" bg-[#ECF0FA] min-h-[calc(100vh-80px)] w-full flex flex-col">
      {/* <SurveyHeader setUpdated={setUpdatd}/> */}

      <div className="p-3 text-sm text-my-gray-200 bg-white mx-5 rounded-xl my-2">
        <div className="flex gap-10 justify-between items-center">
          <input
            className="w-[387px] h-[42.5px] px-4 py-[10px] border border-secondary-200 rounded-md focus:outline-none text-[14px] text-secondary-300"
            placeholder="Search Surveys here"
            value={searchBarInput}
            onChange={(e) => setSearchBarInput(e.target.value)}
          />
          <div className="flex items-center gap-4">
            <div className="flex  h-10 items-center space-x-1 text-secondary-300 font-semibold text-[14px] whitespace-nowrap">
              <p>Filter By:</p>
              <div className="rounded-md py-2 px-2 justify-between border border-secondary-200 bg-white">
                <select
                  name="filterby"
                  className="w-fit bg-white  focus:outline-none px-2"
                  id="filterby"
                  value={published}
                  onChange={(e) => setPublished(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="published">Published</option>
                  <option value="unpublished">Unpublished</option>
                </select>
              </div>
            </div>
            <div className="flex h-10 items-center space-x-1 mr-8 text-secondary-300 font-semibold text-[14px] whitespace-nowrap">
              <p className="">Sort By:</p>
              <div className="rounded-md py-2 px-2 justify-between border border-secondary-200 bg-white">
                <select
                  name="sortby"
                  className="w-fit bg-white focus:outline-none px-2"
                  id="sortby"
                  value={sortSelect}
                  onChange={(e) => setSortSelect(e.target.value)}
                >
                  <option value="nameAsc">Name ASC</option>
                  <option value="nameDesc">Name DESC</option>
                  <option value="dateDesc">Date DESC</option>
                  <option value="dateAsc">Date ASC</option>
                </select>
              </div>
            </div>
            <ButtonFilled
              className="text-[14px] font-semibold flex gap-2 items-center justify-center"
              onClick={handleApplyFilters}
            >
              <Image
                src={filter.src}
                alt="filter icon"
                height={20}
                width={20}
              />
              <p className="whitespace-nowrap">Apply filters</p>
            </ButtonFilled>
            <ButtonFilled
              className="text-[14px] font-semibold flex gap-2 items-center justify-center bg-dark-gray"
              onClick={handleClearFilters}
            >
              <p className="whitespace-nowrap">Clear Filters</p>
            </ButtonFilled>
          </div>
        </div>
      </div>

      <AllSurveys updated={updated} setQueryParams={(params:any)=>setQueryParams((prev)=>({...prev,...params}))} queryParams={queryParams} searchBarInput={searchBarInput} />

    </section>
  );
}

export default Page;
