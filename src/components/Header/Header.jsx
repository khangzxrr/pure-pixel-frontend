import React from "react";
import logo from "../../assets/logo.png";
const HeaderTab = [
  {
    id: 1,
    name: "Discover",
    link: "/discover",
  },
  {
    id: 2,
    name: "Licensing",
    link: "/licensing",
  },
  {
    id: 3,
    name: "Membership",
    link: "/membership",
  },
  {
    id: 4,
    name: "Quest",
    link: "/quest",
  },
  {
    id: 5,
    name: "Blog",
    link: "/blog",
  },
  {
    id: 6,
    name: "Award Winners",
    link: "/award-winners",
  },
];

export default function Header() {
  return (
    <div className="flex justify-between items-center h-20 bg-gray-200">
      <div className="flex items-center">
        <div className="ml-16 mr-8 pointer-events-none">
          <img className="w-28" src={logo} alt="Logo" />
        </div>
        {HeaderTab.map((tab) => (
          <div
            key={tab.id}
            className="text-lg  mx-6 hover:text-blue-600 hover:cursor-pointer"
          >
            <a href={tab.link} className="">
              {tab.name}
            </a>
          </div>
        ))}
      </div>
      <div className="flex">
        <div className="flex mr-5 items-center gap-5">
          <div>
            <button className="text-lg font-bold hover:text-blue-600">
              Log in
            </button>
          </div>
          <div className="flex items-center px-3 py-0.25 outline outline-2 outline-offset-2 rounded-full">
            <button className="text-lg font-bold hover:text-blue-600">
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
