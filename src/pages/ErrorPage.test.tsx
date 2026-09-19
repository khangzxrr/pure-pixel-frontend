import { screen } from "@testing-library/react";
import { renderWithProviders } from "../test/render";
import ErrorPage from "./ErrorPage";

describe("ErrorPage", () => {
  it("shows the 404 message and a link back home", () => {
    renderWithProviders(<ErrorPage />);

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Không tìm thấy trang!")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Quay lại trang chính" });
    expect(link).toHaveAttribute("href", "/");
  });
});
