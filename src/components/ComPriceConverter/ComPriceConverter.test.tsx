import { render } from "@testing-library/react";
import ComPriceConverter from "./ComPriceConverter";

describe("ComPriceConverter", () => {
  it("formats numbers as VND", () => {
    const { container } = render(<ComPriceConverter>{150000}</ComPriceConverter>);
    expect(container.textContent).toMatch(/^150\.000\s₫$/);
  });

  it("renders nothing for other values", () => {
    const { container } = render(
      <ComPriceConverter>{"150000" as unknown as number}</ComPriceConverter>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
