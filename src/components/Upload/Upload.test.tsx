import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import UseSidebarStore from "../../states/UseSidebarStore";
import UseUploadStore from "../../states/UseUploadStore";
import Upload from "./Upload";

const keycloak = vi.hoisted(() => ({
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
}));

vi.mock("@react-keycloak/web", () => ({
  useKeycloak: () => ({ keycloak, initialized: true }),
}));

vi.mock("../../services/Keycloak", () => ({
  default: { getTokenParsed: () => ({ name: "Khang" }) },
}));

vi.mock("./UploadSide", () => ({ default: () => "upload side" }));

type LayoutProps = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  userData?: { name: string };
  activeIcon: ReactNode;
  activeTitle: string | null;
  sidebarContent: ReactNode;
  onLogout: () => void;
  onLogin: () => void;
  onRegister: () => void;
};

vi.mock("../../layouts/SidebarLayout", async () => {
  const { createElement } = await import("react");
  const button = (label: string, onClick: () => void) =>
    createElement("button", { type: "button", onClick }, label);
  return {
    default: (props: LayoutProps) =>
      createElement(
        "div",
        null,
        createElement("span", null, `open: ${String(props.isSidebarOpen)}`),
        createElement("span", null, `user: ${props.userData?.name}`),
        createElement("span", null, props.activeIcon),
        createElement("span", null, `title: ${props.activeTitle}`),
        createElement("div", null, props.sidebarContent),
        button("toggle", props.toggleSidebar),
        button("login", props.onLogin),
        button("logout", props.onLogout),
        button("register", props.onRegister),
      ),
  };
});

describe("Upload", () => {
  afterEach(() => {
    act(() => {
      UseSidebarStore.setState({ isSidebarOpen: false });
      UseUploadStore.setState({
        activeTitle: null,
        activeIcon: null,
        activeQuote: undefined,
      });
    });
  });

  it("passes the active upload page and sidebar state to the layout", async () => {
    UseUploadStore.setState({
      activeTitle: "Tải ảnh lên",
      activeIcon: "icon",
      activeQuote: "quote",
    });
    render(<Upload />);

    expect(screen.getByText("user: Khang")).toBeInTheDocument();
    expect(screen.getByText("title: Tải ảnh lên")).toBeInTheDocument();
    expect(screen.getByText("icon")).toBeInTheDocument();
    expect(screen.getByText("upload side")).toBeInTheDocument();

    expect(screen.getByText("open: false")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "toggle" }));
    expect(screen.getByText("open: true")).toBeInTheDocument();
  });

  it("wires the keycloak actions", async () => {
    render(<Upload />);

    await userEvent.click(screen.getByRole("button", { name: "login" }));
    await userEvent.click(screen.getByRole("button", { name: "logout" }));
    await userEvent.click(screen.getByRole("button", { name: "register" }));

    expect(keycloak.login).toHaveBeenCalledTimes(1);
    expect(keycloak.logout).toHaveBeenCalledTimes(1);
    expect(keycloak.register).toHaveBeenCalledTimes(1);
  });
});
