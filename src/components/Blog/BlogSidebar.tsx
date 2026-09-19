import Sidebar, {
  type SideItem,
  type SideItemClickHandler,
} from "../Sidebar/Sidebar";

type BlogSidebarProps = {
  sideItems: SideItem<string>[];
  trendItems?: unknown;
  handleClick: SideItemClickHandler<string>;
  activeItem?: unknown;
  // accepted from callers but not used here
  userData?: unknown;
  handleLogout?: () => void;
  handleLogin?: () => void;
  handleRegister?: () => void;
};

const BlogSidebar = ({
  sideItems,
  trendItems,
  handleClick,
  activeItem,
}: BlogSidebarProps) => {
  return (
    <Sidebar
      sideItems={sideItems}
      trendItems={trendItems}
      handleClick={handleClick}
      activeItem={activeItem}
      isImg={false}
      isUpload={false}
      isBlog={true}
    />
  );
};

export default BlogSidebar;
