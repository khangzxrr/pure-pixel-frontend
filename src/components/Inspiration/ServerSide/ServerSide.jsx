import React from "react";
import ServerSideItems from "./ServerSideItems";
import ServerSideItem from "./ServerSideItem";

const ServerSide = () => {
  return (
    <div className="flex flex-col items-center gap-5 pt-5 ">
      {ServerSideItems.map((item) => (
        <ServerSideItem
          key={item.id}
          id={item.id}
          link={item.link}
          icon={item.icon}
        />
      ))}
    </div>
  );
};

export default ServerSide;
