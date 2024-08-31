import React from "react";

import { Outlet } from "react-router-dom";
import NavigateBar from "../components/Dashboard/Navigate/NavigateBar";

const DashboardLayout = () => {
  return (
    <div>
      <NavigateBar />
      <Outlet />
    </div>
  );
};

export default DashboardLayout;
