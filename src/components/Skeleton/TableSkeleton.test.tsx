import { render } from "@testing-library/react";
import TableSkeleton from "./TableSkeleton";

const cells = (container: HTMLElement) =>
  container.querySelectorAll(".animate-pulse");

describe("TableSkeleton", () => {
  it("renders 10 rows of 5 cells by default", () => {
    const { container } = render(<TableSkeleton />);
    expect(cells(container)).toHaveLength(50);
  });

  it("renders the requested rows and columns", () => {
    const { container } = render(
      <TableSkeleton col={6} row={2} isPagination />,
    );
    expect(cells(container)).toHaveLength(12);
    expect(container.querySelector(".grid-cols-6")).not.toBeNull();
  });
});
