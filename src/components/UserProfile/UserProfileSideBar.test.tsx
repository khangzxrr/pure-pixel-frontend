import { render } from "@testing-library/react";
import Sidebar, { type SideItem } from "../Sidebar/Sidebar";
import UserProfileSideBar from "./UserProfileSideBar";

vi.mock("../Sidebar/Sidebar", () => ({
  default: vi.fn(() => <div>sidebar</div>),
}));

const items: SideItem<string>[] = [
  { id: "transaction", title: "Ví", link: "/profile/wallet" },
];

describe("UserProfileSideBar", () => {
  beforeEach(() => {
    vi.mocked(Sidebar).mockClear();
  });

  it("renders the sidebar with the user header named after the profile", () => {
    const handleClick = vi.fn();
    render(
      <UserProfileSideBar
        sideItems={items}
        trendItems={[]}
        handleClick={handleClick}
        activeItem="transaction"
        userData={{ name: "Minh" }}
      />,
    );

    expect(vi.mocked(Sidebar).mock.calls[0][0]).toEqual({
      sideItems: items,
      trendItems: [],
      handleClick,
      activeItem: "transaction",
      isImg: false,
      isUpload: false,
      isUser: true,
      nameUser: "Minh",
    });
  });

  it("leaves the name empty before the profile loads", () => {
    render(<UserProfileSideBar sideItems={items} handleClick={vi.fn()} />);

    expect(vi.mocked(Sidebar).mock.calls[0][0]).toMatchObject({
      isUser: true,
      nameUser: undefined,
    });
  });
});
