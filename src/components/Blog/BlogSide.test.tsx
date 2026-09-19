import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UseBlogStore from "../../states/UseBlogStore";
import type { SideItem, SideItemClickHandler } from "../Sidebar/Sidebar";
import BlogSideItem from "./BlogSideItem";
import BlogSide from "./BlogSide";

const kc = vi.hoisted(() => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
}));

const token = vi.hoisted(() => ({ sub: "user-1", name: "Minh" }));

vi.mock("@react-keycloak/web", async () => {
  const { createKeycloakMock } = await import("../../test/keycloak");
  const keycloak = { ...createKeycloakMock(), ...kc };
  return { useKeycloak: () => ({ keycloak, initialized: true }) };
});

vi.mock("../../services/Keycloak", () => ({
  default: { getTokenParsed: () => token },
}));

type StubProps = {
  sideItems: SideItem<string>[];
  activeItem?: unknown;
  handleClick: SideItemClickHandler<string>;
  userData?: unknown;
  handleLogin?: () => void;
  handleRegister?: () => void;
  handleLogout?: () => void;
};

const received = vi.hoisted(() => ({ props: null as unknown }));

vi.mock("./BlogSidebar", () => ({
  default: (props: StubProps) => {
    received.props = props;
    return (
      <div>
        <button onClick={props.handleLogin}>login</button>
        <button onClick={props.handleRegister}>register</button>
        <button onClick={props.handleLogout}>logout</button>
        <button
          onClick={() => props.handleClick("B2", "Blog", "icon", "quote")}
        >
          select
        </button>
      </div>
    );
  },
}));

describe("BlogSide", () => {
  beforeEach(() => {
    UseBlogStore.setState({ activeItem: "B1", activeTitle: null });
    kc.login.mockClear();
    kc.register.mockClear();
    kc.logout.mockClear();
  });

  it("passes the blog items, active item and signed-in user", () => {
    render(<BlogSide />);

    expect(received.props).toMatchObject({
      sideItems: BlogSideItem,
      activeItem: "B1",
      userData: token,
    });
  });

  it("stores the selected item", async () => {
    render(<BlogSide />);

    await userEvent.click(screen.getByRole("button", { name: "select" }));

    expect(UseBlogStore.getState()).toMatchObject({
      activeItem: "B2",
      activeTitle: "Blog",
      activeIcon: "icon",
      activeQuote: "quote",
    });
  });

  it("forwards login, register and logout to Keycloak", async () => {
    render(<BlogSide />);

    await userEvent.click(screen.getByRole("button", { name: "login" }));
    await userEvent.click(screen.getByRole("button", { name: "register" }));
    await userEvent.click(screen.getByRole("button", { name: "logout" }));

    expect(kc.login).toHaveBeenCalledTimes(1);
    expect(kc.register).toHaveBeenCalledTimes(1);
    expect(kc.logout).toHaveBeenCalledTimes(1);
  });
});
