import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import ComButton from "./ComButton";

describe("ComButton", () => {
  it("renders children with the default styling and handles clicks", async () => {
    const onClick = vi.fn();
    render(<ComButton onClick={onClick}>Lưu</ComButton>);

    const button = screen.getByRole("button", { name: "Lưu" });
    expect(button).toHaveClass("text-white", "bg-[#32353b]");
    await userEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("applies custom classes and passes other props to antd", () => {
    render(
      <ComButton className="w-full" textColor="text-black" htmlType="submit">
        Gửi
      </ComButton>,
    );

    const button = screen.getByRole("button", { name: "Gửi" });
    expect(button).toHaveClass("w-full", "text-black");
    expect(button).not.toHaveClass("text-white");
    expect(button).toHaveAttribute("type", "submit");
  });

  it("ignores onClick when an end icon is set", async () => {
    const onClick = vi.fn();
    render(
      <ComButton onClick={onClick} endIcon={<span>icon</span>}>
        Mở
      </ComButton>,
    );

    await userEvent.click(screen.getByRole("button", { name: "Mở" }));

    expect(onClick).not.toHaveBeenCalled();
  });

  it("forwards the ref to the button element", () => {
    const ref = createRef<HTMLButtonElement | HTMLAnchorElement>();
    render(<ComButton ref={ref}>Ref</ComButton>);
    expect(ref.current).toBe(screen.getByRole("button", { name: "Ref" }));
  });
});
