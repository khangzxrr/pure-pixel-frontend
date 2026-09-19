import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/render";
import PhotoManagementModal from "./PhotoManagementModal";

const getDataMock = vi.hoisted(() => vi.fn());
const postDataMock = vi.hoisted(() => vi.fn());

vi.mock("../../apis/api", () => ({
  getData: (...args: unknown[]) => getDataMock(...args),
  postData: (...args: unknown[]) => postDataMock(...args),
}));

const sizes = [
  { width: 800, height: 600, preview: "/preview-1.jpg" },
  { width: 1600, height: 1200, preview: "/preview-2.jpg" },
];

describe("PhotoManagementModal", () => {
  beforeEach(() => {
    getDataMock.mockReset();
    postDataMock.mockReset();
    getDataMock.mockResolvedValue({ data: sizes });
  });

  const data = {
    title: "My photo",
    description: "A nice photo",
    exif: {},
  };

  it("loads the available resolutions and shows the photo info", async () => {
    renderWithProviders(
      <PhotoManagementModal close={vi.fn()} id="photo-1" data={data} />,
    );

    expect(await screen.findByText("600 X 800")).toBeInTheDocument();
    expect(screen.getByText("1200 X 1600")).toBeInTheDocument();
    expect(screen.getByText("My photo")).toBeInTheDocument();
    expect(screen.getByText("A nice photo")).toBeInTheDocument();
  });

  it("calls close when cancel is clicked", async () => {
    const close = vi.fn();
    renderWithProviders(
      <PhotoManagementModal close={close} id="photo-1" data={data} />,
    );

    await screen.findByText("600 X 800");
    await userEvent.click(screen.getByText("Hủy"));
    expect(close).toHaveBeenCalled();
  });

  it("shows a validation error when submitting without selecting a size", async () => {
    renderWithProviders(
      <PhotoManagementModal close={vi.fn()} id="photo-1" data={data} />,
    );

    await screen.findByText("600 X 800");
    await userEvent.click(screen.getByText("Lưu"));

    expect(
      await screen.findByText("Vui lòng chọn ít nhất một kích thước ảnh."),
    ).toBeInTheDocument();
    expect(postDataMock).not.toHaveBeenCalled();
  });

  it("shows a validation error when the selected size has no valid price", async () => {
    renderWithProviders(
      <PhotoManagementModal close={vi.fn()} id="photo-1" data={data} />,
    );

    await screen.findByText("600 X 800");
    const checkboxes = screen.getAllByRole("checkbox");
    await userEvent.click(checkboxes[0]);
    await userEvent.click(screen.getByText("Lưu"));

    expect(
      await screen.findByText(
        "Vui lòng nhập giá hợp lệ cho tất cả các kích thước được chọn, Giá tiền phải lớn hơn 1.000đ",
      ),
    ).toBeInTheDocument();
    expect(postDataMock).not.toHaveBeenCalled();
  });

  it("submits the selected size with its price and notifies success", async () => {
    const close = vi.fn();
    postDataMock.mockResolvedValue({});

    renderWithProviders(
      <PhotoManagementModal close={close} id="photo-1" data={data} />,
    );

    await screen.findByText("600 X 800");
    const checkboxes = screen.getAllByRole("checkbox");
    await userEvent.click(checkboxes[0]);

    const priceInputs = screen.getAllByPlaceholderText("Nhập giá tiền");
    fireEvent.change(priceInputs[0], { target: { value: "50000" } });

    await userEvent.click(screen.getByText("Lưu"));

    await waitFor(() => expect(postDataMock).toHaveBeenCalledTimes(1));
    expect(postDataMock).toHaveBeenCalledWith("/photo/photo-1/sell", {
      title: "My photo",
      description: "A nice photo",
      pricetags: [{ width: 800, height: 600, price: 50000 }],
    });

    await waitFor(() => expect(close).toHaveBeenCalled());
    expect(
      await screen.findByText("Đăng bán ảnh thành công"),
    ).toBeInTheDocument();
  });

  it("shows a banned-photo error message when the sell request fails", async () => {
    postDataMock.mockRejectedValue({
      data: { message: "PhotoBannedException" },
    });

    renderWithProviders(
      <PhotoManagementModal close={vi.fn()} id="photo-1" data={data} />,
    );

    await screen.findByText("600 X 800");
    const checkboxes = screen.getAllByRole("checkbox");
    await userEvent.click(checkboxes[0]);

    const priceInputs = screen.getAllByPlaceholderText("Nhập giá tiền");
    fireEvent.change(priceInputs[0], { target: { value: "50000" } });

    await userEvent.click(screen.getByText("Lưu"));

    expect(await screen.findByText("Ảnh đã bị cấm bán.")).toBeInTheDocument();
  });
});
