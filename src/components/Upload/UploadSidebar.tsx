import Sidebar, {
  type SideItem,
  type SideItemClickHandler,
} from "../Sidebar/Sidebar";

type UploadSidebarProps = {
  sideItems: SideItem[];
  trendItems?: unknown;
  handleClick: SideItemClickHandler;
  activeItem?: unknown;
  // passed by UploadSide but not used
  userData?: unknown;
  handleLogout?: () => void;
  handleLogin?: () => void;
  handleRegister?: () => void;
};

const Upload = ({
  sideItems,
  trendItems,
  handleClick,
  activeItem,
}: UploadSidebarProps) => {
  return (
    <Sidebar
      sideItems={sideItems}
      trendItems={trendItems}
      handleClick={handleClick}
      activeItem={activeItem}
      isUpload={true}
    />
  );
};

export default Upload;
