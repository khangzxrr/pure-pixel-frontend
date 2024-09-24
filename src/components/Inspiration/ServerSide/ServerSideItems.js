import { MdHomeFilled } from "react-icons/md";
import { FaCompass } from "react-icons/fa6";
import UserService from "../../../services/Keycloak";
import { FiUpload } from "react-icons/fi";
const userData = UserService.getTokenParsed();

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
    // authen: true,
  },
];

// Chỉ thêm mục upload nếu userData tồn tại
// if (userData) {
//   ServerSideItems.push({
//     id: "upload",
//     link: "/test/upload",
//     icon: <FiUpload className="text-3xl" />,
//   });
// }

export default ServerSideItems;
