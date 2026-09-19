import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/render";
import { buildPackage } from "./bookingTestData";
import PhotoshootPackageInfo from "./BookingPackageDetail";

const navigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

// the booking form has its own tests
vi.mock("../../pages/BookingPage/component/BookingModal", () => ({
  default: ({
    photoPackage,
    onClose,
  }: {
    photoPackage: { title: string };
    onClose: () => void;
  }) => (
    <div role="dialog">
      Đặt {photoPackage.title}
      <button onClick={onClose}>Đóng</button>
    </div>
  ),
}));

const chatIcon = (container: HTMLElement) =>
  container.querySelector(".lucide-message-circle-more");

describe("PhotoshootPackageInfo", () => {
  afterEach(() => navigate.mockReset());

  it("shows the package and asks a visitor to log in", async () => {
    const onLogin = vi.fn();
    const { container } = renderWithProviders(
      <PhotoshootPackageInfo photoshootPackage={buildPackage()} onLogin={onLogin} />,
    );

    expect(screen.getByText("Gói cưới")).toBeInTheDocument();
    expect(screen.getByText("1.500.000đ")).toBeInTheDocument();
    expect(screen.getByText("1.234 lượt thuê")).toBeInTheDocument();
    expect(screen.getByText("Chụp cả ngày")).toBeInTheDocument();
    expect(chatIcon(container)).not.toBeNull();

    await userEvent.click(
      screen.getByRole("button", { name: "Đăng nhập để đặt lịch" }),
    );
    expect(onLogin).toHaveBeenCalledTimes(1);
  });

  it("opens and closes the booking form for another photographer's package", async () => {
    renderWithProviders(
      <PhotoshootPackageInfo
        photoshootPackage={buildPackage({ _count: { bookings: 0 } })}
        userData={{ sub: "customer-1" }}
        onLogin={vi.fn()}
      />,
    );

    expect(screen.getByText("Chưa có lượt thuê")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).toBeNull();

    await userEvent.click(screen.getByRole("button", { name: "Đặt lịch" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Đặt Gói cưới");

    await userEvent.click(screen.getByRole("button", { name: "Đóng" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("hides booking and chat on the photographer's own package", () => {
    const { container } = renderWithProviders(
      <PhotoshootPackageInfo
        photoshootPackage={buildPackage()}
        userData={{ sub: "photographer-1" }}
        onLogin={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: "Đặt lịch" })).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Đăng nhập để đặt lịch" }),
    ).toBeNull();
    expect(chatIcon(container)).toBeNull();
  });

  it("opens the photographer profile", async () => {
    renderWithProviders(
      <PhotoshootPackageInfo photoshootPackage={buildPackage()} onLogin={vi.fn()} />,
    );

    await userEvent.click(screen.getByText("Nhiếp Ảnh Gia"));

    expect(navigate).toHaveBeenCalledWith("/user/photographer-1");
  });
});
