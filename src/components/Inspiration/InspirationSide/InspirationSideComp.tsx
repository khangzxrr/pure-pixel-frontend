import type { ReactNode } from "react";
import InspirationSideItemF from "./InspirationSideItemF";
import InspirationTrendItem from "./InspirationTrendItem";
import UseInspirationStore from "../../../states/UseInspirationStore";
import SideBar from "../../Explore/SideBar";
import { useFeatureFlag } from "../../../hooks/useFeatureFlag";

const InspirationSideComp = () => {
  const { activeItem, setActiveItem } = UseInspirationStore();
  const bookingEnabled = useFeatureFlag("booking");

  const sideItems = InspirationSideItemF.filter(
    (item) => bookingEnabled === true || item.link !== "/explore/booking-package",
  );

  const handleClick = (
    id: string | number,
    title: string,
    icon: ReactNode,
    quote: string | undefined,
  ) => setActiveItem(id, title, icon, quote);

  return (
    <SideBar
      sideItems={sideItems}
      trendItems={InspirationTrendItem}
      activeItem={activeItem}
      isFilterInspiration={true}
      handleClick={handleClick}
    />
  );
};

export default InspirationSideComp;
