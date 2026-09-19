import type { ReactNode } from "react";
import InspirationSideItemF from "./InspirationSideItemF";
import InspirationTrendItem from "./InspirationTrendItem";
import UseInspirationStore from "../../../states/UseInspirationStore";
import SideBar from "../../Explore/SideBar";

const InspirationSideComp = () => {
  const { activeItem, setActiveItem } = UseInspirationStore();

  const handleClick = (
    id: string | number,
    title: string,
    icon: ReactNode,
    quote: string | undefined,
  ) => setActiveItem(id, title, icon, quote);

  return (
    <SideBar
      sideItems={InspirationSideItemF}
      trendItems={InspirationTrendItem}
      activeItem={activeItem}
      isFilterInspiration={true}
      handleClick={handleClick}
    />
  );
};

export default InspirationSideComp;
