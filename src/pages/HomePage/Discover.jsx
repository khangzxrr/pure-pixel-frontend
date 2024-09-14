import React from "react";
import { Outlet } from "react-router-dom";
import NavigateBar from "../../components/Dashboard/Navigate/NavigateBar";

export default function Discover() {
  return (
    <div>
      <NavigateBar />
      <Outlet />
    </div>
  );
}
