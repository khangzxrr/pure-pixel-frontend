import { FaCameraRetro } from "react-icons/fa";
import type { SideItem } from "../Sidebar/Sidebar";

const CameraSideItems: SideItem<string>[] = [
  {
    id: "C1",
    title: "Danh sách máy ảnh",
    icon: <FaCameraRetro />,
    link: "/camera/all",
  },
];
export default CameraSideItems;
