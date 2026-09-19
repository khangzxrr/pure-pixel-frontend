import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";
import TopPhotoSellingTable from "./TopPhotoSellingTable";

const getPhotoByIdMock = vi.hoisted(() => vi.fn());

vi.mock("../../apis/PhotoApi", () => ({
  default: { getPhotoById: (...args: unknown[]) => getPhotoByIdMock(...args) },
}));

const photoBestSold = [
  {
    photo: { id: "row-1", photoId: "photo-1", createdAt: "2024-01-05T00:00:00.000Z" },
    totalSelled: 12,
  },
  {
    photo: { id: "row-2", photoId: "photo-2", createdAt: "2024-02-10T00:00:00.000Z" },
    totalSelled: 3,
  },
];

describe("TopPhotoSellingTable", () => {
  beforeEach(() => {
    getPhotoByIdMock.mockReset();
    getPhotoByIdMock.mockImplementation((id: string) =>
      Promise.resolve({
        id,
        signedUrl: { url: `/img/${id}.jpg` },
        photoType: "RAW",
      }),
    );
  });

  it("shows a loading state while the photo details are being fetched", () => {
    getPhotoByIdMock.mockReturnValue(new Promise(() => {}));

    renderWithProviders(<TopPhotoSellingTable photoBestSold={photoBestSold} />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows an error message when a photo fails to load", async () => {
    getPhotoByIdMock.mockRejectedValue(new Error("boom"));

    renderWithProviders(<TopPhotoSellingTable photoBestSold={photoBestSold} />);

    expect(await screen.findByText("Error: boom")).toBeInTheDocument();
  });

  it("renders a row per best-selling photo with its thumbnail and sale count", async () => {
    renderWithProviders(<TopPhotoSellingTable photoBestSold={photoBestSold} />);

    expect(getPhotoByIdMock).toHaveBeenCalledWith("photo-1");
    expect(getPhotoByIdMock).toHaveBeenCalledWith("photo-2");

    expect(await screen.findByText("row-1")).toBeInTheDocument();
    expect(screen.getByText("row-2")).toBeInTheDocument();
    expect(screen.getAllByAltText("Photo Thumbnail")).toHaveLength(2);
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
