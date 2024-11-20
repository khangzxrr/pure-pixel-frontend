import React from "react";
import { Tooltip } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import "./Wallet.css";

const CustomPagination = ({ currentPage, setPage, totalPage }) => {
  // Helper function to handle the first half of pagination
  const selectFirstHalfPage = (currentPage, index) => {
    if (currentPage === 0) {
      return currentPage + index + 1;
    }
    if (currentPage === 1) {
      return currentPage + index;
    }
    if (currentPage - 1 < totalPage - 5) {
      return currentPage + index;
    } else {
      return totalPage + index - 5;
    }
  };

  // Helper function to handle the second half of pagination
  const selectSecondHalfPage = (currentPage, index) => {
    if (currentPage >= totalPage - 3) {
      return totalPage - 2 + index;
    }
    return totalPage - 2 + index;
  };

  return (
    <div className="flex justify-center">
      {/* Previous Page Button */}
      <button
        onClick={() =>
          setPage(
            currentPage === 0 ? totalPage - 1 : Math.max(currentPage - 1, 0)
          )
        } // Ensure it doesn't go below 1        className=" px-2 "
      >
        <Tooltip title="Trang trước">
          <p className="text-[#dddddd] hover:text-white">
            <LeftOutlined />
          </p>
        </Tooltip>
      </button>

      {/* Pagination logic for large totalPage count */}
      {totalPage > 6 && (
        <div className="flex justify-center">
          {/* First half of pagination */}
          {Array.from({ length: 3 }).map((_, index) => (
            <p
              key={`first-half-${index}`}
              onClick={() =>
                setPage(selectFirstHalfPage(currentPage, index) - 1)
              }
              className={`px-2 py-1 cursor-pointer ${
                (currentPage === 0 && index === 0) ||
                (currentPage > 0 &&
                  index === 1 &&
                  currentPage < totalPage - 4) ||
                (currentPage === totalPage - 4 && index === 2)
                  ? "hover:text-gray-500 text-black bg-[#dddddd] rounded-sm"
                  : "text-[#dddddd] hover:text-white"
              }`}
            >
              {selectFirstHalfPage(currentPage, index)}
            </p>
          ))}

          <p className="px-2 py-1 cursor-pointer text-[#dddddd] hover:text-white">
            ...
          </p>

          {/* Second half of pagination */}
          {Array.from({ length: 3 }).map((_, index) => (
            <p
              key={`second-half-${index}`}
              onClick={() =>
                setPage(selectSecondHalfPage(currentPage, index) - 1)
              }
              className={`px-2 py-1 cursor-pointer ${
                currentPage === selectSecondHalfPage(currentPage, index) - 1
                  ? "hover:text-gray-500 text-black bg-[#dddddd] rounded-sm"
                  : "text-[#dddddd] hover:text-white"
              }`}
            >
              {selectSecondHalfPage(currentPage, index)}
            </p>
          ))}
        </div>
      )}

      {/* Pagination logic for small totalPage count */}
      {totalPage <= 6 &&
        Array.from({ length: totalPage }).map((_, index) => (
          <p
            key={`small-pagination-${index}`}
            onClick={() => setPage(index)} // Use (index + 1) to set the correct page
            className={`px-2 py-1 cursor-pointer ${
              currentPage === index || (currentPage === 0 && index === 0)
                ? "hover:text-gray-500 text-black bg-[#dddddd] rounded-sm"
                : "text-[#dddddd] hover:text-white"
            }`}
          >
            {index + 1}
          </p>
        ))}

      {/* Next Page Button */}
      <button
        onClick={() =>
          setPage(
            currentPage === totalPage - 1
              ? 0
              : Math.min(currentPage + 1, totalPage)
          )
        } // Ensure it doesn't exceed totalPage        className=" px-2 "
      >
        <Tooltip title="Trang tiếp theo">
          <p className="text-[#dddddd] hover:text-white">
            <RightOutlined />
          </p>
        </Tooltip>
      </button>
    </div>
  );
};

export default CustomPagination;
