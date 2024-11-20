import { SettingOutlined } from "@ant-design/icons";
import { NavLink } from "react-router-dom";

const style = (isActive) =>
  isActive
    ? "p-2 text-slate-200 font-bold hover:text-slate-300"
    : "p-2 text-slate-100 hover:text-slate-300 hover:font-bold hover:bg-slate-700 rounded-md";

export const fields = [
  {
    key: "account",
    label: "Account Settings",
    icon: <SettingOutlined />,
    children: [
      {
        key: "1",
        label: (
          <NavLink
            className={({ isActive }) => style(isActive)}
            to="/customer/album"
          >
            album{" "}
          </NavLink>
        ),
      },
      {
        key: "2",
        label: (
          <NavLink
            className={({ isActive }) => style(isActive)}
            to="/customer/photo"
          >
            photo
          </NavLink>
        ),
      },
      {
        key: "3",
        label: (
          <NavLink
            className={({ isActive }) => style(isActive)}
            to="/customer/booking"
          >
            My Booking
          </NavLink>
        ),
      },
      {
        key: "4",
        label: (
          <NavLink
            className={({ isActive }) => style(isActive)}
            to="/customer/transaction"
          >
            transaction
          </NavLink>
        ),
      },
      {
        key: "5",
        label: (
          <NavLink
            className={({ isActive }) => style(isActive)}
            to="/customer/profile"
          >
            profile
          </NavLink>
        ),
      },
    ],
  },
];
