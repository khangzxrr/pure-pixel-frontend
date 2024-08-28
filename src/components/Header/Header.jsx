import { useKeycloak } from "@react-keycloak/web";
import React from "react";
import AuthorizedHeader from "./AuthorizedHeader";
import UnauthorizedHeader from "./UnauthorizeHeader";

export const HeaderTab = [
  {
    id: 1,
    name: "Discover",
    link: "/discover",
  },
  {
    id: 2,
    name: "Licensing",
    link: "/licensing",
  },
  {
    id: 3,
    name: "Membership",
    link: "/membership",
  },
  {
    id: 4,
    name: "Quest",
    link: "/quest",
  },
  {
    id: 5,
    name: "Blog",
    link: "/blog",
  },
  {
    id: 6,
    name: "Award Winners",
    link: "/award-winners",
  },
];

export default function Header() {
  const { keycloak } = useKeycloak();

  if (!keycloak) {
    return <div>Loading...</div>;
  }
  console.log(keycloak);
  if (keycloak.authenticated) {
    return <AuthorizedHeader username="khang" />;
  }

  return <UnauthorizedHeader />;
}
