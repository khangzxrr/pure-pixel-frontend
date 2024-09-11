import React, { useState } from "react";
import { Link } from "react-router-dom";
import { NavigateTab } from "./NavigateTab";

const NavigateBar = () => {
  const [activeTab, setActiveTab] = useState(null);

  return (
    <div className="flex justify-center items-center bg-black gap-4 h-12">
      {NavigateTab.map((tab) => (
        <div
          className={`text-lg
            text-white mx-6 min-w-20 text-center  hover:underline hover:underline-offset-8 hover:decoration-2 active:underline active:underline-offset-8 active:decoration-2 hover:cursor-pointer ${
              activeTab === tab.id
                ? "underline underline-offset-8 decoration-2 font-bold"
                : ""
            }`}
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
        >
          <Link to={tab.link} className="">
            {tab.name}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default NavigateBar;
