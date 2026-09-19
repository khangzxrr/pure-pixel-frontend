import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/render";
import UseCameraStore from "../../states/UseCameraStore";
import CameraSide from "./CameraSide";

const login = vi.fn();
const register = vi.fn();
const logout = vi.fn();

vi.mock("@react-keycloak/web", () => ({
  useKeycloak: () => ({
    keycloak: { login, register, logout },
    initialized: true,
  }),
}));

vi.mock("../../services/Keycloak", () => ({
  default: { getTokenParsed: () => ({ sub: "u1" }) },
}));

type CameraSidebarProps = {
  sideItems: { id: string; title: string; icon?: unknown; link: string }[];
  handleClick: (id: string, title: string, icon: unknown, quote: unknown) => void;
  handleLogout: () => void;
  handleLogin: () => void;
  handleRegister: () => void;
};

vi.mock("./CameraSidebar", () => ({
  default: ({
    sideItems,
    handleClick,
    handleLogout,
    handleLogin,
    handleRegister,
  }: CameraSidebarProps) => (
    <div>
      <button onClick={() => handleClick(sideItems[0].id, sideItems[0].title, null, undefined)}>
        select
      </button>
      <button onClick={handleLogin}>login</button>
      <button onClick={handleRegister}>register</button>
      <button onClick={handleLogout}>logout</button>
    </div>
  ),
}));

describe("CameraSide", () => {
  afterEach(() => {
    login.mockReset();
    register.mockReset();
    logout.mockReset();
    UseCameraStore.setState({ activeItem: null, activeTitle: null });
  });

  it("sets the active camera item in the store on selection", async () => {
    renderWithProviders(<CameraSide />);

    await userEvent.click(screen.getByText("select"));

    expect(UseCameraStore.getState().activeItem).toBe("C1");
    expect(UseCameraStore.getState().activeTitle).toBe("Danh sách máy ảnh");
  });

  it("wires login, register and logout to keycloak", async () => {
    renderWithProviders(<CameraSide />);

    await userEvent.click(screen.getByText("login"));
    expect(login).toHaveBeenCalled();

    await userEvent.click(screen.getByText("register"));
    expect(register).toHaveBeenCalled();

    await userEvent.click(screen.getByText("logout"));
    expect(logout).toHaveBeenCalledWith({
      redirectUri: "https://purepixel.io.vn",
    });
  });
});
