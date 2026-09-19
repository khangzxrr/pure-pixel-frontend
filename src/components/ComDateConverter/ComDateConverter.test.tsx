import { render } from "@testing-library/react";
import ComDateConverter from "./ComDateConverter";

describe("ComDateConverter", () => {
  it("formats ISO dates with and without time", () => {
    const { container, rerender } = render(
      <ComDateConverter>2026-09-15T08:30:00</ComDateConverter>,
    );
    expect(container).toHaveTextContent("15-09-2026");

    rerender(<ComDateConverter time>2026-09-15T08:30:00</ComDateConverter>);
    expect(container).toHaveTextContent("08:30 / 15-09-2026");
  });

  it("parses other formats with formatData", () => {
    const { container } = render(
      <ComDateConverter formatData="DD/MM/YYYY">15/09/2026</ComDateConverter>,
    );
    expect(container).toHaveTextContent("15-09-2026");
  });

  it("shows a placeholder for missing or invalid dates", () => {
    const { container, rerender } = render(
      <ComDateConverter>not a date</ComDateConverter>,
    );
    expect(container).toHaveTextContent("Không có");

    rerender(<ComDateConverter>{undefined}</ComDateConverter>);
    expect(container).toHaveTextContent("Không có");
  });

  it("renders nothing when parsing throws", () => {
    // a symbol cannot be converted to text, so moment throws
    const value = Symbol("date") as unknown as string;
    const { container } = render(<ComDateConverter>{value}</ComDateConverter>);
    expect(container).toBeEmptyDOMElement();
  });
});
