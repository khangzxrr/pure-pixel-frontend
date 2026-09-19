import { useEffect, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import UseSidebarStore from "../../states/UseSidebarStore";
import PhotoTagsTrend from "../Explore/PhotoTagsTrend";
import InsPhotoFilter from "./../Inspiration/InspirationPhoto/InsPhotoFilter";
import UseUserOtherStore from "../../states/UseUserOtherStore";
import { IoCloseSharp } from "react-icons/io5";

// ids are strings, except the explore menu (InspirationSideItemF) which uses numbers
export type SideItemId = string | number;

export type SideItem<Id extends SideItemId = SideItemId> = {
  id: Id;
  title: string;
  icon?: ReactNode;
  link: string;
  quote?: string;
  // only shown to photographers
  author?: boolean;
};

export type SideItemClickHandler<Id extends SideItemId = SideItemId> = (
  id: Id,
  title: string,
  icon: ReactNode,
  quote: string | undefined,
) => void;

type SidebarProps<Id extends SideItemId> = {
  sideItems: SideItem<Id>[];
  // accepted from callers but not used here
  trendItems?: unknown;
  // accepted from callers but not used here
  activeItem?: unknown;
  // accepted from callers but not used here
  isFilterInspiration?: boolean;
  handleClick: SideItemClickHandler<Id>;
  isUpload?: boolean;
  isImg?: boolean;
  isUser?: boolean;
  nameUser?: string;
  isBlog?: boolean;
  isCamera?: boolean;
  isOtherProfile?: boolean;
};

const Sidebar = <Id extends SideItemId>({
  sideItems,
  handleClick,
  isUpload,
  isImg,
  isUser,
  nameUser,
  isBlog,
  isCamera,
  isOtherProfile,
}: SidebarProps<Id>) => {
  const location = useLocation();
  const { activeLink, setActiveLink, isSidebarOpen, toggleSidebar } =
    UseSidebarStore();
  const nameUserOther = UseUserOtherStore((state) => state.nameUserOther);
  const isInspirationPage = location.pathname === "/explore/inspiration";

  useEffect(() => {
    const currentItem = sideItems.find(
      (item) => item.link === location.pathname,
    );
    if (currentItem && activeLink !== currentItem.id) {
      setActiveLink(currentItem.id);
      handleClick(
        currentItem.id,
        currentItem.title,
        currentItem.icon,
        currentItem.quote,
      );
    }
  }, [location.pathname, activeLink, setActiveLink, handleClick, sideItems]);

  return (
    <div className="flex flex-col max-h-screen gap-3 w-full z-30">
      {isUser && (
        <div className=" flex-grow">
          <div className="flex justify-between px-2 h-[50px] bg-[#36393f] outline outline-bottom outline-1 outline-[#202225] shadow-xl text-[#eee] items-center gap-3">
            {nameUser || "User"}
            {isSidebarOpen === true && (
              <div
                onClick={() => toggleSidebar()}
                className="cursor-pointer mr-1 p-2 rounded-full hover:bg-[#1d1f22] transition duration-200"
              >
                <IoCloseSharp />
              </div>
            )}
          </div>
        </div>
      )}
      {isImg && (
        // <div className=" h-[150px] overflow-hidden">
        //   <img
        //     className="w-full h-full object-cover"
        //     src="https://picsum.photos/1920/1080?random=1"
        //     alt=""
        //   />
        // </div>
        <div className=" flex-grow">
          <div className="flex justify-between px-2 h-[50px] bg-[#36393f]  shadow-xl text-[#eee] items-center gap-3">
            Khám phá
            {isSidebarOpen === true && (
              <div
                onClick={() => toggleSidebar()}
                className="cursor-pointer mr-1 p-2 rounded-full hover:bg-[#1d1f22] transition duration-200"
              >
                <IoCloseSharp />
              </div>
            )}
          </div>
        </div>
      )}
      {isUpload && (
        <div className="flex-grow">
          <div className="flex justify-between px-2 h-[50px] bg-[#36393f]  shadow-xl text-[#eee] items-center gap-3">
            Tải lên
            {isSidebarOpen === true && (
              <div
                onClick={() => toggleSidebar()}
                className="cursor-pointer mr-1 p-2 rounded-full hover:bg-[#1d1f22] transition duration-200"
              >
                <IoCloseSharp />
              </div>
            )}
          </div>
        </div>
      )}
      {isBlog && (
        <div className=" flex-grow">
          <div className="flex px-2 h-[48px] bg-[#36393f] outline outline-bottom outline-2 outline-[#1d1f22] shadow-xl text-[#eee] items-center gap-3">
            Trang chủ
          </div>
        </div>
      )}
      {isCamera && (
        <div className=" flex-grow">
          <div className="flex px-2 h-[48px] bg-[#36393f]  shadow-xl text-[#eee] items-center gap-3">
            Máy ảnh
          </div>
        </div>
      )}

      {isOtherProfile && (
        <div className=" flex-grow">
          <div className="flex justify-between px-2 h-[48px] bg-[#36393f]  shadow-xl text-[#eee] items-center gap-3">
            <span className="truncate max-w-[200px]">
              {nameUserOther || "Hồ sơ"}
            </span>
            {isSidebarOpen === true && (
              <div
                onClick={() => toggleSidebar()}
                className="cursor-pointer mr-1 p-2 rounded-full hover:bg-[#1d1f22] transition duration-200"
              >
                <IoCloseSharp />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col custom-scrollbar overflow-x-hidden gap-1  ">
        {sideItems.map((item) => (
          <Link
            to={item.link}
            key={item.id}
            onClick={() => {
              handleClick(item.id, item.title, item.icon, item.quote);
              setActiveLink(item.id);
              toggleSidebar();
            }}
            className={`flex text-[#a3a3a3] items-center gap-3 mx-2 hover:cursor-pointer  hover:text-[#eee] rounded-md transition-colors duration-200
            ${
              activeLink === item.id || activeLink === item.link
                ? "bg-gray-500 text-[#eee] "
                : "hover:bg-gray-700"
            }`}
          >
            <div className="flex items-center justify-center w-12 h-12">
              <div className="flex justify-center items-center text-2xl">
                {item.icon}
              </div>
            </div>
            <div className="text-[15px]">{item.title}</div>
          </Link>
        ))}
        {isInspirationPage && (
          <div className="flex flex-col mx-4 text-[#a3a3a3] gap-2 mt-2  border-y-[1px] border-[#a3a3a3] py-2">
            <div>Bộ lọc ảnh</div>
            <InsPhotoFilter />
          </div>
        )}
        {isInspirationPage && (
          <div className="flex flex-col text-[#a3a3a3] gap-2 mt-2 mx-2">
            <div className="text-[12px]">CÁC THẺ THỊNH HÀNH HIỆN TẠI</div>
            <div className="flex flex-col gap-2">
              <PhotoTagsTrend />
            </div>
          </div>
        )}
        {/* {isPhotographer && (
          <div className="flex flex-col text-[#a3a3a3] gap-2 mt-2 mx-1 border-y-[1px] border-[#a3a3a3] py-2">
            <div>Bộ lọc nhiếp ảnh gia</div>
            <PhotographerFilter />
          </div>
        )} */}
      </div>
    </div>
  );
};

export default Sidebar;
