import React from "react";
import ChartDashboardRevenue from "./ChartDashboardRevenue";
import ComTotalUsersTable from "./ComTotalUsersTable";

const ComTotalUsers = () => {
  return (
    <div className="p-4">
      <div className="flex items-center justify-center rounded-sm ">
        <div className="bg-[#32353b] text-[#eee] p-4">
          <ChartDashboardRevenue />
        </div>
      </div>
    </div>
  );
};

export default ComTotalUsers;
