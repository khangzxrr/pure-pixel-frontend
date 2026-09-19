import { render, screen } from "@testing-library/react";
import CreateBookingPackage from "./CreateBookingPackage";

vi.mock("./CreatePackageDetail", () => ({
  default: () => <div>package detail form</div>,
}));

describe("CreateBookingPackage", () => {
  it("wraps the package detail form", () => {
    const { container } = render(<CreateBookingPackage />);

    expect(screen.getByText("package detail form")).toBeInTheDocument();
    expect(container.firstChild).toHaveClass("flex flex-col gap-3 p-4");
  });
});
