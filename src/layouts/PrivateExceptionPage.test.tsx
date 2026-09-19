import { screen } from "@testing-library/react";
import { renderWithProviders } from "../test/render";
import PrivateExceptionPage from "./PrivateExceptionPage";

describe("PrivateExceptionPage", () => {
  it("renders the forbidden message and a link back home", () => {
    renderWithProviders(<PrivateExceptionPage />);

    expect(
      screen.getByText("Rất tiếc, không có quyền xem ảnh này!"),
    ).toBeInTheDocument();
    expect(screen.getByText("Bạn có thể quay lại trang chính .")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Quay lại trang chính" }),
    ).toHaveAttribute("href", "/");
  });
});
