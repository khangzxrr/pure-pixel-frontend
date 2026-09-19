import CardTotal from "./../../components/ComAdmin/CardTotal";
import formatPrice from "../../utils/FormatPriceUtils";

// one daily snapshot of the admin dashboard as the statistics page reads it;
// the generated DashboardReportDto only describes a single flat report
export type DashboardSnapshot = {
  createdAt: string;
  data: {
    userTotal?: number;
    totalEmployee?: number;
    totalPhoto?: number;
    totalRevenue?: number;
    revenueFromUpgradePackage?: number;
    revenueFromSellingPhoto?: number;
    topSelledPhotos?: unknown[];
  };
};

type TotalCardsProps = {
  dataDashboard: DashboardSnapshot[];
};

const TotalCards = ({ dataDashboard }: TotalCardsProps) => {
  const userTotalList = dataDashboard.map((item) => item?.data.userTotal);
  const employeeTotalList = dataDashboard.map(
    (item) => item?.data.totalEmployee
  );
  const photoTotalList = dataDashboard.map((item) => item?.data.totalPhoto);
  const totalRevenue = dataDashboard.map((item) => item?.data.totalRevenue);
  const getLastElement = <T,>(array: T[]) => array[array.length - 1];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      <CardTotal
        nameCard={"Tổng số người sử dụng"}
        totalNumber={getLastElement(userTotalList) || null}
      />
      <CardTotal
        nameCard={"Tổng số nhân viên"}
        totalNumber={getLastElement(employeeTotalList) || null}
      />
      <CardTotal
        nameCard={"Tổng số ảnh"}
        totalNumber={getLastElement(photoTotalList) || null}
      />
      <CardTotal
        nameCard={"Tổng số tiền"}
        totalNumber={formatPrice(getLastElement(totalRevenue) || null)}
      />
    </div>
  );
};

export default TotalCards;
