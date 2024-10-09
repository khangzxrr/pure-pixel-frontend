import { MdHomeFilled } from "react-icons/md";
import { FaCompass, FaBell } from "react-icons/fa6";
import { FiUpload } from "react-icons/fi";
import { IoMailSharp, IoPersonSharp } from "react-icons/io5";

const ServerSideItems = [
  {
    id: "logo",
    name: "Home",
    link: "/",
    icon: (
      <img
        src="/assets/logoP.png"
        alt="logo"
        className="w-[30px] object-cover"
      />
    ),
  },
  {
    id: "blog",
    name: "Blog",
    link: "/blog",
    authen: true,
    icon: <MdHomeFilled className="text-4xl" />,
  },
  {
    id: "explore",
    name: "Explore",
    link: "/explore",
    icon: <FaCompass className="text-3xl" />,
  },
  {
    id: "upload",
    name: "Upload",
    link: "/upload",
    authen: true,
    icon: <FiUpload className="text-3xl" />,
  },
  {
    id: "notification",
    name: "notification",
    authen: true,
    icon: <FaBell className="text-3xl" />,
  },
  {
    id: "message",
    name: "Message",
    link: "/message",
    authen: true,
    icon: <IoMailSharp className="text-3xl" />,
  },
];
export default ServerSideItems;
