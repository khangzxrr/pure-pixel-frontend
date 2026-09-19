import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";
import Table from "./Table";

describe("Table", () => {
  it("renders the photographers ranking list inside its wrapper", () => {
    renderWithProviders(
      <Table
        dataTopSeller={[
          {
            id: "ptg-1",
            detail: {
              name: "Tran Minh",
              avatar: "https://example.com/avatar.jpg",
              mail: "tran@example.com",
              phonenumber: "0987654321",
              location: "Da Nang",
            },
            totalPhotoSale: 14,
          },
        ]}
      />,
      { route: "/", path: "*" },
    );

    expect(
      screen.getByText("Danh sách xếp hạng các nhiếp ảnh gia bán được nhiều ảnh"),
    ).toBeInTheDocument();
    expect(screen.getByText("Tran Minh")).toBeInTheDocument();
    expect(screen.getByText("tran@example.com")).toBeInTheDocument();
    expect(screen.getByText("14")).toBeInTheDocument();
  });
});
