import UpgradePackageCard, {
  type CurrentUpgradePackage,
  type UpgradePackageItem,
} from "./UpgradePackageCard";
import { useQuery } from "@tanstack/react-query";
import upgradePackageApi from "../../apis/upgradePackageApi";

type UpgradePackageListProps = {
  currentPackage?: CurrentUpgradePackage | null;
};

const UpgradePackageList = ({ currentPackage }: UpgradePackageListProps) => {
  const { data: packageList } = useQuery({
    queryKey: ["upgrade-package-list"],
    queryFn: () => upgradePackageApi.upgradePackageList(),
  });
  const packages: UpgradePackageItem[] | undefined = packageList?.objects;

  const popularPackageId =
    packages && packages.length > 0
      ? packages.reduce((mostPopular, packageItem) => {
          return (packageItem._count?.upgradePackageHistories ?? 0) >
            (mostPopular._count?.upgradePackageHistories ?? 0)
            ? packageItem
            : mostPopular;
        }, packages[0]).id
      : null; // Default to null if the package list is empty or undefined

  return (
    <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-10">
      {/* Firework component positioned absolutely over other elements */}

      {packages?.map((item) => (
        <div key={item.id} className="flex justify-center items-center">
          <UpgradePackageCard
            packageItem={item}
            currentPackage={currentPackage}
            popularPackageId={popularPackageId}
          />
        </div>
      ))}
    </div>
  );
};

export default UpgradePackageList;
