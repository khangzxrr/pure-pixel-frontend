import React from "react";
import { FaRegImage, FaRegHeart, FaChartColumn } from "react-icons/fa6";
import { LiaCrownSolid } from "react-icons/lia";
import { MdOutlineWebStories } from "react-icons/md";
import { GrGallery } from "react-icons/gr";
const MyPhotoNavItem = [
  {
    id: 1,
    icon: <FaRegImage />,
    name: "Ảnh của tôi",
    link: "photo/all",
  },
  {
    id: 2,
    icon: <LiaCrownSolid />,
    name: "Cấp quyền",
    link: "licensing",
  },
  {
    id: 3,
    icon: <MdOutlineWebStories />,
    name: "Câu chuyện",
    link: "stories",
  },
  {
    id: 4,
    icon: <GrGallery />,
    name: "Thư viện ảnh",
    link: "galleries",
  },
  {
    id: 5,
    icon: <FaRegHeart />,
    name: "Yêu thích",
    link: "likes",
  },
  {
    id: 6,
    icon: <FaChartColumn />,
    name: "Thống kê",
    link: "statistics",
  },
];

export default MyPhotoNavItem;
