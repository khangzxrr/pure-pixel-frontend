import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";
import PolicyContent from "./PolicyContent";

describe("PolicyContent", () => {
  it("renders the policy title, key sections and the contact email", () => {
    renderWithProviders(<PolicyContent />);

    expect(screen.getByText("ĐIỀU KHOẢN SỬ DỤNG")).toBeInTheDocument();
    expect(screen.getByText("Tạo tài khoản và xác thực")).toBeInTheDocument();
    expect(
      screen.getByText("Quy định về nội dung và tải ảnh lên"),
    ).toBeInTheDocument();
    expect(screen.getByText("Lợi nhuận bán ảnh")).toBeInTheDocument();

    const emailLink = screen.getByRole("link", {
      name: "purepixel.io.vn@gmail.com",
    });
    expect(emailLink).toHaveAttribute(
      "href",
      "mailto:purepixel.io.vn@gmail.com",
    );
  });
});
