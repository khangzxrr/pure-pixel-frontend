import { FaBloggerB } from "react-icons/fa6";
import type { SideItem } from "../Sidebar/Sidebar";

const BlogSideItem: SideItem<string>[] = [
  // {
  //   id: "B1",
  //   title: "Tin mới",
  //   icon: <GrArticle />,
  //   link: "/home/newfeed",
  //   quote: "",
  // },
  {
    id: "B2",
    title: "Blog",
    icon: <FaBloggerB />,
    link: "/home/list",
    quote: "",
  },
];

export default BlogSideItem;
