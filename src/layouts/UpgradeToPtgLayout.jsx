import React from "react";
import UpgradeNav from "../components/ComUpgrade/UpgradeNav";
import UpgradeIntroduce from "../components/ComUpgrade/UpgradeIntroduce";
import UpgradePacketList from "../components/ComUpgrade/UpgradePacketList";
import QRModal from "../components/ComUpgrade/QRModal";
import { useQuery } from "@tanstack/react-query";
import upgradePackageApi from "../apis/upgradePackageApi";

const UpgradeToPtgLayout = () => {
  const { data: currentPackage } = useQuery({
    queryKey: "current-upgrade-package",
    queryFn: async () => await upgradePackageApi.getCurrentPackage(),
  });
  return (
    <div className="flex flex-col">
      <QRModal />
      <div className="sticky top-0 w-full z-10 backdrop-blur-md bg-[#292b2f]/50">
        <UpgradeNav />
      </div>

      <div className="flex flex-col gap-5 p-4">
        <UpgradeIntroduce currentPackage={currentPackage} />
        <div className="mx-20">
          <UpgradePacketList currentPackage={currentPackage} />
        </div>
      </div>
    </div>
  );
};

export default UpgradeToPtgLayout;
