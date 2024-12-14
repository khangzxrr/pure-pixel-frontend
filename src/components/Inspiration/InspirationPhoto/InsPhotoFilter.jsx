import React from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { IoMdArrowDropdown } from "react-icons/io";
import UseCategoryStore from "../../../states/UseCategoryStore";
import { IoCaretDownCircleOutline } from "react-icons/io5";
import { useKeycloak } from "@react-keycloak/web";
const InsPhotoFilter = () => {
  const { keycloak } = useKeycloak();
  const {
    isWatermarkChecked,
    isForSaleChecked,
    setIsWatermarkChecked,
    setIsForSaleChecked,
  } = UseCategoryStore();

  const handleWatermarkChange = (event) => {
    const isChecked = event.target.checked;
    setIsWatermarkChecked(isChecked);
  };

  const handleForSaleChange = (event) => {
    const isChecked = event.target.checked;
    setIsForSaleChecked(isChecked);
  };

  const setFilterByPhotoDate = UseCategoryStore(
    (state) => state.setFilterByPhotoDate
  );

  const filterByPhotoDate = UseCategoryStore(
    (state) => state.filterByPhotoDate
  );

  const setFilterByUpVote = UseCategoryStore(
    (state) => state.setFilterByUpVote
  );
  const setFilterByFollowed = UseCategoryStore(
    (state) => state.setFilterByIsFollowed
  );
  const filterByFollowed = UseCategoryStore(
    (state) => state.filterByIsFollowed
  );
  const filterByUpVote = UseCategoryStore((state) => state.filterByUpVote);
  const filterByDate = [
    {
      id: "d1",
      name: "Mới nhất",
      param: "desc",
    },
    {
      id: "d2",
      name: "Cũ nhất",
      param: "asc",
    },
  ];
  const filterByVote = [
    {
      id: "v1",
      name: "Tăng dần",
      param: "asc",
    },
    {
      id: "v2",
      name: "Giảm dần",
      param: "desc",
    },
  ];

  const filterByFollowedList = [
    {
      id: "f1",
      name: "Đã theo dõi",
      param: true,
    },
    {
      id: "f2",
      name: "Chưa theo dõi",
      param: false,
    },
  ];
  const handleFilterByPhotoDate = (name, param) => {
    setFilterByPhotoDate(name, param);
  };
  const handleFilterByUpVote = (name, param) => {
    setFilterByUpVote(name, param);
  };

  const handleFilterByIsFollowed = (name, param) => {
    setFilterByFollowed(name, param);
  };

  return (
    <div className="flex flex-col gap-1 ">
      {/* filter by create date menu */}
      <div>
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <MenuButton className="inline-flex items-center w-full justify-center gap-x-1.5 rounded-md   py-2 text-sm font-semibold text-[#eee] ">
              <span className="font-normal text-[16px] text-[#a3a3a3]  ">
                Ngày đăng:
              </span>{" "}
              <div className="text-[16px]">{filterByPhotoDate.name || ""}</div>
              <IoCaretDownCircleOutline className="text-lg hover" />
            </MenuButton>
          </div>

          <MenuItems
            transition
            className="absolute right-0 z-10 mt-2 w-full origin-top rounded-md bg-[#202225] shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
          >
            <div className="py-1">
              {filterByDate.map((item) => (
                <MenuItem key={item.id} className="hover:cursor-pointer">
                  <div
                    onClick={() =>
                      handleFilterByPhotoDate(item.name, item.param)
                    }
                    className="block px-4 py-2 text-sm text-[#eee] data-[focus]:bg-[#eee] data-[focus]:text-[#2f3136] transition-colors duration-200 ease-in-out"
                  >
                    {item.name}
                  </div>
                </MenuItem>
              ))}
            </div>
          </MenuItems>
        </Menu>
      </div>

      {keycloak.authenticated && (
        <div>
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <MenuButton className="inline-flex items-center w-full justify-center gap-x-1.5 rounded-md   py-2 text-sm font-semibold text-[#eee] ">
                <span className="font-normal text-[16px] text-[#a3a3a3]">
                  Theo dõi:
                </span>{" "}
                <div className="text-[16px]">{filterByFollowed.name || ""}</div>
                <IoCaretDownCircleOutline className="text-lg" />
              </MenuButton>
            </div>

            <MenuItems
              transition
              className="absolute left-0 z-10 mt-2 w-40 origin-top rounded-md bg-[#202225] shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
            >
              <div className="py-1">
                {filterByFollowedList.map((item) => (
                  <MenuItem key={item.id} className="hover:cursor-pointer">
                    <div
                      onClick={() =>
                        handleFilterByIsFollowed(item.name, item.param)
                      }
                      className="block px-4 py-2 text-sm text-[#eee] data-[focus]:bg-[#eee] data-[focus]:text-[#2f3136] transition-colors duration-200 ease-in-out"
                    >
                      {item.name}
                    </div>
                  </MenuItem>
                ))}
                <MenuItem className="hover:cursor-pointer">
                  <div
                    onClick={() => handleFilterByIsFollowed("", "")}
                    className="block px-4 py-2 text-sm text-red-500 data-[focus]:bg-red-500 data-[focus]:text-[#eee] transition-colors duration-200 ease-in-out"
                  >
                    Xoá bộ lọc
                  </div>
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
        </div>
      )}

      {/* filter by up vote menu */}
      {/* <div>
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <MenuButton className="inline-flex items-center w-full justify-center gap-x-1.5 rounded-md  py-2 text-sm font-semibold text-[#eee] ">
                <span className="font-normal text-[16px] text-[#a3a3a3]">
                  Lượt bình chọn:
                </span>{" "}
                <div className="text-[16px]">{filterByUpVote.name || ""}</div>
                <IoCaretDownCircleOutline className="text-lg" />
              </MenuButton>
            </div>

            <MenuItems
              transition
              className="absolute right-0 z-10 mt-2 w-full origin-top rounded-md bg-[#202225] shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
            >
              <div className="py-1">
                {filterByVote.map((item) => (
                  <MenuItem key={item.id} className="hover:cursor-pointer">
                    <div
                      onClick={() => handleFilterByUpVote(item.name, item.param)}
                      className="block px-4 py-2 text-sm text-[#eee] data-[focus]:bg-[#eee] data-[focus]:text-[#2f3136] transition-colors duration-200 ease-in-out"
                    >
                      {item.name}
                    </div>
                  </MenuItem>
                ))}
                <MenuItem className="hover:cursor-pointer">
                  <div
                    onClick={() => handleFilterByUpVote("", "")}
                    className="block px-4 py-2 text-sm text-red-500 data-[focus]:bg-red-500 data-[focus]:text-[#eee] transition-colors duration-200 ease-in-out"
                  >
                    Xoá bộ lọc
                  </div>
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
        </div> */}
    </div>
  );
};

export default InsPhotoFilter;
