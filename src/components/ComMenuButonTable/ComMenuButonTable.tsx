import type { CSSProperties } from "react";
import { Menu, Dropdown, Button } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";

export type DefaultMenuItemKey = "details" | "edit" | "delete";

export type ExtraMenuItem<T> = {
  label: string;
  onClick: (record: T) => void;
};

type ComMenuButonTableProps<T> = {
  record: T;
  showModalDetails?: (record: T) => void;
  showModalEdit?: (record: T) => void;
  showModalDelete?: (record: T) => void;
  // accepted but no menu item uses it
  showModalBan?: (record: T) => void;
  extraMenuItems?: ExtraMenuItem<T>[];
  excludeDefaultItems?: DefaultMenuItemKey[];
  // extra item labels and default item keys, in display order
  order?: string[];
};

type MenuEntry = {
  key: string;
  label: string;
  onClick: () => void;
  visible: boolean;
  style?: CSSProperties;
  order?: number;
};

const ComMenuButonTable = <T,>({
  record,
  showModalDetails,
  showModalEdit,
  showModalDelete,
  extraMenuItems = [],
  excludeDefaultItems = [],
  order = [],
}: ComMenuButonTableProps<T>) => {
  const defaultMenuItems: MenuEntry[] = [
    {
      key: "details",
      label: "Chi tiết",
      onClick: () => showModalDetails?.(record),
      visible: !excludeDefaultItems.includes("details"),
    },
    {
      key: "edit",
      label: "Cập nhật chỉnh sửa",
      onClick: () => showModalEdit?.(record),
      visible: !excludeDefaultItems.includes("edit"),
    },
    {
      key: "delete",
      label: "Xóa",
      onClick: () => showModalDelete?.(record),
      visible: !excludeDefaultItems.includes("delete"),
      style: { color: "red" },
    },
  ];

  const allMenuItems: MenuEntry[] = [
    ...extraMenuItems.map((item, index) => ({
      key: `extra-${index}`,
      label: item.label,
      onClick: () => item.onClick(record),
      visible: true,
      order:
        order.indexOf(item.label) !== -1
          ? order.indexOf(item.label)
          : defaultMenuItems.length + index,
    })),
    ...defaultMenuItems,
  ].filter((item) => item.visible);

  allMenuItems.forEach((item) => {
    if (!item.order && item.order !== 0) {
      item.order =
        order.indexOf(item.key) !== -1
          ? order.indexOf(item.key)
          : allMenuItems.length;
    }
  });

  // every item has an order after the loop above
  const sortedMenuItems = allMenuItems.sort(
    (a, b) => Number(a.order) - Number(b.order),
  );

  const menu = (
    <Menu>
      {sortedMenuItems.map((item) => (
        <Menu.Item key={item.key} onClick={item.onClick} style={item.style}>
          {item.label}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={["click"]}>
      <Button icon={<EllipsisOutlined />} />
    </Dropdown>
  );
};

export default ComMenuButonTable;
