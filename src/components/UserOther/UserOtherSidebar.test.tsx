import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/render";
import UserOtherSidebar from "./UserOtherSidebar";

const sidebarSpy = vi.fn(
  ({
    sideItems,
    handleClick,
    activeItem,
    isOtherProfile,
  }: {
    sideItems: Array<{ id: string; title: string }>;
    handleClick: (id: string, title: string) => void;
    activeItem: string;
    isOtherProfile: boolean;
  }) => (
    <div>
      <div>active item {activeItem}</div>
      <div>other profile {String(isOtherProfile)}</div>
      {sideItems.map((item) => (
        <button key={item.id} onClick={() => handleClick(item.id, item.title)}>
          {item.title}
        </button>
      ))}
    </div>
  ),
);

vi.mock("../Sidebar/Sidebar", () => ({
  default: (props: Parameters<typeof sidebarSpy>[0]) => sidebarSpy(props),
}));

describe("UserOtherSidebar", () => {
  it("passes the sidebar props through and always enables other-profile mode", async () => {
    const handleClick = vi.fn();

    renderWithProviders(
      <UserOtherSidebar
        sideItems={[{ id: "photos", title: "Hồ sơ", link: "/user/u1/photos" }]}
        trendItems={["unused"]}
        activeItem="photos"
        handleClick={handleClick}
      />,
    );

    expect(screen.getByText("active item photos")).toBeInTheDocument();
    expect(screen.getByText("other profile true")).toBeInTheDocument();
    expect(sidebarSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        activeItem: "photos",
        isOtherProfile: true,
      }),
    );

    await userEvent.click(screen.getByRole("button", { name: "Hồ sơ" }));
    expect(handleClick).toHaveBeenCalledWith("photos", "Hồ sơ");
  });
});
