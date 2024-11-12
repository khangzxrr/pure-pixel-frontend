import { IoPersonSharp } from "react-icons/io5";
import { IoMdPhotos } from "react-icons/io";
import {
  FaWallet,
  FaImages,
  FaCameraRetro,
  FaClipboardList,
  FaMoneyBillTransfer,
} from "react-icons/fa";
import { BiMoneyWithdraw } from "react-icons/bi";

const UserProfileSideItems = [
  {
    id: "NameProfile",
    title: "Hồ sơ",
    icon: <IoPersonSharp />, // Icon cá nhân
    link: "/profile/userprofile",
  },
  {
    id: "MyPhotos",
    title: "Ảnh của tôi",
    icon: <IoMdPhotos />, // Icon ảnh
    link: "/profile/my-photos",
  },
  {
    id: "MyPhotosSelling",
    title: "Ảnh đã mua",
    icon: <BiMoneyWithdraw />, // Icon ảnh
    link: "/profile/photos-bought",
  },
  {
    id: "photo",
    link: "photo-selling",
    title: "Cửa hàng của tôi",
    icon: <FaImages className="text-3xl" />, // Icon ảnh bán
  },
  {
    id: "transaction",
    link: "wallet",
    title: "Ví",
    icon: <FaWallet className="text-3xl" />, // Icon ví
  },
  {
    id: "booking",
    link: "photoshoot-package",
    title: "Quản lý gói chụp",
    icon: <FaCameraRetro className="text-3xl" />, // Icon máy ảnh
  },
  {
    id: "booking-request",
    link: "booking-request",
    title: "Quản lý yêu cầu chụp",
    icon: <FaClipboardList className="text-3xl" />, // Icon quản lý yêu cầu
  },
];

export default UserProfileSideItems;
