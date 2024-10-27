import React from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { IoOptionsSharp } from "react-icons/io5";
import UseCategoryStore from "../../states/UseCategoryStore"; // Import store để quản lý trạng thái
import InspirationTrendItem from "../Inspiration/InspirationSide/InspirationTrendItem"; // Import danh sách item cố định
import { CategoryApi } from "../../apis/CategoryApi"; // Import API lấy danh mục
import { useQuery } from "@tanstack/react-query"; // Import useQuery từ react-query

const Categories = () => {
  // Lấy hàm setSelectedPhotoCategory từ store
  const setSelectedPhotoCategory = UseCategoryStore(
    (state) => state.setSelectedPhotoCategory
  );
  // Lấy danh mục đã chọn từ store
  const selectedPhotoCategory = UseCategoryStore(
    (state) => state.selectedPhotoCategory
  );

  // Fetch danh sách danh mục bằng react-query
  const {
    data: apiCategories,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["categories"], // Khóa truy vấn
    queryFn: CategoryApi.getAllCategories, // Hàm gọi API
    staleTime: 60000, // Dữ liệu được coi là tươi trong 60 giây
    cacheTime: 300000, // Dữ liệu được cache trong 5 phút
  });

  // Kết hợp các item cố định với danh mục được fetch từ API
  const categories = [
    ...InspirationTrendItem,
    ...(apiCategories || []).map((cate) => ({
      // Map qua danh sách từ API
      id: cate.id,
      title: cate.name,
    })),
  ];

  // Hàm xử lý khi click vào danh mục
  const handleCategoryClick = (name) => {
    setSelectedPhotoCategory(name); // Lưu danh mục đã chọn vào store
  };

  // Nếu đang loading, hiển thị thông báo
  if (isLoading) return <div>Loading categories...</div>;
  // Nếu có lỗi, hiển thị thông báo lỗi
  if (isError) return <div>Error loading categories: {error.message}</div>;

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div className="text-[#eee]">
        <MenuButton className="inline-flex w-full items-center justify-center gap-x-1.5 rounded-md text-md px-3 py-[6px] font-semibold">
          <div className="hidden 2xl:block">
            {selectedPhotoCategory.name || "Danh mục"}
          </div>
          <IoOptionsSharp aria-hidden="true" className="-mr-1 h-6 w-6" />
        </MenuButton>
      </div>
      <MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-gray-500 shadow-lg ring-1 ring-black ring-opacity-5 transition-transform transform scale-95 opacity-0 focus:outline-none data-[closed]:opacity-0 data-[open]:opacity-100 data-[enter]:duration-100 data-[leave]:duration-75">
        <div className="py-1 text-[#eee] bg-[#202225]">
          {categories.map(
            (
              item // Lặp qua danh sách các danh mục
            ) => (
              <MenuItem key={item.id}>
                <div
                  onClick={() => handleCategoryClick(item.title)} // Xử lý click
                  className="block px-4 py-2 text-sm hover:bg-[#36393f] cursor-pointer"
                >
                  {item.title || item.titleT}
                </div>
              </MenuItem>
            )
          )}
        </div>
      </MenuItems>
    </Menu>
  );
};

export default Categories;
