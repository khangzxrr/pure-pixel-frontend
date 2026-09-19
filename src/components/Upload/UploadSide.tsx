import { useKeycloak } from "@react-keycloak/web";
import UserService from "../../services/Keycloak";
import UploadSideItem from "./UploadSideItem";
import UseUploadStore from "../../states/UseUploadStore";
import UploadSidebar from "./UploadSidebar";
import type { SideItemClickHandler } from "../Sidebar/Sidebar";

const UploadSide = () => {
  const { activeItem, setActiveItem } = UseUploadStore();
  const { keycloak } = useKeycloak();
  const userData = UserService.getTokenParsed();

  const handleLogin = () => keycloak.login();
  const handleRegister = () => keycloak.register();

  const handleLogout = () => keycloak.logout();
  // upload item ids are strings ("U1", "U2")
  const handleClick: SideItemClickHandler = (id, title, icon, quote) =>
    setActiveItem(String(id), title, icon, quote);
  return (
    <UploadSidebar
      sideItems={UploadSideItem}
      activeItem={activeItem}
      handleClick={handleClick}
      userData={userData}
      handleLogout={handleLogout}
      handleLogin={handleLogin}
      handleRegister={handleRegister}
    />
  );
};

export default UploadSide;
