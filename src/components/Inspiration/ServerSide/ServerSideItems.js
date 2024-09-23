import { MdHomeFilled } from "react-icons/md";
import { FaCompass } from "react-icons/fa6";

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
];

export default ServerSideItems;
