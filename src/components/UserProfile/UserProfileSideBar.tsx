import Sidebar, {
  type SideItem,
  type SideItemClickHandler,
} from "../Sidebar/Sidebar";

type UserProfileSideBarProps = {
  sideItems: SideItem<string>[];
  trendItems?: unknown;
  handleClick: SideItemClickHandler<string>;
  activeItem?: unknown;
  userData?: { name?: string } | null;
  // accepted from callers but not used here
  handleLogout?: () => void;
  handleLogin?: () => void;
  handleRegister?: () => void;
};

const UserProfileSideBar = ({
  sideItems,
  trendItems,
  handleClick,
  activeItem,
  userData,
}: UserProfileSideBarProps) => {
  return (
    <Sidebar
      sideItems={sideItems}
      trendItems={trendItems}
      handleClick={handleClick}
      activeItem={activeItem}
      isImg={false}
      isUpload={false}
      isUser={true}
      nameUser={userData?.name}
    />
  );
};

export default UserProfileSideBar;
