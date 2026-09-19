import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { TableProps } from "antd";
import ComTable from "./ComTable";

type Row = { id: string; name: string };

const columns: TableProps<Row>["columns"] = [
  { title: "Tên", dataIndex: "name", key: "name" },
];

const rows = (count: number): Row[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `id-${index + 1}`,
    name: `Hàng ${index + 1}`,
  }));

const bodyRows = () =>
  screen.getAllByRole("row").filter((row) => row.hasAttribute("data-row-key"));

describe("ComTable", () => {
  it("renders the rows keyed by id without pagination for one page", () => {
    const { container } = render(
      <ComTable columns={columns} dataSource={rows(3)} />,
    );

    expect(bodyRows().map((row) => row.getAttribute("data-row-key"))).toEqual([
      "id-1",
      "id-2",
      "id-3",
    ]);
    expect(container.querySelector(".ant-pagination")).toBeNull();
    expect(container.querySelector(".ant-table-body")).toHaveStyle({
      maxHeight: "55vh",
    });
  });

  it("paginates with a size changer from 10 rows", async () => {
    const { container } = render(
      <ComTable columns={columns} dataSource={rows(12)} y="65vh" x={1020} />,
    );

    expect(bodyRows()).toHaveLength(10);
    expect(container.querySelector(".ant-pagination-options")).not.toBeNull();
    expect(container.querySelector(".ant-table-body")).toHaveStyle({
      maxHeight: "65vh",
    });

    await userEvent.click(screen.getByTitle("2"));
    expect(bodyRows()).toHaveLength(2);
    expect(within(bodyRows()[0]).getByText("Hàng 11")).toBeInTheDocument();
  });

  it("lets callers replace the pagination and handle changes", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <ComTable
        columns={columns}
        dataSource={rows(12)}
        pagination={{ pageSize: 5, showSizeChanger: false }}
        onChange={onChange}
      />,
    );

    expect(bodyRows()).toHaveLength(5);
    expect(container.querySelector(".ant-pagination-options")).toBeNull();

    await userEvent.click(screen.getByTitle("3"));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ current: 3, pageSize: 5 }),
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ action: "paginate" }),
    );
  });

  it("shows the loading state", () => {
    const { container } = render(
      <ComTable columns={columns} dataSource={[]} loading />,
    );
    expect(container.querySelector(".ant-spin-spinning")).not.toBeNull();
  });
});
