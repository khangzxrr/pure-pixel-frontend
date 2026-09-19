import UseBlogStore from "../../states/UseBlogStore";
import { useKeycloak } from "@react-keycloak/web";
import UserService from "../../services/Keycloak";
import BlogSidebar from "./BlogSidebar";
import BlogSideItem from "./BlogSideItem";
import type { SideItemClickHandler } from "../Sidebar/Sidebar";

const BlogSide = () => {
  const { activeItem, setActiveItem } = UseBlogStore();
  const { keycloak } = useKeycloak();
  const userData = UserService.getTokenParsed();

  const handleLogin = () => keycloak.login();
  const handleRegister = () => keycloak.register();
  const handleLogout = () => keycloak.logout();
  const handleClick: SideItemClickHandler<string> = (id, title, icon, quote) =>
    setActiveItem(id, title, icon, quote);
  return (
    <BlogSidebar
      sideItems={BlogSideItem}
      activeItem={activeItem}
      handleClick={handleClick}
      userData={userData}
      handleLogout={handleLogout}
      handleLogin={handleLogin}
      handleRegister={handleRegister}
    />
  );
};

export default BlogSide;
