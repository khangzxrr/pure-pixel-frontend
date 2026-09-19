import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";
import TopPhotoSelling from "./TopPhotoSelling";

vi.mock("./TopPhotoSellingTable", () => ({
  default: ({ photoBestSold }: { photoBestSold: unknown[] }) => (
    <div>table with {photoBestSold.length} photos</div>
  ),
}));

describe("TopPhotoSelling", () => {
  it("renders the heading and forwards the best selling photos to the table", () => {
    renderWithProviders(
      <TopPhotoSelling
        dataLastDays={{ data: { topSelledPhotos: [{}, {}] } }}
      />,
    );

    expect(
      screen.getByText("Những bức ảnh được bán nhiều nhất"),
    ).toBeInTheDocument();
    expect(screen.getByText("table with 2 photos")).toBeInTheDocument();
  });
});
