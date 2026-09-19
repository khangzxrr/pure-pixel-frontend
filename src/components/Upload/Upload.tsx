import UploadSide from "./UploadSide";
import UserService from "../../services/Keycloak";
import { useKeycloak } from "@react-keycloak/web";
import UseUploadStore from "../../states/UseUploadStore";
import UseSidebarStore from "../../states/UseSidebarStore";
import SidebarLayout from "../../layouts/SidebarLayout";

const Upload = () => {
  const { activeTitle, activeIcon } = UseUploadStore();
  const { isSidebarOpen, toggleSidebar } = UseSidebarStore();
  const userData = UserService.getTokenParsed();
  const { keycloak } = useKeycloak();

  const handleLogin = () => keycloak.login();
  const handleRegister = () => keycloak.register();

  const handleLogout = () => keycloak.logout();

  return (
    <SidebarLayout
      isSidebarOpen={isSidebarOpen}
      toggleSidebar={toggleSidebar}
      userData={userData}
      activeIcon={activeIcon}
      activeTitle={activeTitle}
      sidebarContent={<UploadSide />}
      onLogout={handleLogout}
      onLogin={handleLogin}
      onRegister={handleRegister}
    />
  );
};

export default Upload;
