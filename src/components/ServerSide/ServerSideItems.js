import { MdHomeFilled } from "react-icons/md";
import { FaCompass, FaBell } from "react-icons/fa6";
import { FiUpload } from "react-icons/fi";
import { IoMailSharp } from "react-icons/io5";
import { FaCameraRetro } from "react-icons/fa";

const ServerSideItems = [
  {
    id: "logo",
    link: "/",
    icon: (
      <img
        src="/assets/logoP.png"
        alt="logo"
        className="w-[30px] object-cover"
      />
    ),
  },
  // {
  //   id: "blog",
  //   name: "Trang chủ",
  //   link: "/home",
  //   authen: true,
  //   icon: <MdHomeFilled className="text-4xl" />,
  // },
  {
    id: "explore",
    name: "Khám phá",
    link: "/explore",
    icon: <FaCompass className="text-3xl" />,
  },
  // {
  //   id: "camera",
  //   name: "Máy ảnh",
  //   link: "/camera",
  //   icon: <FaCameraRetro className="text-3xl" />,
  // },
  {
    id: "upload",
    name: "Tải lên",
    link: "/upload",
    author: true,
    authen: true,
    icon: <FiUpload className="text-3xl" />,
  },
  {
    id: "notification",
    name: "Thông báo",
    authen: true,
    icon: <FaBell className="text-3xl" />,
  },
  {
    id: "message",
    name: "Tin nhắn",
    link: "/message",
    authen: true,
    icon: <IoMailSharp className="text-3xl" />,
  },
];
export default ServerSideItems;
