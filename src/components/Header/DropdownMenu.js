import { Menu } from "antd";

export const menu = (
  <Menu>
    <Menu.Item key="1" icon={<FontAwesomeIcon icon={faUser} />}>
      <NavLink to="/user/user-profile">User Profile</NavLink>
    </Menu.Item>
    <Menu.Item key="8" icon={<FontAwesomeIcon icon={faPaintRoller} />}>
      <NavLink to="/customize">Custom Bag</NavLink>
    </Menu.Item>
    <Menu.Item key="6" icon={<FontAwesomeIcon icon={faBagShopping} />}>
      <NavLink to="/my-custom">My List Customize</NavLink>
    </Menu.Item>

    <Menu.Item key="3" icon={<FontAwesomeIcon icon={faShoppingCart} />}>
      <NavLink to="/user/user-order">User Order</NavLink>
    </Menu.Item>

    <Menu.Item key="5" icon={<FontAwesomeIcon icon={faHeart} />}>
      <NavLink to="/user/user-wishlist">User Wishlist</NavLink>
    </Menu.Item>

    <Menu.Item
      key="7"
      icon={<FontAwesomeIcon icon={faSignOutAlt} />}
      onClick={handleLogout}
    >
      Log Out
    </Menu.Item>
  </Menu>
);
