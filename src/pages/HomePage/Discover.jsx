import React from "react";
import { Outlet } from "react-router-dom";
import NavigateBar from "../../components/Dashboard/Navigate/NavigateBar";
import { useKeycloak } from "@react-keycloak/web";

export default function Discover() {
  const { keycloak } = useKeycloak();
  return (
    <div>
      <NavigateBar />
      <Outlet />
    </div>
  );
}
