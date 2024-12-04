import { RiCameraLensLine } from "react-icons/ri";
import { MdLock } from "react-icons/md";
import { FaMoneyBillTransfer } from "react-icons/fa6";

const UploadSideItem = [
  {
    id: "U1",
    title: "Tải ảnh lên",
    icon: <RiCameraLensLine />,
    link: "/upload/public",
    quote: "",
  },
  {
    id: "U2",
    title: "Đăng bán ảnh",
    icon: <FaMoneyBillTransfer />,
    link: "/upload/sell",
    quote: "",
  },
  // {
  //   id: "U2",
  //   title: "Ảnh riêng tư",
  //   icon: <MdLock />,
  //   link: "/upload/private",
  //   quote: "",
  // },
  // {
  //   id: "U3",
  //   title: "Ảnh bán",
  //   icon: <MdLock />,
  //   link: "/upload/sell",
  //   quote: "",
  // },
];

export default UploadSideItem;
