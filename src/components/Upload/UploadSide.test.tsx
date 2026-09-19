import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import UseUploadStore from "../../states/UseUploadStore";
import type { SideItem, SideItemClickHandler } from "../Sidebar/Sidebar";
import UploadSide from "./UploadSide";

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

type StubProps = {
  sideItems: SideItem[];
  handleClick: SideItemClickHandler;
  activeItem?: unknown;
  userData?: { name: string };
  handleLogin: () => void;
  handleLogout: () => void;
  handleRegister: () => void;
};

vi.mock("./UploadSidebar", async () => {
  const { createElement } = await import("react");
  const button = (label: string, onClick: () => void): ReactNode =>
    createElement("button", { key: label, type: "button", onClick }, label);
  return {
    default: (props: StubProps) =>
      createElement(
        "div",
        null,
        createElement("span", null, `user: ${props.userData?.name}`),
        createElement("span", null, `active: ${String(props.activeItem)}`),
        props.sideItems.map((item) =>
          button(item.title, () =>
            props.handleClick(item.id, item.title, item.icon, item.quote),
          ),
        ),
        button("login", props.handleLogin),
        button("logout", props.handleLogout),
        button("register", props.handleRegister),
      ),
  };
});

describe("UploadSide", () => {
  afterEach(() => {
    act(() => {
      UseUploadStore.setState({
        activeItem: null,
        activeTitle: null,
        activeIcon: null,
        activeQuote: undefined,
      });
    });
  });

  it("passes the upload items and stores the clicked item", async () => {
    render(<UploadSide />);

    expect(screen.getByText("user: Khang")).toBeInTheDocument();
    expect(screen.getByText("active: null")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Đăng bán ảnh" }));

    expect(UseUploadStore.getState()).toMatchObject({
      activeItem: "U2",
      activeTitle: "Đăng bán ảnh",
      activeQuote: "",
    });
    expect(screen.getByText("active: U2")).toBeInTheDocument();
  });

  it("wires the keycloak actions", async () => {
    render(<UploadSide />);

    await userEvent.click(screen.getByRole("button", { name: "login" }));
    await userEvent.click(screen.getByRole("button", { name: "logout" }));
    await userEvent.click(screen.getByRole("button", { name: "register" }));

    expect(keycloak.login).toHaveBeenCalledTimes(1);
    expect(keycloak.logout).toHaveBeenCalledTimes(1);
    expect(keycloak.register).toHaveBeenCalledTimes(1);
  });
});
