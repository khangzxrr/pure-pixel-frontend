import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@testing-library/react";
import UseMyPhotoFilter from "../../states/UseMyPhotoFilter";
import MyPhotoFilter from "./MyPhotoFilter";

describe("MyPhotoFilter", () => {
  beforeAll(() => {
    // jsdom has no Web Animations API; Headless UI warns when it has to polyfill it
    Element.prototype.getAnimations = () => [];
  });

  afterEach(() => {
    UseMyPhotoFilter.setState({
      filterByPhotoDate: { name: "Mới nhất", param: "desc" },
      filterByUpVote: { name: "", param: "" },
      isWatermarkChecked: false,
      isBanned: false,
    });
  });

  it("shows the current date and up-vote filter labels", () => {
    render(<MyPhotoFilter />);

    expect(screen.getByRole("button", { name: /Ngày đăng:/ })).toHaveTextContent(
      "Mới nhất",
    );
    expect(screen.getByText(/Lượt bình chọn:/)).toBeInTheDocument();
  });

  it("selects a date filter from the menu", async () => {
    render(<MyPhotoFilter />);

    await userEvent.click(screen.getByText(/Ngày đăng:/));
    await userEvent.click(await screen.findByText("Cũ nhất"));

    expect(UseMyPhotoFilter.getState().filterByPhotoDate).toEqual({
      name: "Cũ nhất",
      param: "asc",
    });
  });

  it("selects an up-vote filter and can clear it", async () => {
    render(<MyPhotoFilter />);

    await userEvent.click(screen.getByText(/Lượt bình chọn:/));
    await userEvent.click(await screen.findByText("Tăng dần"));
    expect(UseMyPhotoFilter.getState().filterByUpVote).toEqual({
      name: "Tăng dần",
      param: "asc",
    });

    await userEvent.click(screen.getByText(/Lượt bình chọn:/));
    await userEvent.click(await screen.findByText("Xoá bộ lọc"));
    expect(UseMyPhotoFilter.getState().filterByUpVote).toEqual({
      name: "",
      param: "",
    });
  });

  it("toggles the watermark filter", async () => {
    render(<MyPhotoFilter />);

    await userEvent.click(screen.getByLabelText("Bật/tắt ảnh watermark"));

    expect(UseMyPhotoFilter.getState().isWatermarkChecked).toBe(true);
  });

  it("toggles the banned filter", async () => {
    render(<MyPhotoFilter />);

    await userEvent.click(screen.getByLabelText("Bật/tắt ảnh bị cấm"));

    expect(UseMyPhotoFilter.getState().isBanned).toBe(true);
  });
});
