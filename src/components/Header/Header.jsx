import React from "react";
import { useKeycloak } from "@react-keycloak/web";
import { useNavigate } from "react-router-dom";
import HeaderTabs from "./HeaderTabs";

export default function Header() {
  const { keycloak } = useKeycloak();
  const navigate = useNavigate();

  const handleAuthAction = (action) => {
    if (action === "login") keycloak.login();
    if (action === "logout") keycloak.logout();
    if (action === "navigate") navigate("/customer");
    if (action === "upload-photo") navigate("/upload-photo");
  };

  const renderAuthButtons = () => {
    if (!keycloak) return <div>Loading...</div>;

    return keycloak.authenticated ? (
      <>
        <button
          onClick={() => handleAuthAction("upload-photo")}
          className="text-lg font-bold hover:text-blue-600"
        >
          Upload Photo
        </button>
        <button
          onClick={() => handleAuthAction("navigate")}
          className="text-lg font-bold hover:text-blue-600"
        >
          Hello {keycloak.tokenParsed.name}!
        </button>
        <button
          onClick={() => handleAuthAction("logout")}
          className="text-lg font-bold hover:text-blue-600 ml-5 px-3 py-0.25 outline outline-2 outline-offset-2 rounded-full"
        >
          Logout
        </button>
      </>
    ) : (
      <>
        <button
          onClick={() => handleAuthAction("login")}
          className="text-lg font-bold hover:text-blue-600"
        >
          Log in
        </button>
        <button
          onClick={() => handleAuthAction("login")}
          className="text-lg font-bold hover:text-blue-600 ml-5 px-3 py-0.25 outline outline-2 outline-offset-2 rounded-full"
        >
          Sign up
        </button>
      </>
    );
  };

  return (
    <div className="flex justify-between items-center h-20 bg-gray-200">
      <HeaderTabs />
      <div className="flex mr-5 items-center gap-5">{renderAuthButtons()}</div>
    </div>
  );
}
