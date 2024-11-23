import React from "react";
import { Skeleton } from "antd"; // Make sure to import Skeleton from the appropriate library

export default function TableSkeleton({ col, row, isPagination }) {
  const cols = col ? col : 5;
  const rows = row ? row : 10;
  const calcWidth = () => {
    return `${(1 / cols) * 100}%`;
  };
  console.log(calcWidth());
  return (
    <>
      {/* {isPagination && (
        <div className="flex justify-end">
          <div className="animate-pulse bg-[#333333] rounded-lg shadow p-4 m-2 w-1/5"></div>
        </div>
      )} */}

      <div className="my-20">
        {/* <div className="bg-[#32353b] py-2 rounded-t-xl">
          <div className={`grid grid-cols-${col} gap-4`}>
            {Array.from({ length: cols }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse space-y-4 bg-[#4c4f56] rounded-lg shadow p-4 m-2"
              ></div>
            ))}
          </div>
        </div> */}
        <div className="bg-[#36393f] py-2 rounded-b-xl opacity-50">
          {Array.from({ length: rows }).map((_, index) => (
            <div className={`grid grid-cols-${col} gap-4`}>
              {Array.from({ length: cols }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse space-y-4 bg-[#6B7280] rounded-lg shadow p-4 m-2"
                >
                  {/* Skeleton Content */}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
