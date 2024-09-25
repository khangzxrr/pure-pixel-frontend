import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export const HeaderTab = [
  { id: 1, name: "Khám phá", link: "/discover/for-you" },
  // { id: 2, name: "Licensing", link: "/licensing" },
  { id: 3, name: "Nâng cấp", link: "/membership" },
  // { id: 4, name: "Quest", link: "/quest" },
  { id: 5, name: "Blog", link: "/blog" },
  // { id: 6, name: "Award Winners", link: "/award" },
  { id: 7, name: "Layout rebuild", link: "test" },
];

export default function HeaderTabs() {
  const location = useLocation();
  const [activeLink, setActiveLink] = useState(location.pathname);

  return (
    <div className="flex items-center">
      <div className="ml-16 mr-8">
        <Link to="/">
          <img className="w-28" src="/assets/logo.png" alt="Logo" />
        </Link>
      </div>
      {HeaderTab.map((tab) => (
        <div
          key={tab.id}
          className={`text-lg mx-6 cursor-pointer transition-colors duration-200 ${
            activeLink === tab.link ? "text-blue-600" : "hover:text-blue-600"
          }`}
        >
          <Link
            to={tab.link}
            onClick={() => setActiveLink(tab.link)}
            className="w-full"
          >
            {tab.name}
          </Link>
        </div>
      ))}
    </div>
  );
}
