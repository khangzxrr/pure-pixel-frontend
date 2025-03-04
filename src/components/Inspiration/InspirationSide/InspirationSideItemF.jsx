import React from "react";
import { FaCameraRetro, FaMoneyBill1 } from "react-icons/fa6";
import { GiPolarStar } from "react-icons/gi";
import { BsPersonBoundingBox } from "react-icons/bs";
import { TbMap2 } from "react-icons/tb";
import { MdAddAPhoto, MdFeed } from "react-icons/md";

const InspirationSideItemF = [
  {
    id: 1,
    title: "Cảm hứng",
    icon: <GiPolarStar />,
    link: "/explore/inspiration",
    quote:
      "Những bức ảnh đẹp nhất gần đây, được nhóm của chúng tôi tuyển chọn theo cách thủ công",
  },
  // {
  //   id: 2,
  //   title: "Ảnh nổi bật",
  //   icon: <FaFireFlameCurved />,
  //   link: "/explore/hot",
  //   quote: "Những bức ảnh thú vị nhất dành cho bạn",
  // },
  // {
  //   id: 3,
  //   title: "Ảnh mới",
  //   icon: <PiClockCountdownBold />,
  //   link: "/explore/news",
  // },
  {
    id: 4,
    title: "Nhiếp ảnh gia",
    icon: <BsPersonBoundingBox />,
    link: "/explore/photographers",
    quote:
      "Theo dõi các nhiếp ảnh gia nổi tiếng để cập nhật các bức ảnh mới nhất của họ",
  },

  {
    id: 6,
    title: "Cửa hàng ảnh",
    icon: <FaMoneyBill1 />,
    link: "/explore/selling",
    quote: "Những bức ảnh đang được đăng bán",
  },
  // {
  //   id: 9,
  //   title: "Blog",
  //   icon: <MdFeed />,
  //   link: "/explore/blog",
  //   quote: "Những bức ảnh đang được đăng bán",
  // },
  {
    id: 5,
    title: "Máy ảnh phổ biến",
    icon: <FaCameraRetro />,
    link: "/explore/camera",
  },
  {
    id: 7,
    title: "Bản đồ ảnh",
    icon: <TbMap2 />,
    link: "/explore/photo-map",
    quote: "Những bức ảnh đang được đăng bán",
  },
  {
    id: 8,
    title: "Các gói chụp ảnh",
    icon: <MdAddAPhoto />,
    link: "/explore/booking-package",
    quote: "Những bức ảnh đang được đăng bán",
  },
];

export default InspirationSideItemF;
