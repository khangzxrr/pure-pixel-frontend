import type { KeycloakTokenParsed } from "keycloak-js";
import Sidebar, {
  type SideItem,
  type SideItemClickHandler,
} from "../Sidebar/Sidebar";

type CameraSidebarProps = {
  sideItems: SideItem<string>[];
  trendItems?: unknown;
  handleClick: SideItemClickHandler<string>;
  activeItem?: unknown;
  // accepted from callers but not used here
  userData?: KeycloakTokenParsed;
  handleLogout?: () => void;
  handleLogin?: () => void;
  handleRegister?: () => void;
};

const CameraSidebar = ({
  sideItems,
  trendItems,
  handleClick,
  activeItem,
}: CameraSidebarProps) => {
  return (
    <Sidebar
      sideItems={sideItems}
      trendItems={trendItems}
      handleClick={handleClick}
      activeItem={activeItem}
      isCamera={true}
    />
  );
};

export default CameraSidebar;
