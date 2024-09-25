import React from "react";
import { useKeycloak } from "@react-keycloak/web";
import InspirationSideItemF from "./InspirationSideItemF";
import InspirationTrendItem from "./InspirationTrendItem";
import UseInspirationStore from "../../../states/UseInspirationStore";
import UserService from "../../../services/Keycloak";
import SideBar from "../../Explore/SideBar";

const InspirationSideComp = () => {
  const { activeItem, setActiveItem } = UseInspirationStore();

  const handleClick = (id, title, icon, quote) =>
    setActiveItem(id, title, icon, quote);

  return (
    <SideBar
      sideItems={InspirationSideItemF}
      trendItems={InspirationTrendItem}
      activeItem={activeItem}
      handleClick={handleClick}
    />
  );
};

export default InspirationSideComp;
