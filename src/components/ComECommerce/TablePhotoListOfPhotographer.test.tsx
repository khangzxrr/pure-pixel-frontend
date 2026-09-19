import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";
import { FormatDate } from "../../utils/FormatDate";
import TablePhotoListOfPhotographer from "./TablePhotoListOfPhotographer";

describe("TablePhotoListOfPhotographer", () => {
  it("renders the sold photo ranking rows with formatted dates and counts", () => {
    renderWithProviders(
      <TablePhotoListOfPhotographer
        data={[
          {
            detail: {
              title: "Golden Hour Portrait",
              signedUrl: {
                thumbnail: "https://example.com/photo.jpg",
              },
              createdAt: "2024-05-15T12:00:00.000Z",
            },
            soldCount: 9,
          },
        ]}
      />,
      { route: "/", path: "*" },
    );

    expect(
      screen.getByText("Danh sách xếp hạng các ảnh được mua nhiều nhất"),
    ).toBeInTheDocument();
    expect(screen.getByText("Golden Hour Portrait")).toBeInTheDocument();
    expect(screen.getByText(FormatDate("2024-05-15T12:00:00.000Z"))).toBeInTheDocument();
    expect(screen.getByText("9 ảnh")).toBeInTheDocument();
  });
});
