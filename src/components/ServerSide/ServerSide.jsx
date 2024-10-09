import React from "react";
import ServerSideItems from "./ServerSideItems";
import ServerSideItem from "./ServerSideItem";
import UserService from "../../services/Keycloak";
import UseNotificationStore from "../../states/UseNotificationStore";
import { useKeycloak } from "@react-keycloak/web";
// Import store

const ServerSide = () => {
  const { keycloak } = useKeycloak();
  const userData = UserService.getTokenParsed();
  const { toggleNotificationModal } = UseNotificationStore(); // Lấy hàm toggle từ store

  return (
    <div className="flex flex-col items-center gap-5 pt-5">
      {ServerSideItems.map((item) => {
        if (item.authen && !userData) {
          return null;
        }

        // Nếu item là notification thì không sử dụng link
        if (item.id === "notification") {
          return (
            <ServerSideItem
              key={item.id}
              icon={item.icon}
              name={item.name}
              isNotification
              onNotificationClick={toggleNotificationModal} // Gọi hàm toggle modal
            />
          );
        }

        return (
          <ServerSideItem
            key={item.id}
            id={item.id}
            name={item.name}
            link={item.link}
            icon={item.icon}
          />
        );
      })}
    </div>
  );
};

export default ServerSide;
