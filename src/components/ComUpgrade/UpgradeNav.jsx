import React from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const UpgradeNav = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-[#383c42] h-[50px] flex items-center">
      <div
        onClick={() => navigate("/")}
        className="m-1 p-2 rounded-full bg-[#292b2f] hover:cursor-pointer transition duration-200 hover:bg-[#4f545c]"
      >
        <IoIosArrowBack className="size-5" />
      </div>
    </div>
  );
};

export default UpgradeNav;
