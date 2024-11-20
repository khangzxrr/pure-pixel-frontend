import { useKeycloak } from "@react-keycloak/web";
import { Navigate, Outlet } from "react-router-dom";
import Footer from "../components/Footer/Footer";
import Header from "../components/Header/Header";

export default function AuthorizedLayout() {
  const { keycloak } = useKeycloak();

  if (keycloak.authenticated) {
    return (
      <>
        <Outlet />
      </>
    );
  } else {
    return <Navigate to={"/"} />;
  }
}
