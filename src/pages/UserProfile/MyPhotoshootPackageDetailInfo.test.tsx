import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Schema } from "../../apis/types";
import type { PhotographerPhotoshootPackage } from "./MyPhotoshootPackageCard";
import MyPhotoshootPackageDetailInfo from "./MyPhotoshootPackageDetailInfo";

const owner: Schema<"UserDto"> = {
  id: "ptg-1",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  roles: ["photographer"],
  enabled: true,
  username: "ptg",
  cover: "",
  location: "",
  mail: "",
  phonenumber: "",
  socialLinks: [],
  expertises: [],
  avatar: "",
  name: "Nhiếp ảnh gia",
  quote: "",
};

const photoshootPackage = (
  overrides: Partial<PhotographerPhotoshootPackage> = {},
): PhotographerPhotoshootPackage => ({
  id: "pk1",
  title: "Gói cưới",
  subtitle: "Trọn gói ngày cưới",
  price: 1500000,
  thumbnail: "https://cdn.test/thumb.jpg",
  description: "Chụp cả ngày",
  status: "ENABLED",
  user: owner,
  reviews: [],
  showcases: [],
  createdAt: new Date(2026, 8, 13, 12).toISOString(),
  _count: { bookings: 3 },
  ...overrides,
});

describe("MyPhotoshootPackageDetailInfo", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 8, 15, 12));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the package and opens the editor for enabled packages", async () => {
    const setIsUpdatePhotoshootPackageModal = vi.fn();
    const setSelectedUpdatePhotoshootPackage = vi.fn();
    const parentClick = vi.fn();
    const { container } = render(
      <div onClick={parentClick}>
        <MyPhotoshootPackageDetailInfo
          photoshootPackage={photoshootPackage()}
          setIsUpdatePhotoshootPackageModal={setIsUpdatePhotoshootPackageModal}
          setSelectedUpdatePhotoshootPackage={
            setSelectedUpdatePhotoshootPackage
          }
        />
      </div>,
    );

    expect(screen.getByText("Gói cưới")).toBeInTheDocument();
    expect(screen.getByText("Trọn gói ngày cưới")).toBeInTheDocument();
    expect(screen.getByText("1.500.000đ")).toBeInTheDocument();
    expect(screen.getByText("Chụp cả ngày")).toBeInTheDocument();
    expect(screen.getByText("Tạo 2 ngày trước")).toBeInTheDocument();
    expect(screen.getByText("3 lượt thuê")).toBeInTheDocument();
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "https://cdn.test/thumb.jpg",
    );

    await userEvent.click(screen.getByRole("button", { name: /Chỉnh sửa/ }));

    expect(setIsUpdatePhotoshootPackageModal).toHaveBeenCalledWith(true);
    expect(setSelectedUpdatePhotoshootPackage).toHaveBeenCalledWith("pk1");
    expect(parentClick).not.toHaveBeenCalled();
  });

  it("marks disabled packages and hides the editor", () => {
    render(
      <MyPhotoshootPackageDetailInfo
        photoshootPackage={photoshootPackage({
          status: "DISABLED",
          _count: undefined,
        })}
        setIsUpdatePhotoshootPackageModal={vi.fn()}
        setSelectedUpdatePhotoshootPackage={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Gói dịch vụ này đã bị vô hiệu hóa"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByText("lượt thuê")).toBeInTheDocument();
  });
});
