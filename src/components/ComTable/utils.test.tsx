import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { TableProps } from "antd";
import type { ColumnType, FilterDropdownProps } from "antd/es/table/interface";
import type { Key, ReactElement, ReactNode } from "react";
import ComTable from "./ComTable";
import useColumnFilters from "./utils";
import type { MockInstance } from "vitest";

// the date pickers cannot be driven in jsdom: a stub reports its value and emits ranges
vi.mock("antd", async (importOriginal) => {
  const antd = await importOriginal<typeof import("antd")>();
  const { createElement } = await import("react");
  const dayjs = (await import("dayjs")).default;
  type StubProps = { value?: unknown; onChange: (dates: unknown) => void };
  const button = (label: string, onClick: () => void) =>
    createElement("button", { type: "button", onClick }, label);
  const RangePicker = ({ value, onChange }: StubProps) =>
    createElement(
      "div",
      null,
      createElement("output", null, JSON.stringify(value ?? null)),
      button("pick range", () =>
        onChange([
          dayjs(new Date(2026, 8, 1, 15)),
          dayjs(new Date(2026, 8, 3, 9)),
        ]),
      ),
      button("pick open range", () =>
        onChange([dayjs(new Date(2026, 8, 1, 15)), null]),
      ),
      button("clear range", () => onChange(null)),
    );
  return {
    ...antd,
    DatePicker: Object.assign(() => null, { RangePicker }),
  };
});

type Row = {
  id: string;
  name?: unknown;
  user?: { name?: string } | null;
  price?: number;
  createdAt?: unknown;
};

type Filters = ReturnType<typeof useColumnFilters>;

const dropdownProps = (
  overrides: Partial<Omit<FilterDropdownProps, "selectedKeys">> & {
    selectedKeys?: unknown[];
  } = {},
) =>
  ({
    prefixCls: "ant-table-filter",
    setSelectedKeys: vi.fn(),
    selectedKeys: [],
    confirm: vi.fn(),
    clearFilters: vi.fn(),
    close: vi.fn(),
    visible: true,
    ...overrides,
  }) as FilterDropdownProps & {
    setSelectedKeys: ReturnType<typeof vi.fn>;
    confirm: ReturnType<typeof vi.fn>;
    clearFilters: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
  };

const renderDropdown = (
  column: ColumnType<Row>,
  props: FilterDropdownProps,
) => {
  const dropdown = column.filterDropdown as (
    props: FilterDropdownProps,
  ) => ReactNode;
  return render(<>{dropdown(props)}</>);
};

const iconColor = (column: ColumnType<Row>, filtered: boolean) => {
  const icon = column.filterIcon as (filtered: boolean) => ReactElement;
  const { container } = render(icon(filtered));
  return (container.firstChild as HTMLElement).style.color;
};

// onFilter receives the stored keys, which are arrays for the range filters
const filterBy = (column: ColumnType<Row>, value: unknown, record: Row) =>
  column.onFilter?.(value as Key, record);

const localIso = (day: number) => new Date(2026, 8, day).toISOString();

function SearchTable({
  data,
  onFilters,
}: {
  data: Row[];
  onFilters?: (filters: Filters) => void;
}) {
  const filters = useColumnFilters();
  onFilters?.(filters);
  const columns: TableProps<Row>["columns"] = [
    { title: "Tên", key: "name", ...filters.getColumnSearchProps("user.name", "Tên") },
    { title: "Mã", key: "id", ...filters.getColumnSearchProps("id", "Mã") },
  ];
  return <ComTable columns={columns} dataSource={data} />;
}

const bodyRowKeys = () =>
  screen
    .getAllByRole("row")
    .map((row) => row.getAttribute("data-row-key"))
    .filter(Boolean);

describe("useColumnFilters", () => {
  describe("getColumnSearchProps in a table", () => {
    const data: Row[] = [
      { id: "a1", user: { name: "Anh Minh" } },
      { id: "b2", user: { name: "Bảo" } },
      { id: "c3", user: null },
    ];

    const openFilter = async (container: HTMLElement, index = 0) => {
      const triggers = container.querySelectorAll(".ant-table-filter-trigger");
      await userEvent.click(triggers[index]);
    };

    it("filters rows, highlights matches and resets", async () => {
      const select = vi.spyOn(HTMLInputElement.prototype, "select");
      let latest: Filters | undefined;
      const { container } = render(
        <SearchTable data={data} onFilters={(f) => (latest = f)} />,
      );

      await openFilter(container);
      const input = await screen.findByPlaceholderText("Tìm kiếm Tên");
      await waitFor(() => expect(select).toHaveBeenCalled());
      await userEvent.type(input, "minh");
      await userEvent.click(screen.getByRole("button", { name: /Tìm kiếm/ }));

      await waitFor(() => expect(bodyRowKeys()).toEqual(["a1"]));
      expect(latest?.searchText).toBe("minh");
      expect(latest?.searchedColumn).toBe("user.name");
      expect(container.querySelector("mark")).toHaveTextContent("Minh");

      await openFilter(container);
      await userEvent.click(screen.getByRole("button", { name: "Đặt lại" }));
      await waitFor(() => expect(latest?.searchText).toBe(""));
      expect(screen.getByPlaceholderText("Tìm kiếm Tên")).toHaveValue("");
      // resetting clears the keys; the rows come back on the next search
      expect(bodyRowKeys()).toEqual(["a1"]);
      await userEvent.click(screen.getByRole("button", { name: /Tìm kiếm/ }));
      await waitFor(() => expect(bodyRowKeys()).toEqual(["a1", "b2", "c3"]));
      select.mockRestore();
    });

    it("searches on Enter and closes on demand", async () => {
      const { container } = render(<SearchTable data={data} />);

      await openFilter(container, 1);
      const input = await screen.findByPlaceholderText("Tìm kiếm Mã");
      await userEvent.type(input, "B2{Enter}");
      await waitFor(() => expect(bodyRowKeys()).toEqual(["b2"]));

      await openFilter(container, 1);
      await userEvent.clear(screen.getByPlaceholderText("Tìm kiếm Mã"));
      await userEvent.click(screen.getAllByRole("button", { name: "Đóng" })[0]);
      await waitFor(() =>
        expect(
          screen.getByPlaceholderText("Tìm kiếm Mã").closest(".ant-dropdown"),
        ).toHaveClass("ant-dropdown-hidden"),
      );
    });
  });

  describe("getColumnSearchProps", () => {
    it("matches nested values case-insensitively", () => {
      const { result } = renderHook(() => useColumnFilters());
      const column = result.current.getColumnSearchProps<Row>("user.name", "Tên");

      expect(filterBy(column, "MIN", { id: "1", user: { name: "Minh" } })).toBe(true);
      expect(filterBy(column, "x", { id: "1", user: { name: "Minh" } })).toBe(false);
      expect(filterBy(column, "x", { id: "1", user: null })).toBe(false);
      expect(iconColor(column, true)).toBe("rgb(222, 24, 24)");
      expect(iconColor(column, false)).toBe("rgb(255, 255, 255)");
    });

    it("renders plain values until searched, then highlights", () => {
      const { result } = renderHook(() => useColumnFilters());
      const render1 = result.current.getColumnSearchProps<Row>("name", "Tên").render;
      expect(render1?.(undefined, { id: "1", name: "Minh" }, 0)).toBe("Minh");
      expect(render1?.(undefined, { id: "1", name: { a: 1 } }, 0)).toBe(
        "[object Object]",
      );

      act(() => result.current.handleSearch([], vi.fn(), "name"));
      const render2 = result.current.getColumnSearchProps<Row>("name", "Tên").render;
      const { container } = render(
        <>{render2?.(undefined, { id: "1", name: undefined }, 0) as ReactNode}</>,
      );
      expect(container.querySelector("mark")).toBeNull();
    });

    it("renders the dropdown input from the selected keys", async () => {
      const { result } = renderHook(() => useColumnFilters());
      const props = dropdownProps({ selectedKeys: ["abc"] });
      renderDropdown(result.current.getColumnSearchProps<Row>("name", "Tên"), props);

      const input = screen.getByPlaceholderText("Tìm kiếm Tên");
      expect(input).toHaveValue("abc");
      await userEvent.clear(input);
      expect(props.setSelectedKeys).toHaveBeenLastCalledWith([]);
    });
  });

  describe("getColumnApprox", () => {
    it("stores the picked range and searches by it", async () => {
      const { result } = renderHook(() => useColumnFilters());
      const column = result.current.getColumnApprox<Row>("createdAt");
      const range = [localIso(1), localIso(3)];
      const props = dropdownProps({ selectedKeys: [range] });
      renderDropdown(column, props);

      await userEvent.click(screen.getByRole("button", { name: "pick range" }));
      expect(props.setSelectedKeys).toHaveBeenLastCalledWith([range]);
      await userEvent.click(screen.getByRole("button", { name: "pick open range" }));
      expect(props.setSelectedKeys).toHaveBeenLastCalledWith([[localIso(1), ""]]);
      await userEvent.click(screen.getByRole("button", { name: "clear range" }));
      expect(props.setSelectedKeys).toHaveBeenLastCalledWith([]);

      fireEvent.keyDown(screen.getByRole("button", { name: "clear range" }));
      await userEvent.click(screen.getByRole("button", { name: /Tìm kiếm/ }));
      expect(props.confirm).toHaveBeenCalled();
      expect(result.current.searchText).toEqual([range]);
      expect(result.current.searchedColumn).toBe("createdAt");

      await userEvent.click(screen.getByRole("button", { name: "Đóng" }));
      expect(props.close).toHaveBeenCalled();
      expect(iconColor(column, true)).toBe("rgb(0, 26, 255)");
      expect(iconColor(column, false)).toBe("rgb(255, 255, 255)");
    });

    it("filters and renders record dates", () => {
      const { result } = renderHook(() => useColumnFilters());
      const column = result.current.getColumnApprox<Row>("createdAt");
      const range = [localIso(1), localIso(3)];
      const at = (createdAt: unknown): Row => ({ id: "1", createdAt });

      expect(filterBy(column, range, at("2026-09-02T10:00:00"))).toBe(true);
      expect(filterBy(column, range, at(new Date(2026, 8, 3, 23).getTime()))).toBe(true);
      expect(filterBy(column, range, at("2026-09-04T00:00:00"))).toBe(false);
      expect(filterBy(column, [], at("2026-09-04T00:00:00"))).toBe(true);
      expect(filterBy(column, "2026", at("2026-09-04T00:00:00"))).toBe(true);

      expect(column.render?.(undefined, at("2026-09-02T10:00:00"), 0)).toBe(
        "02-09-2026",
      );
      expect(column.render?.(undefined, at(new Date(2026, 0, 5)), 0)).toBe(
        "05-01-2026",
      );
    });

    it("reads other values as text", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const { result } = renderHook(() => useColumnFilters());
      const column = result.current.getColumnApprox<Row>("createdAt");
      expect(column.render?.(undefined, { id: "1", createdAt: true }, 0)).toBe(
        "Invalid date",
      );
      warn.mockRestore();
    });
  });

  describe("getColumnApprox1", () => {
    it("shows the stored range and confirms", async () => {
      const { result } = renderHook(() => useColumnFilters());
      const column = result.current.getColumnApprox1<Row>("createdAt");
      const range = [localIso(1), localIso(3)];
      const props = dropdownProps({ selectedKeys: [range] });
      const { rerender } = renderDropdown(column, props);

      expect(JSON.parse(screen.getByRole("status").textContent ?? "")).toEqual(range);
      await userEvent.click(screen.getByRole("button", { name: "pick range" }));
      expect(props.setSelectedKeys).toHaveBeenLastCalledWith([range]);
      await userEvent.click(screen.getByRole("button", { name: /Tìm kiếm/ }));
      expect(props.confirm).toHaveBeenCalledWith();
      await userEvent.click(screen.getByRole("button", { name: "Đóng" }));
      expect(props.close).toHaveBeenCalled();

      const dropdown = column.filterDropdown as (p: FilterDropdownProps) => ReactNode;
      rerender(<>{dropdown(dropdownProps())}</>);
      expect(screen.getByRole("status")).toHaveTextContent("null");
      expect(iconColor(column, true)).toBe("rgb(0, 26, 255)");
      expect(iconColor(column, false)).toBe("rgb(255, 255, 255)");
    });

    it("filters by the top-level date", () => {
      const { result } = renderHook(() => useColumnFilters());
      const column = result.current.getColumnApprox1<Row>("createdAt");
      const range = [localIso(1), localIso(3)];

      expect(filterBy(column, range, { id: "1", createdAt: "2026-09-02T00:00:00" })).toBe(true);
      expect(filterBy(column, range, { id: "1", createdAt: "2026-08-31T00:00:00" })).toBe(false);
      expect(filterBy(column, [], { id: "1" })).toBe(true);
      expect(filterBy(column, 1, { id: "1" })).toBe(true);
    });
  });

  describe("getColumnPriceRangeProps", () => {
    let consoleError: MockInstance<typeof console.error>;

    beforeEach(() => {
      consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      // the price range dropdown uses antd's deprecated Input.Group
      const unexpected = consoleError.mock.calls
        .map(([message]) => String(message))
        .filter((message) => !message.includes("deprecated"));
      expect(unexpected).toEqual([]);
      consoleError.mockRestore();
    });

    it("edits the min and max of the range", () => {
      const { result } = renderHook(() => useColumnFilters());
      const column = result.current.getColumnPriceRangeProps<Row>("price", "Giá");
      const empty = dropdownProps();
      const { unmount } = renderDropdown(column, empty);

      fireEvent.change(screen.getByPlaceholderText("Tối thiểu"), {
        target: { value: "1,500" },
      });
      expect(empty.setSelectedKeys).toHaveBeenLastCalledWith([["1500", ""]]);
      empty.setSelectedKeys.mockClear();
      fireEvent.change(screen.getByPlaceholderText("Tối thiểu"), {
        target: { value: "abc" },
      });
      expect(empty.setSelectedKeys).not.toHaveBeenCalled();
      unmount();

      const filled = dropdownProps({ selectedKeys: [["1500", "30000"]] });
      renderDropdown(column, filled);
      expect(screen.getByPlaceholderText("Tối thiểu")).toHaveValue("1,500");
      const max = screen.getByPlaceholderText("Tối đa");
      expect(max).toHaveValue("30,000");
      fireEvent.change(max, { target: { value: "40,000" } });
      expect(filled.setSelectedKeys).toHaveBeenLastCalledWith([["1500", "40000"]]);

      // only digits can be typed
      expect(fireEvent.keyPress(max, { key: "a", charCode: 97 })).toBe(false);
      expect(fireEvent.keyPress(max, { key: "5", charCode: 53 })).toBe(true);
    });

    it("searches, resets and closes", async () => {
      const { result } = renderHook(() => useColumnFilters());
      const column = result.current.getColumnPriceRangeProps<Row>("price", "Giá");
      const props = dropdownProps({ selectedKeys: [["1000", ""]] });
      renderDropdown(column, props);

      await userEvent.click(screen.getByRole("button", { name: /Tìm kiếm/ }));
      expect(props.confirm).toHaveBeenCalled();
      expect(result.current.searchText).toEqual(["1000", ""]);
      await userEvent.click(screen.getByRole("button", { name: "Đặt lại" }));
      expect(props.clearFilters).toHaveBeenCalled();
      expect(result.current.searchText).toBe("");
      await userEvent.click(screen.getByRole("button", { name: "Đóng" }));
      expect(props.close).toHaveBeenCalled();
      expect(iconColor(column, true)).toBe("rgb(0, 26, 255)");
      expect(iconColor(column, false)).toBe("rgb(255, 255, 255)");
    });

    it("ignores reset without clearFilters", async () => {
      const { result } = renderHook(() => useColumnFilters());
      const props = dropdownProps({ clearFilters: undefined });
      renderDropdown(result.current.getColumnSearchProps<Row>("name", "Tên"), props);
      await userEvent.click(screen.getByRole("button", { name: "Đặt lại" }));

      const priceProps = dropdownProps({ clearFilters: undefined });
      renderDropdown(result.current.getColumnPriceRangeProps<Row>("price"), priceProps);
      await userEvent.click(screen.getAllByRole("button", { name: "Đặt lại" })[1]);
      expect(result.current.searchText).toBe("");
    });

    it("filters by price bounds and formats prices", () => {
      const { result } = renderHook(() => useColumnFilters());
      const column = result.current.getColumnPriceRangeProps<Row>("price", "Giá");
      const row = (price?: number): Row => ({ id: "1", price });

      expect(filterBy(column, ["1,000", "5,000"], row(3000))).toBe(true);
      expect(filterBy(column, ["1,000", "5,000"], row(500))).toBe(false);
      expect(filterBy(column, ["1,000", "5,000"], row(6000))).toBe(false);
      expect(filterBy(column, ["", "5,000"], row(10))).toBe(true);
      expect(filterBy(column, ["1,000", ""], row(9000))).toBe(true);
      expect(filterBy(column, ["1,000", ""], row(undefined))).toBe(false);
      expect(filterBy(column, [], row(1))).toBe(true);
      expect(filterBy(column, true, row(1))).toBe(true);
      expect(column.render?.(1234567, row(1), 0)).toBe("1,234,567");
    });
  });

  it("collects unique values and filters by them", () => {
    const { result } = renderHook(() => useColumnFilters());
    const data: Row[] = [
      { id: "1", user: { name: "A" } },
      { id: "2", user: { name: "A" } },
      { id: "3", user: null },
      { id: "4", user: { name: "B" } },
    ];
    const values = result.current.getUniqueValues(data, "user.name");
    expect(values).toEqual(["A", "B"]);

    const column = result.current.getColumnFilterProps<Row>("user.name", "Tên", [
      "A",
      "B",
    ]);
    expect(column.filters).toEqual([
      { text: "A", value: "A" },
      { text: "B", value: "B" },
    ]);
    expect(column.onFilter?.("A", data[0])).toBe(true);
    expect(column.onFilter?.("A", data[3])).toBe(false);
    expect(column.render?.("A", data[0], 0)).toBe("A");
  });
});
