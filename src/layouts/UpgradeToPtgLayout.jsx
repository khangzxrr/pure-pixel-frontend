import React from "react";
import UpgradeNav from "../components/ComUpgrade/UpgradeNav";
import UpgradeIntroduce from "../components/ComUpgrade/UpgradeIntroduce";
import { useQuery } from "@tanstack/react-query";
import upgradePackageApi from "../apis/upgradePackageApi";
import UpgradePackageList from "../components/ComUpgrade/UpgradePackageList";
import UpgradePaymentModal from "../components/ComUpgrade/UpgradePaymentModal";
import { Firework } from "../components/Firework/Firework";

const UpgradeToPtgLayout = () => {
  const { data: currentPackage } = useQuery({
    queryKey: "current-upgrade-package",
    queryFn: async () => await upgradePackageApi.getCurrentPackage(),
  });
  return (
    <div className="flex flex-col">
      <div className="fixed inset-0 z-[1100] pointer-events-none">
        <Firework />
      </div>
      <UpgradePaymentModal />
      <div className="sticky top-0 w-full z-10 backdrop-blur-md bg-[#292b2f]/50">
        <UpgradeNav />
      </div>

      <div className="flex flex-col gap-5 p-4">
        <UpgradeIntroduce currentPackage={currentPackage} />
        <div className="mx-20">
          <UpgradePackageList currentPackage={currentPackage} />
        </div>
      </div>
    </div>
  );
};

export default UpgradeToPtgLayout;
