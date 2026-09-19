import { screen } from "@testing-library/react";
import UpgradeIntroduce from "./UpgradeIntroduce";
import { renderWithProviders } from "../../test/render";

describe("UpgradeIntroduce", () => {
  it("renders the upgrade introduction headline", () => {
    renderWithProviders(<UpgradeIntroduce />);

    expect(
      screen.getByText("NÂNG TẦM SỰ NGHIỆP NHIẾP ẢNH GIA CỦA BẠN"),
    ).toBeInTheDocument();
  });
});
