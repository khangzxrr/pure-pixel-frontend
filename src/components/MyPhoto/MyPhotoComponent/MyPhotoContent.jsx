import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
const MyPhotoContent = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname);

  const handleTabClick = (link) => {
    setActiveTab(link);
  };

  return (
    <div className="col-span-10 ">
      <div className="flex flex-col justify-center gap-3 h-48 pl-8 ">
        <div className="text-2xl font-bold">Ảnh của tôi</div>
      </div>
      <div className="">
        <div className="flex gap-10 pl-10 h-9 place-items-end">
          <div
            className={`text-lg font-bold ${
              activeTab.includes("all")
                ? "text-[#0870d1] underline underline-offset-8 decoration-2"
                : "text-gray-500 hover:text-[#0870d1] hover:underline underline-offset-8 decoration-2"
            }`}
            onClick={() => handleTabClick("/all")}
          >
            <Link to={"all"}>Tất cả</Link>
          </div>
          <div
            className={`text-lg font-bold ${
              activeTab.includes("private")
                ? "text-[#0870d1] underline underline-offset-8 decoration-2"
                : "text-gray-500 hover:text-[#0870d1] hover:underline underline-offset-8 decoration-2"
            }`}
            onClick={() => handleTabClick("/private")}
          >
            <Link to={"private"}>Riêng tư</Link>
          </div>
        </div>
      </div>
      <div className="bg-[#f2f2f3] min-h-[75vh] pb-5">
        <Outlet />
      </div>
    </div>
  );
};

export default MyPhotoContent;
