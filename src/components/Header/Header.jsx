import { useKeycloak } from "@react-keycloak/web";
import React from "react";
import { useNavigate } from "react-router-dom";
import HeaderTabs from "./HeaderTabs";

export const HeaderTab = [
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
    link: "/award",
  },
];

export default function Header() {
  const { keycloak } = useKeycloak();
  const navigate = useNavigate();
  console.log("keycloak in header", keycloak);

  return (
    <div className="flex justify-between items-center h-20 bg-gray-200">
      <HeaderTabs />
      <div className="flex">
        {!keycloak ? (
          <div>Loading...</div>
        ) : keycloak.authenticated ? (
          <div className="flex mr-5 items-center gap-5">
            <div>
              <button
                onClick={() => navigate("/customer")}
                className="text-lg font-bold hover:text-blue-600"
              >
                Hello {keycloak.tokenParsed.name}!
              </button>
            </div>
            <div className="flex items-center px-3 py-0.25 outline outline-2 outline-offset-2 rounded-full">
              <button
                className="text-lg font-bold hover:text-blue-600"
                onClick={() => keycloak.logout()}
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="flex mr-5 items-center gap-5">
            <div>
              <button
                onClick={() => keycloak.login()}
                className="text-lg font-bold hover:text-blue-600"
              >
                Log in
              </button>
            </div>
            <div className="flex items-center px-3 py-0.25 outline outline-2 outline-offset-2 rounded-full">
              <button
                onClick={() => keycloak.login()}
                className="text-lg font-bold hover:text-blue-600"
              >
                Sign up
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
