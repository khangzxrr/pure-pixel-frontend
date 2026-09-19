export type SearchCategoryItem = {
  id: string;
  title: string;
  quote: string;
  param: string;
  // name of the react-icons component
  icon: string;
};

const SearchCategoryItems: SearchCategoryItem[] = [
  {
    id: "s1",
    title: "Tên ảnh",
    quote: "ảnh",
    param: "photoName",
    icon: "FaRegImage",
  },
  {
    id: "s2",
    title: "Nhiếp ảnh gia",
    quote: "nhiếp ảnh gia",
    param: "photographerName",
    icon: "BsPersonBoundingBox",
  },
  // {
  //   id: "s3",
  //   title: "Thẻ",
  //   quote: "thẻ",
  //   param: "photoTags",
  //   icon: "MdNumbers",
  // },
];

export default SearchCategoryItems;
