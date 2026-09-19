import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ExifList from "./ExifList";

const rows = () =>
  within(screen.getByRole("list"))
    .getAllByRole("listitem")
    .map((item) => item.textContent);

describe("ExifList", () => {
  it("says there is no data without exif", () => {
    const { rerender } = render(<ExifList />);
    expect(screen.getByText("Không có dữ liệu của tấm ảnh")).toBeInTheDocument();

    rerender(<ExifList exifData={null} />);
    expect(screen.getByText("Không có dữ liệu của tấm ảnh")).toBeInTheDocument();
  });

  it("shows the first three tags and expands to every known tag", async () => {
    render(
      <ExifList
        exifData={{
          Model: "Z6",
          Make: "Nikon",
          LensModel: "50mm f/1.8",
          Orientation: "Horizontal (normal)",
          ISO: 100,
          ExposureTime: 0.005,
          FNumber: 1.8,
          FocalLength: 50,
          XResolution: 300,
          YResolution: 300,
          ResolutionUnit: "inch",
          Copyright: "PurePixel",
        }}
      />,
    );

    expect(rows()).toEqual([
      "Mẫu máyZ6",
      "Hãng sản xuấtNikon",
      "Loại ống kính50mm f/1.8",
    ]);

    await userEvent.click(screen.getByRole("button", { name: "Xem thêm" }));

    expect(rows()).toEqual([
      "Mẫu máyZ6",
      "Hãng sản xuấtNikon",
      "Loại ống kính50mm f/1.8",
      "Hướng chụpHorizontal (normal)",
      "ISO100",
      "Thời gian phơi sáng0.005s",
      "Khẩu độf/1.8",
      "Tiêu cự50mm",
      "Độ phân giải X300 inch",
      "Độ phân giải Y300 inch",
      "Bản quyềnPurePixel",
    ]);

    await userEvent.click(screen.getByRole("button", { name: "Thu gọn" }));
    expect(rows()).toHaveLength(3);
  });

  it("skips missing tags and prints other values as text", async () => {
    render(
      <ExifList
        cameraId="camera-1"
        exifData={{ Model: "X100V", Make: true, Copyright: ["a", "b"] }}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Xem thêm" }));

    expect(rows()).toEqual([
      "Mẫu máyX100V",
      "Hãng sản xuất",
      "Thời gian phơi sángundefineds",
      "Khẩu độf/undefined",
      "Tiêu cựundefinedmm",
      "Độ phân giải Xundefined undefined",
      "Độ phân giải Yundefined undefined",
      "Bản quyềna,b",
    ]);
  });
});
