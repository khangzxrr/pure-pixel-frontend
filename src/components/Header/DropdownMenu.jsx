import { Menu } from "antd";
import { NavLink } from "react-router-dom";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";

export const DropdownMenu = ({ handleAuthAction }) => (
  <Menu style={{ padding: 0, width: "120%" }}>
    <Menu.Item key="1" style={{ padding: 0 }}>
      <div className="flex items-center text-black hover:text-blue-600 cursor-pointer w-full py-2">
        <NavLink to="/my-photo/" className=" flex ml-10">
          <UserOutlined className="mr-2" />
          Ảnh của tôi
        </NavLink>
      </div>
    </Menu.Item>
    <Menu.Item key="2" style={{ padding: 0 }}>
      <div className="flex items-center text-black hover:text-blue-600 cursor-pointer w-full py-2">
        <NavLink to="/customer" className=" flex ml-10">
          <UserOutlined className="mr-2" />
          Trang cá nhân
        </NavLink>
      </div>
    </Menu.Item>
    <Menu.Item key="3" style={{ padding: 0 }}>
      <div className="flex items-center text-black hover:text-blue-600 cursor-pointer w-full py-2">
        <NavLink to="/booking" className=" flex ml-10">
          <UserOutlined className="mr-2" />
          Đặt lịch
        </NavLink>
      </div>
    </Menu.Item>
    <Menu.Item key="4" style={{ padding: 0 }}>
      <div className="flex items-center text-black hover:text-blue-600 cursor-pointer w-full py-2">
        <NavLink to="/booking" className=" flex ml-10">
          <UserOutlined className="mr-2" />
          Thông tin
        </NavLink>
      </div>
    </Menu.Item>
    <Menu.Item key="6" style={{ padding: 0 }}>
      <div
        onClick={() => handleAuthAction("logout")}
        className="flex text-red-400 hover:text-white  hover:bg-red-400 cursor-pointer w-full py-2 rounded-ee-lg rounded-es-lg  transition duration-500 "
      >
        <div className=" flex ml-10">
          <LogoutOutlined className="mr-2" />
          Đăng xuất
        </div>
      </div>
    </Menu.Item>
  </Menu>
);
