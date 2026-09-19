import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";
import CardBalance from "./CardBalance";

describe("CardBalance", () => {
  it("renders formatted balance and withdrawal amounts", () => {
    renderWithProviders(<CardBalance balance={1234567} withdrawal={89000} />);

    expect(screen.getByText("1.234.567đ")).toBeInTheDocument();
    expect(screen.getByText("89.000đ")).toBeInTheDocument();
    expect(screen.getByText("Tổng số dư ví")).toBeInTheDocument();
    expect(screen.getByText("Tổng số tiền rút")).toBeInTheDocument();
  });
});
