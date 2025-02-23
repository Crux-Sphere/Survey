"use client"

import React from 'react'
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

function Pagination({setPage,setPageLimit,page,totalResponsePages,pageLimit}:{setPage:Function,setPageLimit:Function,page:number,totalResponsePages:number,pageLimit:number}) {
     const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLimit = parseInt(e.target.value, 10);
        setPageLimit(newLimit);
        setPage(1);
      };
    
      const handleNextPage = () => {
        if (page < totalResponsePages) {
          setPage(page + 1);
        }
      };
    
      const handlePreviousPage = () => {
        if (page > 1) {
          setPage(page - 1);
        }
      };
  return (
     <div className="flex gap-3 items-center pl-4 py-3 bg-[#fff] rounded-md shadow-md mt-3">
              {/* Limit Select */}
              <div>
                <label htmlFor="limit-select" className="mr-2 text-[13px]">
                  Show:
                </label>
                <select
                  id="limit-select"
                  value={pageLimit}
                  onChange={handleLimitChange}
                  className="p-2 border rounded-md text-[13px]"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
    
              {/* Navigation Arrows */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={page === 1}
                  className="p-2 border rounded-md disabled:opacity-50"
                >
                  <IoIosArrowBack />
                </button>
                <span className='text-[13px]'>
                  Page {page} of {totalResponsePages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={page === totalResponsePages}
                  className="p-2 border rounded-md disabled:opacity-50"
                >
                  <IoIosArrowForward />
                </button>
              </div>
            </div>
  )
}

export default Pagination