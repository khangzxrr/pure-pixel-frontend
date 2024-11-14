import React from "react";
import UpgradePackageCard from "./UpgradePackageCard";

const UpgradePacketList = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 place-items-stretch gap-10">
      <UpgradePackageCard />
      <UpgradePackageCard />
      <UpgradePackageCard />
      <UpgradePackageCard />
    </div>
  );
};

export default UpgradePacketList;
