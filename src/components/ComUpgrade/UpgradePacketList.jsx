import React from "react";
import UpgradePackageCard from "./UpgradePackageCard";
import { useQuery } from "@tanstack/react-query";
import upgradePackageApi from "../../apis/upgradePackageApi";

const UpgradePacketList = () => {
  const { data: packageList } = useQuery({
    queryKey: ["upgrade-package-list"],
    queryFn: () => upgradePackageApi.upgradePackageList(),
  });
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 place-items-stretch gap-10">
      {packageList &&
        packageList.objects?.map((item) => (
          <UpgradePackageCard key={item.id} packageItem={item} />
        ))}
    </div>
  );
};

export default UpgradePacketList;
