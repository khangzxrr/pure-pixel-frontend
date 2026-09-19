import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/render";
import PhotoBoughtPreviewComponent from "./PhotoBoughtPreviewComponent";

const navigateMock = vi.hoisted(() => vi.fn());
const downloadMock = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock("../../apis/PhotoExchange", () => ({
  default: {
    getPhotoBoughtDetailDownload: (...args: unknown[]) => downloadMock(...args),
  },
}));

const photoData = {
  photo: {
    title: "Sunset",
    description: "A beautiful sunset",
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    photographer: { id: "ph-1", name: "Photographer A", avatar: "/avatar.jpg" },
    exif: null,
  },
  photoBuys: [
    {
      id: "buy-1",
      previewUrl: "/preview1.jpg",
      photoSellHistory: { width: 800, height: 600, price: 20000, title: "Small" },
      userToUserTransaction: {
        createdAt: "2024-01-01T00:00:00.000Z",
        fromUserTransaction: { paymentMethod: "WALLET" },
      },
    },
    {
      id: "buy-2",
      previewUrl: "/preview2.jpg",
      photoSellHistory: { width: 1600, height: 1200, price: 50000, title: "Large" },
      userToUserTransaction: {
        createdAt: "2024-01-02T00:00:00.000Z",
        fromUserTransaction: { paymentMethod: "BANK" },
      },
    },
  ],
};

describe("PhotoBoughtPreviewComponent", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    downloadMock.mockReset();
  });

  it("renders the photo, photographer and default selected size details", () => {
    renderWithProviders(
      <PhotoBoughtPreviewComponent photoData={photoData} photoBoughtId="bought-1" />,
    );

    expect(screen.getByText("Sunset")).toBeInTheDocument();
    expect(screen.getByText("A beautiful sunset")).toBeInTheDocument();
    expect(screen.getByText("Photographer A")).toBeInTheDocument();
    expect(screen.getByText("1 giờ")).toBeInTheDocument();
    expect(screen.getByText("20.000đ")).toBeInTheDocument();
    expect(screen.getByText("WALLET")).toBeInTheDocument();
  });

  it("navigates to the photographer page when the avatar or name is clicked", async () => {
    renderWithProviders(
      <PhotoBoughtPreviewComponent photoData={photoData} photoBoughtId="bought-1" />,
    );

    await userEvent.click(screen.getByText("Photographer A"));
    expect(navigateMock).toHaveBeenCalledWith("/user/ph-1/selling");
  });

  it("switches to another size when clicked", async () => {
    renderWithProviders(
      <PhotoBoughtPreviewComponent photoData={photoData} photoBoughtId="bought-1" />,
    );

    await userEvent.click(screen.getByText("1600"));

    expect(screen.getByText("50.000đ")).toBeInTheDocument();
    expect(screen.getByText("BANK")).toBeInTheDocument();
  });

  it("downloads the selected photo size and shows a link the user can click", async () => {
    const blob = new Blob(["fake image"], { type: "image/jpeg" });
    downloadMock.mockResolvedValue(blob);
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    renderWithProviders(
      <PhotoBoughtPreviewComponent photoData={photoData} photoBoughtId="bought-1" />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Tải ảnh" }));

    await waitFor(() =>
      expect(downloadMock).toHaveBeenCalledWith("bought-1", "buy-1"),
    );
    await waitFor(() => expect(clickSpy).toHaveBeenCalledTimes(1));

    clickSpy.mockRestore();
  });
});
