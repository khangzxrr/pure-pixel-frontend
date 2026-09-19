import { render, screen } from "@testing-library/react";
import ECommerce from "./ECommerce";

// the layout loads the dashboards and charts itself
vi.mock("../../layouts/ECommerceLayout", () => ({
  default: () => <div>ecommerce layout</div>,
}));

describe("ECommerce", () => {
  it("renders the e-commerce layout", () => {
    const { container } = render(<ECommerce />);

    expect(screen.getByText("ecommerce layout")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("px-4", "pb-4");
  });
});
