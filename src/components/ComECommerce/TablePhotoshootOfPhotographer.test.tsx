import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";
import { FormatDate } from "../../utils/FormatDate";
import TablePhotoshootOfPhotographer from "./TablePhotoshootOfPhotographer";

describe("TablePhotoshootOfPhotographer", () => {
  it("renders the photoshoot package ranking rows with formatted values", () => {
    renderWithProviders(
      <TablePhotoshootOfPhotographer
        data={[
          {
            id: "pkg-1",
            thumbnail: "https://example.com/pkg.jpg",
            title: "Engagement Session",
            photoshootRank: 1,
            createdAt: "2024-06-20T12:00:00.000Z",
            price: 3200000,
            _count: { bookings: 5 },
          },
        ]}
      />,
      { route: "/", path: "*" },
    );

    expect(screen.getByText("Danh sách xếp hạng các gói dịch vụ")).toBeInTheDocument();
    expect(screen.getByText("Engagement Session")).toBeInTheDocument();
    expect(screen.getByText(FormatDate("2024-06-20T12:00:00.000Z"))).toBeInTheDocument();
    expect(screen.getByText("3.200.000đ")).toBeInTheDocument();
    expect(screen.getByText("5 lượt đặt")).toBeInTheDocument();
  });
});
