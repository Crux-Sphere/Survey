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
    <section className="w-full">
      <SurveyHeader />

      <div className="bg-white border-b border-gray-200 z-10">
        <div className="flex justify-between px-8 py-3">
          <input
            className="w-[387px] h-[41px] px-4 py-[10px] border border-secondary-200 rounded-md focus:outline-none text-[14px] text-secondary-300"
            placeholder="Search surveys here"
            value={searchBarInput}
            onChange={(e) => setSearchBarInput(e.target.value)}
          />
          <div className="flex gap-2">
            <div className="flex h-10 items-center space-x-5 text-secondary-300 font-semibold">
              <p className="">Filter By:</p>
              <div className="rounded-md py-1 px-2 justify-between border border-secondary-200">
                <select
                  name="filterby"
                  className="w-40 bg-my-gray-100"
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
            <div className="flex h-10 items-center space-x-5 mr-8 text-secondary-300 font-semibold">
              <p className="">Sort By:</p>
              <div className="rounded-md py-1 px-2 justify-between border border-secondary-200">
                <select
                  name="sortby"
                  className="w-40 bg-my-gray-100"
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
                height={24}
                width={24}
              />
              <p>Apply filters</p>
            </ButtonFilled>
            <ButtonFilled
              className="text-[14px] font-semibold flex gap-2 items-center justify-center"
              onClick={handleClearFilters}
            >
              <p>Clear Filters</p>
            </ButtonFilled>
          </div>
        </div>
      </div>

      <AllSurveys queryParams={queryParams} />
    </section>
  );
}

export default Page;
