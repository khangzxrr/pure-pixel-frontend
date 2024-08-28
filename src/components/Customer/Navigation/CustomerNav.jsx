import React from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { fields } from "./fields";

const CustomerNav = () => {
  const navigate = useNavigate();

  const userLogout = () => {
    navigate("/");
    // Cookies.remove("auth_token");
    // toast.success("Logout successfully");
    // logout();
  };

  return (
    <div className="flex flex-col px-2 py-4 w-11/12 bg-black rounded-lg">
      {fields[0].children.map((item) => (
        <div className="my-1 pr-5 justify-end text-right">{item.label}</div>
      ))}
    </div>
  );
};
export default CustomerNav;
