import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import UseBlogStore from "../../states/UseBlogStore";
import UseSidebarStore from "../../states/UseSidebarStore";
import Blog from "./Blog";

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

type LayoutProps = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  userData: unknown;
  activeIcon: ReactNode;
  activeTitle: ReactNode;
  sidebarContent: ReactNode;
  onLogout: () => void;
  onLogin: () => void;
  onRegister: () => void;
};

const received = vi.hoisted(() => ({ props: null as unknown }));

vi.mock("../../layouts/SidebarLayout", () => ({
  default: (props: LayoutProps) => {
    received.props = props;
    return (
      <div>
        {props.sidebarContent}
        <button onClick={props.onLogin}>login</button>
        <button onClick={props.onRegister}>register</button>
        <button onClick={props.onLogout}>logout</button>
      </div>
    );
  },
}));

vi.mock("./BlogSide", () => ({ default: () => <div>blog side</div> }));

describe("Blog", () => {
  beforeEach(() => {
    UseSidebarStore.setState({ isSidebarOpen: true });
    UseBlogStore.setState({
      activeTitle: "Blog",
      activeIcon: "icon",
      activeQuote: "quote",
    });
  });

  it("lays out the blog side menu with the active item and user", () => {
    render(<Blog />);

    expect(screen.getByText("blog side")).toBeInTheDocument();
    expect(received.props).toMatchObject({
      isSidebarOpen: true,
      toggleSidebar: UseSidebarStore.getState().toggleSidebar,
      userData: token,
      activeIcon: "icon",
      activeTitle: "Blog",
    });
    // SidebarLayout never reads the quote, so it is not passed
    expect(received.props).not.toHaveProperty("activeQuote");
  });

  it("forwards login, register and logout to Keycloak", async () => {
    render(<Blog />);

    await userEvent.click(screen.getByRole("button", { name: "login" }));
    await userEvent.click(screen.getByRole("button", { name: "register" }));
    await userEvent.click(screen.getByRole("button", { name: "logout" }));

    expect(kc.login).toHaveBeenCalledTimes(1);
    expect(kc.register).toHaveBeenCalledTimes(1);
    expect(kc.logout).toHaveBeenCalledTimes(1);
  });
});
