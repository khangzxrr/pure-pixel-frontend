import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { NavigateTab } from "./NavigateTab";
import UserService from "../../../services/Keycloak";

const NavigateBar = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(null);

  const userData = UserService.getTokenParsed();

  useEffect(() => {
    const currentTab = NavigateTab.find(
      (tab) => tab.link === location.pathname
    );
    if (currentTab) {
      setActiveTab(currentTab.id);
    }
  }, [location.pathname]);

  return (
    <div className="flex justify-center items-center gap-3 h-12">
      {NavigateTab.filter((tab) => !(tab.id === 2 && !userData)).map((tab) => (
        <div
          key={tab.id}
          className={`text-lg mx-6 max-w-32 text-center cursor-pointer hover:text-black transition-colors duration-300
            ${
              activeTab === tab.id
                ? "text-black underline decoration-[3px] underline-offset-8 "
                : "text-gray-400"
            }
          `}
        >
          <Link to={tab.link} className="w-full">
            {tab.name}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default NavigateBar;
