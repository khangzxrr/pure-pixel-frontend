import React from "react";
import ServerSideItems from "./ServerSideItems";
import ServerSideItem from "./ServerSideItem";
import UserService from "../../../services/Keycloak";

const userData = UserService.getTokenParsed();

const ServerSide = () => {
  return (
    <div className="flex flex-col items-center gap-5 pt-5">
      {ServerSideItems.map((item) => {
        if (item.authen && !userData) {
          return null;
        }
        return (
          <ServerSideItem
            key={item.id}
            id={item.id}
            link={item.link}
            icon={item.icon}
          />
        );
      })}
    </div>
  );
};

export default ServerSide;
