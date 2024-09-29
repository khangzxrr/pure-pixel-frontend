import { MdHomeFilled } from "react-icons/md";
import { FaCompass } from "react-icons/fa6";
import UserService from "../../services/Keycloak";
import { FiUpload } from "react-icons/fi";
import { IoMailSharp, IoPersonSharp } from "react-icons/io5";
const userData = UserService.getTokenParsed();

console.log(userData);

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
  {
    id: "home",
    link: "/",
    icon: <MdHomeFilled className="text-4xl" />,
  },
  {
    id: "explorer",
    link: "/test/explorer/inspiration",
    icon: <FaCompass className="text-3xl" />,
  },
  {
    id: "upload",
    link: "/test/upload",
    icon: <FiUpload className="text-3xl" />,
  },
  {
    id: "message",
    link: "/test/message",
    icon: <IoMailSharp className="text-3xl" />,
  },
  {
    id: "profile",
    link: "/test/profile",
    icon: <IoPersonSharp className="text-3xl" />,
  },
  //   userData && {
  //     id: "upload",
  //     link: "/test/upload",
  //     icon: <FiUpload className="text-3xl" />,
  //   },
  // ].filter(Boolean);
];
export default ServerSideItems;
