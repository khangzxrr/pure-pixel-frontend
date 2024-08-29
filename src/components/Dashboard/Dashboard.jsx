import React from "react";

import { Outlet } from "react-router-dom";
import NavigateBar from "./Navigate/NavigateBar";

const Dashboard = () => {
  return (
    <div>
      <NavigateBar />
      <Outlet />
    </div>
  );
};

export default Dashboard;
