import { MdHomeFilled } from "react-icons/md";
import { FaCompass, FaBell } from "react-icons/fa6";
import UserService from "../../services/Keycloak";
import { FiUpload } from "react-icons/fi";
import { IoMailSharp, IoPersonSharp } from "react-icons/io5";
const userData = UserService.getTokenParsed();

console.log(userData);

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
    link: "/test/blog",
    icon: <MdHomeFilled className="text-4xl" />,
  },
  {
    id: "explorer",
    name: "Explorer",
    link: "/test/explorer/",
    icon: <FaCompass className="text-3xl" />,
  },
  {
    id: "upload",
    name: "Upload",
    link: "/test/upload/",
    icon: <FiUpload className="text-3xl" />,
  },
  {
    id: "notification",
    name: "notification",
    icon: <FaBell className="text-3xl" />,
  },
  {
    id: "message",
    name: "Message",
    link: "/test/message",
    icon: <IoMailSharp className="text-3xl" />,
  },
  //   userData && {
  //     id: "upload",
  //     link: "/test/upload",
  //     icon: <FiUpload className="text-3xl" />,
  //   },
  // ].filter(Boolean);
];
export default ServerSideItems;
