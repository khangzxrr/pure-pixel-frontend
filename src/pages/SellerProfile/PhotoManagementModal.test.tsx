import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse } from "msw";
import { createTestQueryClient, renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import PhotoManagementModal from "./PhotoManagementModal";

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const photo = {
  id: "photo-1",
  title: "Golden Hour",
  description: "Warm light",
  exif: {
    Model: "A7 IV",
    Make: "Sony",
    LensModel: "24-70",
    ISO: 100,
    ExposureTime: "1/125",
    FNumber: 2.8,
    FocalLength: 35,
    XResolution: 300,
    YResolution: 300,
    ResolutionUnit: "dpi",
  },
  photoSellings: [
    {
      pricetags: [{ width: 300, height: 200, price: 2500 }],
    },
  ],
};

const sizes = [
  { width: 300, height: 200, preview: "https://cdn.test/preview-1.jpg" },
  { width: 600, height: 400, preview: "https://cdn.test/preview-2.jpg" },
];

const renderModal = (callData = vi.fn(), close = vi.fn()) => {
  const queryClient = createTestQueryClient();
  const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
  const view = renderWithProviders(
    <PhotoManagementModal
      close={close}
      id={photo.id}
      data={photo}
      callData={callData}
    />,
    { queryClient },
  );

  return { ...view, callData, close, invalidateQueries };
};

describe("PhotoManagementModal", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockEndpoint("get", "*/photo/:id/available-resolution", sizes);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads the available sizes, shows the current price and switches preview", async () => {
    renderModal();

    expect(await screen.findByDisplayValue("2.500")).toBeInTheDocument();
    const preview = screen.getByAltText("Preview");
    expect(preview).toHaveAttribute("src", "https://cdn.test/preview-1.jpg");

    await userEvent.click(screen.getByText("400 X 600"));

    expect(preview).toHaveAttribute("src", "https://cdn.test/preview-2.jpg");
    expect(screen.getByText("A7 IV")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Xem thêm" }));
    expect(screen.getByText("Thời gian phơi sáng")).toBeInTheDocument();
  });

  it("validates selected sizes and their prices before submitting", async () => {
    renderModal();
    await screen.findByDisplayValue("2.500");

    const [firstCheckbox, secondCheckbox] = screen.getAllByRole("checkbox");
    const [, secondPrice] = screen.getAllByPlaceholderText("Nhập giá tiền");

    await userEvent.click(firstCheckbox);
    await userEvent.click(screen.getByRole("button", { name: "Lưu" }));
    expect(
      await screen.findByText("Vui lòng chọn ít nhất một kích thước ảnh."),
    ).toBeInTheDocument();

    await userEvent.click(secondCheckbox);
    await userEvent.type(secondPrice, "500");
    await userEvent.click(screen.getByRole("button", { name: "Lưu" }));

    expect(
      await screen.findByText(
        "Vui lòng nhập giá hợp lệ cho tất cả các kích thước được chọn, Giá tiền phải lớn hơn 1.000đ",
      ),
    ).toBeInTheDocument();
  });

  it("submits the selected sizes and closes on success", async () => {
    const putRequests = mockEndpoint("put", "*/photo/:id/sell", {});
    const { callData, close, invalidateQueries } = renderModal();
    await screen.findByDisplayValue("2.500");

    const [, secondCheckbox] = screen.getAllByRole("checkbox");
    const [, secondPrice] = screen.getAllByPlaceholderText("Nhập giá tiền");

    await userEvent.click(secondCheckbox);
    await userEvent.type(secondPrice, "3500");
    await userEvent.click(screen.getByRole("button", { name: "Lưu" }));

    expect(await screen.findByText("Chỉnh sửa thành công")).toBeInTheDocument();
    expect(putRequests[0].path).toBe("/photo/photo-1/sell");
    expect(putRequests[0].json).toEqual({
      title: "Golden Hour",
      description: "Warm light",
      pricetags: [
        { width: 300, height: 200, price: 2500 },
        { width: 600, height: 400, price: 3500 },
      ],
    });
    expect(callData).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalledTimes(1);
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["my-photo"] });
  });

  it("shows an error notification when saving fails and re-enables the form", async () => {
    mockEndpoint("put", "*/photo/:id/sell", () =>
      HttpResponse.json({}, { status: 500 }),
    );
    renderModal();
    await screen.findByDisplayValue("2.500");

    await userEvent.click(screen.getByRole("button", { name: "Lưu" }));

    expect(await screen.findByText("Chỉnh sửa thất bại")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Lưu" })).toBeEnabled(),
    );
  });
});
