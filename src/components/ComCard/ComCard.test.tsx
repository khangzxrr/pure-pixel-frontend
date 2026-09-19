import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ComCard from "./ComCard";

describe("ComCard", () => {
  it("shows the title and the value in VND", () => {
    render(<ComCard title="Tổng rút" value={1500000} />);

    expect(screen.getByText("Tổng rút")).toBeInTheDocument();
    expect(screen.getByText(/1\.500\.000/)).toHaveTextContent("₫");
  });

  it.each([0, undefined, null])("shows 0 for %s", (value) => {
    render(<ComCard title="Số dư" value={value} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("forwards clicks", async () => {
    const onClick = vi.fn();
    render(<ComCard title="Số dư" value={10} onClick={onClick} />);

    await userEvent.click(screen.getByText("Số dư"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
