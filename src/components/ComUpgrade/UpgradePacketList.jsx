import React from "react";
import UpgradePackageCard from "./UpgradePackageCard";
import { useQuery } from "@tanstack/react-query";
import upgradePackageApi from "../../apis/upgradePackageApi";
import { Firework } from "../Firework/Firework";

const UpgradePacketList = ({ currentPackage }) => {
  const { data: packageList } = useQuery({
    queryKey: ["upgrade-package-list"],
    queryFn: () => upgradePackageApi.upgradePackageList(),
  });

  const popularPackageId =
    packageList?.objects?.length > 0
      ? packageList.objects.reduce((mostPopular, packageItem) => {
          return packageItem._count.upgradePackageHistories >
            mostPopular._count.upgradePackageHistories
            ? packageItem
            : mostPopular;
        }, packageList.objects[0]).id
      : null; // Default to null if the package list is empty or undefined

  return (
    <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 place-items-stretch gap-10">
      {/* Firework component positioned absolutely over other elements */}
      <div className="fixed inset-0 z-50 pointer-events-none">
        <Firework />
      </div>

      {packageList?.objects?.map((item) => (
        <UpgradePackageCard
          key={item.id}
          packageItem={item}
          currentPackage={currentPackage}
          popularPackageId={popularPackageId}
        />
      ))}
    </div>
  );
};

export default UpgradePacketList;
