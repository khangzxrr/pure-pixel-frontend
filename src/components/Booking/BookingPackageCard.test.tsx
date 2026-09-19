import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/render";
import UsePhotographerFilterStore from "../../states/UsePhotographerFilterStore";
import UseUserOtherStore from "../../states/UseUserOtherStore";
import UseUserProfileStore from "../../states/UseUserProfileStore";
import { buildPackage } from "./bookingTestData";
import PhotoshootPackageCard from "./BookingPackageCard";

const navigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

describe("PhotoshootPackageCard", () => {
  afterEach(() => {
    navigate.mockReset();
    UsePhotographerFilterStore.setState({ namePhotographer: "" });
    UseUserOtherStore.setState({ nameUserOther: "", userOtherId: null });
    UseUserProfileStore.setState({ activeTitle: null });
  });

  it("shows the package with its price and booking count", () => {
    renderWithProviders(
      <PhotoshootPackageCard photoshootPackage={buildPackage()} />,
    );

    expect(screen.getByText("Gói cưới")).toBeInTheDocument();
    expect(screen.getByText("1.500.000đ")).toBeInTheDocument();
    expect(screen.getByText("Chụp cả ngày")).toBeInTheDocument();
    expect(screen.getByText("Nhiếp Ảnh Gia")).toBeInTheDocument();
    expect(screen.getByText("1.234 lượt thuê")).toBeInTheDocument();
  });

  it.each([
    ["no count", undefined],
    ["zero bookings", { bookings: 0 }],
  ])("says there are no bookings yet with %s", (_, count) => {
    renderWithProviders(
      <PhotoshootPackageCard
        photoshootPackage={buildPackage({ _count: count })}
      />,
    );

    expect(screen.getByText("Chưa có lượt thuê")).toBeInTheDocument();
  });

  it("opens the photographer profile from the name", async () => {
    UseUserProfileStore.setState({ activeTitle: "Gói chụp" });
    renderWithProviders(
      <PhotoshootPackageCard photoshootPackage={buildPackage()} />,
    );

    await userEvent.click(screen.getByText("Nhiếp Ảnh Gia"));

    expect(UsePhotographerFilterStore.getState().namePhotographer).toBe(
      "Nhiếp Ảnh Gia",
    );
    expect(UseUserOtherStore.getState()).toMatchObject({
      nameUserOther: "Nhiếp Ảnh Gia",
      userOtherId: "photographer-1",
    });
    expect(UseUserProfileStore.getState().activeTitle).toBeNull();
    expect(navigate).toHaveBeenCalledWith("/user/photographer-1");
  });

  it("calls onClick from the package details", async () => {
    const onClick = vi.fn();
    renderWithProviders(
      <PhotoshootPackageCard
        photoshootPackage={buildPackage()}
        onClick={onClick}
      />,
    );

    await userEvent.click(screen.getByText("Gói cưới"));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(navigate).not.toHaveBeenCalled();
  });
});
