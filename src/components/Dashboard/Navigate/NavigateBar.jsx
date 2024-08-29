import React, { useState } from "react";
import { Link } from "react-router-dom";
import { NavigateTab } from "./NavigateTab";

const NavigateBar = () => {
  const [activeTab, setActiveTab] = useState(null);

  return (
    <div className="flex justify-center items-center gap-4 h-12 bg-black">
      {NavigateTab.map((tab) => (
        <div
          className={`text-lg mx-6 min-w-20 text-center text-white hover:underline hover:underline-offset-4 hover:decoration-2 active:underline active:underline-offset-4 active:decoration-2 hover:cursor-pointer ${
            activeTab === tab.id
              ? "underline underline-offset-4 decoration-2 font-bold"
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
