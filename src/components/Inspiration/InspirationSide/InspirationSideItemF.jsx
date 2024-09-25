import React from "react";
import { FaFireFlameCurved } from "react-icons/fa6";
import { GiPolarStar } from "react-icons/gi";
import { PiClockCountdownBold } from "react-icons/pi";
import { RiVipCrownFill } from "react-icons/ri";
import { TiPin } from "react-icons/ti";

const InspirationSideItemF = [
  {
    id: 1,
    title: "Cảm hứng",
    icon: <GiPolarStar />,
    link: "inspiration",
    quote:
      "Những bức ảnh đẹp nhất gần đây, được nhóm của chúng tôi tuyển chọn theo cách thủ công",
  },
  {
    id: 2,
    title: "Ảnh nổi bật",
    icon: <FaFireFlameCurved />,
    link: "hot",
    quote: "Những bức ảnh thú vị nhất dành cho bạn",
  },
  {
    id: 3,
    title: "Ảnh mới",
    icon: <PiClockCountdownBold />,
    link: "/explorer/news",
  },
  {
    id: 4,
    title: "Ảnh bìa",
    icon: <TiPin />,
    link: "/explorer/cover",
  },
  {
    id: 5,
    title: "Xếp hạng",
    icon: <RiVipCrownFill />,
    link: "/explorer/leaderboard",
  },
];

export default InspirationSideItemF;
