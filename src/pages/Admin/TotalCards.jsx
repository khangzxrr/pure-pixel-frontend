import React from "react";
import CardTotal from "./../../components/ComAdmin/CardTotal";
import formatPrice from "../../utils/FormatPriceUtils";

const TotalCards = ({ dataDashboard }) => {
  const userTotalList = dataDashboard.map((item) => item?.data.userTotal);
  const employeeTotalList = dataDashboard.map(
    (item) => item?.data.totalEmployee
  );
  const photoTotalList = dataDashboard.map((item) => item?.data.totalPhoto);
  const totalRevenue = dataDashboard.map((item) => item?.data.totalRevenue);
  const getLastElement = (array) => array[array.length - 1];
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
