import type { ReactNode } from "react";
import { RiCameraLensLine } from "react-icons/ri";
import { FaMoneyBillTransfer } from "react-icons/fa6";

export type SideItem = {
  id: string;
  title: string;
  icon: ReactNode;
  link: string;
  quote: string;
};

const UploadSideItem: SideItem[] = [
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
