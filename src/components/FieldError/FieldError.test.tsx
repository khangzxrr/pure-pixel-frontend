import { render, screen } from "@testing-library/react";
import { FieldError } from "./FieldError";

describe("FieldError", () => {
  it("renders the message in a label with the given props", () => {
    render(
      <FieldError className="text-red-500" htmlFor="email">
        Bắt buộc
      </FieldError>,
    );
    const label = screen.getByText("Bắt buộc");
    expect(label.tagName).toBe("LABEL");
    expect(label).toHaveClass("text-red-500");
    expect(label).toHaveAttribute("for", "email");
  });

  it("has no class by default", () => {
    render(<FieldError>Lỗi</FieldError>);
    expect(screen.getByText("Lỗi")).toHaveAttribute("class", "");
  });
});
