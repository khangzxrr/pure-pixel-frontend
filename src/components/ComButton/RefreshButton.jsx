import React from "react";
import { FiRefreshCw } from "react-icons/fi";

const RefreshButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      title="Làm mới"
      className="bg-blue-500 group font-semibold  text-[#eee] p-1 rounded-md"
    >
      <FiRefreshCw className="text-2xl" />
    </button>
  );
};

export default RefreshButton;
