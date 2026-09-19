import { render, screen } from "@testing-library/react";
import type { MockInstance } from "vitest";
import userEvent from "@testing-library/user-event";
import ComMenuButonTable from "./ComMenuButonTable";

type Row = { id: string };
const record: Row = { id: "r1" };

const openMenu = async () => {
  await userEvent.click(screen.getByRole("button"));
  return screen.findAllByRole("menuitem");
};

const labels = (items: HTMLElement[]) => items.map((item) => item.textContent);

// the menu closes after every choice
const choose = async (label: string) => {
  await userEvent.click(screen.getByRole("button"));
  await userEvent.click(await screen.findByText(label));
};

describe("ComMenuButonTable", () => {
  let consoleError: MockInstance<typeof console.error>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // the component uses antd's deprecated overlay and Menu children APIs
    const unexpected = consoleError.mock.calls
      .map(([message]) => String(message))
      .filter((message) => !message.includes("deprecated"));
    expect(unexpected).toEqual([]);
    consoleError.mockRestore();
  });

  it("shows the default actions and passes the record to them", async () => {
    const showModalDetails = vi.fn();
    const showModalEdit = vi.fn();
    const showModalDelete = vi.fn();
    render(
      <ComMenuButonTable
        record={record}
        showModalDetails={showModalDetails}
        showModalEdit={showModalEdit}
        showModalDelete={showModalDelete}
      />,
    );

    const items = await openMenu();
    expect(labels(items)).toEqual(["Chi tiết", "Cập nhật chỉnh sửa", "Xóa"]);

    await userEvent.click(screen.getByText("Chi tiết"));
    await choose("Cập nhật chỉnh sửa");
    await choose("Xóa");
    expect(showModalDetails).toHaveBeenCalledWith(record);
    expect(showModalEdit).toHaveBeenCalledWith(record);
    expect(showModalDelete).toHaveBeenCalledWith(record);
  });

  it("hides excluded items and ignores missing handlers", async () => {
    render(
      <ComMenuButonTable record={record} excludeDefaultItems={["edit"]} />,
    );

    const items = await openMenu();
    expect(labels(items)).toEqual(["Chi tiết", "Xóa"]);
    await userEvent.click(screen.getByText("Chi tiết"));
    await choose("Xóa");
  });

  it("adds extra items and follows the given order", async () => {
    const ban = vi.fn();
    const restore = vi.fn();
    render(
      <ComMenuButonTable
        record={record}
        excludeDefaultItems={["edit"]}
        extraMenuItems={[
          { label: "Khóa", onClick: ban },
          { label: "Mở lại", onClick: restore },
        ]}
        order={["Khóa", "delete"]}
      />,
    );

    const items = await openMenu();
    // listed: Khóa (0), delete (1); unlisted keep their fallback position
    expect(labels(items)).toEqual(["Khóa", "Xóa", "Mở lại", "Chi tiết"]);

    await userEvent.click(screen.getByText("Khóa"));
    await choose("Mở lại");
    expect(ban).toHaveBeenCalledWith(record);
    expect(restore).toHaveBeenCalledWith(record);
  });
});
