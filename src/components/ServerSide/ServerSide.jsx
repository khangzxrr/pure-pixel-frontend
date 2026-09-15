import React from "react";
import { useQuery } from "@tanstack/react-query";
import ServerSideItems from "./ServerSideItems";
import ServerSideItem from "./ServerSideItem";
import UserService from "../../services/Keycloak";
import UseNotificationStore from "../../states/UseNotificationStore";
import UseChangeLogStore from "../../states/UseChangeLogStore";
import { getData } from "../../apis/api";
import { useKeycloak } from "@react-keycloak/web";
// Import store

const ServerSide = () => {
  const userData = UserService.getTokenParsed();
  const { toggleNotificationModal } = UseNotificationStore(); // Lấy hàm toggle từ store
  const userRoles = userData?.resource_access?.purepixel?.roles || [];

  // show a "new" dot on the change log link until the newest entry has been opened
  const lastSeenChangeLogAt = UseChangeLogStore((state) => state.lastSeenAt);
  const { data: latestChangeLog } = useQuery({
    queryKey: ["changelog-latest"],
    queryFn: async () => (await getData("/changelog/latest")).data,
    staleTime: 5 * 60 * 1000,
  });
  const hasNewChangeLog =
    !!latestChangeLog?.publishedAt &&
    (!lastSeenChangeLogAt ||
      new Date(latestChangeLog.publishedAt) > new Date(lastSeenChangeLogAt));

  return (
    <div className="flex flex-col items-center gap-5 pt-5">
      {ServerSideItems.map((item) => {
        if (
          (item.authen && !userData) ||
          (item.author && !userRoles.includes("photographer"))
        ) {
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
            badge={item.id === "changelog" && hasNewChangeLog}
          />
        );
      })}
    </div>
  );
};

export default ServerSide;
