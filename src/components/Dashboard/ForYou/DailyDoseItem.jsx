import React from "react";
import { Link } from "react-router-dom";

const DailyDoseItem = [
  {
    label: <Link to="">1st menu item</Link>,
    key: "0",
  },
  {
    label: <Link to="">2nd menu item</Link>,
    key: "1",
  },
  {
    type: "divider",
  },
  {
    label: "3rd menu item",
    key: "3",
  },
];
export default DailyDoseItem;
