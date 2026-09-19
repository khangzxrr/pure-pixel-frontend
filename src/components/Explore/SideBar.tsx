import Sidebar, {
  type SideItem,
  type SideItemClickHandler,
} from "../Sidebar/Sidebar";

type SideBarProps = {
  sideItems: SideItem[];
  trendItems?: unknown;
  handleClick: SideItemClickHandler;
  activeItem?: unknown;
  isFilterInspiration?: boolean;
};

const SideBar = ({
  sideItems,
  trendItems,
  handleClick,
  activeItem,
  isFilterInspiration,
}: SideBarProps) => {
  return (
    <div>
      <Sidebar
        sideItems={sideItems}
        trendItems={trendItems}
        handleClick={handleClick}
        activeItem={activeItem}
        isImg={true}
        isFilterInspiration={isFilterInspiration}
      />
    </div>
  );
};

export default SideBar;
