import React from "react";
import ChartDashboardRevenue from "./ChartDashboardRevenue";
import ComTotalUsersTable from "./ComTotalUsersTable";

const ComTotalUsers = () => {
  return (
    <div className="grid md:grid-cols-6 grid-cols-1 gap-8 p-4">
      <div className="bg-[#32353b] text-[#eee] col-span-4 min-h-[200px] rounded-sm">
        <ComTotalUsersTable />
      </div>
      <div className=" col-span-2 rounded-sm ">
        <div className="bg-[#32353b] text-[#eee] p-4">
          <ChartDashboardRevenue />
        </div>
      </div>
    </div>
  );
};

export default ComTotalUsers;
