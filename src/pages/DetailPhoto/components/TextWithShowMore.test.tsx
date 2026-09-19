import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TextWithShowMore from "./TextWithShowMore";

describe("TextWithShowMore", () => {
  it("renders short descriptions without a toggle", () => {
    render(<TextWithShowMore description="Mô tả ngắn" />);

    expect(screen.getByText("Mô tả ngắn")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /xem thêm|rút gọn/i }),
    ).toBeNull();
  });

  it("expands and collapses long descriptions from the button and container", async () => {
    const user = userEvent.setup();
    const description = "a".repeat(110);
    render(<TextWithShowMore description={description} />);

    expect(screen.getByText(`${"a".repeat(100)}...`)).toBeInTheDocument();
    expect(
      screen.queryByText(description, { exact: true }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Xem thêm" }));

    expect(screen.getByText(description)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rút gọn" })).toBeInTheDocument();

    await user.click(screen.getByText(description));

    expect(screen.getByText(`${"a".repeat(100)}...`)).toBeInTheDocument();
    expect(
      screen.queryByText(description, { exact: true }),
    ).not.toBeInTheDocument();
  });
});
