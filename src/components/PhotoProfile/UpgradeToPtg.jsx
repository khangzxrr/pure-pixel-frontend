import React from "react";
import { BiSolidCameraPlus } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

const UpgradeToPtg = () => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate("/upgrade");
  };
  return (
    <div
      onClick={handleUpgrade}
      className="flex flex-col items-center justify-center w-[300px] hover:bg-[#8b8d91] bg-[#43474e] hover:cursor-pointer transition duration-200 h-full rounded-lg"
    >
      <BiSolidCameraPlus className="text-[50px]" />
      Hãy trở thành nhiếp ảnh gia!
    </div>
  );
};

export default UpgradeToPtg;
