import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/render";
import UpdatePhotoInManager from "./UpdatePhotoInManager";

const updatePhotoMock = vi.hoisted(() => vi.fn());
const banPhotoMock = vi.hoisted(() => vi.fn());
const unBanPhotoMock = vi.hoisted(() => vi.fn());

vi.mock("../../apis/ManagerPhotoApi", () => ({
  default: {
    updatePhoto: (...args: unknown[]) => updatePhotoMock(...args),
    banPhoto: (...args: unknown[]) => banPhotoMock(...args),
    unBanPhoto: (...args: unknown[]) => unBanPhotoMock(...args),
  },
}));

const photo = {
  id: "photo-1",
  title: "My photo",
  description: "Nice",
  status: "PARSED",
  watermark: true,
  visibility: "PUBLIC",
  createdAt: "2024-01-01T00:00:00.000Z",
  photoType: "RAW",
  photographer: { name: "Photographer A", avatar: "/avatar.jpg" },
  signedUrl: { thumbnail: "/thumb.jpg" },
};

describe("UpdatePhotoInManager", () => {
  beforeEach(() => {
    updatePhotoMock.mockReset();
    banPhotoMock.mockReset();
    unBanPhotoMock.mockReset();
  });

  it("renders the photo's current details", () => {
    renderWithProviders(
      <UpdatePhotoInManager photo={photo} onClose={vi.fn()} loading={vi.fn()} />,
    );

    expect(screen.getByDisplayValue("My photo")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Nice")).toBeInTheDocument();
    expect(screen.getByText("Hoạt động")).toBeInTheDocument();
    expect(screen.getByText("Công khai")).toBeInTheDocument();
    expect(screen.getByText("Có")).toBeInTheDocument();
  });

  it("bans the photo and reports success", async () => {
    banPhotoMock.mockResolvedValue({});
    const loading = vi.fn();

    renderWithProviders(
      <UpdatePhotoInManager photo={photo} onClose={vi.fn()} loading={loading} />,
    );

    await userEvent.click(screen.getByText("Khóa ảnh"));

    await waitFor(() => expect(banPhotoMock).toHaveBeenCalledWith("photo-1"));
    expect(
      await screen.findByText("Đã khóa ảnh có id: photo-1", {}, { timeout: 3000 }),
    ).toBeInTheDocument();
    await waitFor(() => expect(loading).toHaveBeenCalled());
  });

  it("shows an error notification when banning fails", async () => {
    banPhotoMock.mockRejectedValue({
      response: { data: { message: "Đã có lỗi xảy ra" } },
    });

    renderWithProviders(
      <UpdatePhotoInManager photo={photo} onClose={vi.fn()} loading={vi.fn()} />,
    );

    await userEvent.click(screen.getByText("Khóa ảnh"));

    expect(
      await screen.findByText("Đã có lỗi xảy ra", {}, { timeout: 3000 }),
    ).toBeInTheDocument();
  });

  it("updates the title/description and notifies success", async () => {
    updatePhotoMock.mockResolvedValue({});
    const onClose = vi.fn();
    const loading = vi.fn();

    renderWithProviders(
      <UpdatePhotoInManager photo={photo} onClose={onClose} loading={loading} />,
    );

    const titleInput = screen.getByDisplayValue("My photo");
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "Updated title");

    await userEvent.click(screen.getByText("Lưu chỉnh sửa"));

    await waitFor(() =>
      expect(updatePhotoMock).toHaveBeenCalledWith("photo-1", {
        title: "Updated title",
        description: "Nice",
        visibility: "PUBLIC",
      }),
    );

    await new Promise((r) => setTimeout(r, 300));
    screen.debug(undefined, 30000);
    await waitFor(
      () =>
        expect(
          screen.getByText("Cập nhật ảnh thành công"),
        ).toBeInTheDocument(),
      { timeout: 5000 },
    );
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    await waitFor(() => expect(loading).toHaveBeenCalled());
  });

  it("shows an active-selling error and restores the previous values on update failure", async () => {
    updatePhotoMock.mockRejectedValue({
      response: { data: { message: "PhotoHasActiveSellingException" } },
    });

    renderWithProviders(
      <UpdatePhotoInManager photo={photo} onClose={vi.fn()} loading={vi.fn()} />,
    );

    const titleInput = screen.getByDisplayValue("My photo");
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "Updated title");

    await userEvent.click(screen.getByText("Lưu chỉnh sửa"));

    expect(
      await screen.findByText(
        "Ảnh đang bán không thể chỉnh sửa",
        {},
        { timeout: 3000 },
      ),
    ).toBeInTheDocument();
    expect(await screen.findByDisplayValue("My photo")).toBeInTheDocument();
  });
});
