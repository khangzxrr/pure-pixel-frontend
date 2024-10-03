import { RiCameraLensLine } from "react-icons/ri";
import { MdLock } from "react-icons/md";
const UploadSideItem = [
  {
    id: "U1",
    title: "Tải lên ảnh công khai",
    icon: <RiCameraLensLine />,
    link: "/test/upload/public",
    quote: "",
  },
  {
    id: "U2",
    title: "Ảnh riêng tư",
    icon: <MdLock />,
    link: "private",
    quote: "",
  },
];

export default UploadSideItem;
