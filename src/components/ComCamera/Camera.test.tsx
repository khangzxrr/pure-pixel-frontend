import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/render";
import UseCameraStore from "../../states/UseCameraStore";
import UseSidebarStore from "../../states/UseSidebarStore";
import Camera from "./Camera";

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

vi.mock("./CameraSide", () => ({ default: () => <div>camera side</div> }));

type SidebarLayoutProps = {
  isSidebarOpen: boolean;
  activeTitle?: string | null;
  sidebarContent: React.ReactNode;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
};

vi.mock("./../../layouts/SidebarLayout", () => ({
  default: ({
    isSidebarOpen,
    activeTitle,
    sidebarContent,
    onLogin,
    onRegister,
    onLogout,
  }: SidebarLayoutProps) => (
    <div>
      <p data-testid="open">{String(isSidebarOpen)}</p>
      <p data-testid="title">{String(activeTitle)}</p>
      {sidebarContent}
      <button onClick={onLogin}>login</button>
      <button onClick={onRegister}>register</button>
      <button onClick={onLogout}>logout</button>
    </div>
  ),
}));

describe("Camera", () => {
  afterEach(() => {
    login.mockReset();
    register.mockReset();
    logout.mockReset();
    UseCameraStore.setState({ activeTitle: null, activeIcon: null });
    UseSidebarStore.setState({ isSidebarOpen: false });
  });

  it("renders the camera sidebar with the store's active title", () => {
    UseCameraStore.setState({ activeTitle: "Máy ảnh" });

    renderWithProviders(<Camera />);

    expect(screen.getByTestId("title")).toHaveTextContent("Máy ảnh");
    expect(screen.getByText("camera side")).toBeInTheDocument();
  });

  it("wires login, register and logout to keycloak", async () => {
    renderWithProviders(<Camera />);

    await userEvent.click(screen.getByText("login"));
    expect(login).toHaveBeenCalled();

    await userEvent.click(screen.getByText("register"));
    expect(register).toHaveBeenCalled();

    await userEvent.click(screen.getByText("logout"));
    expect(logout).toHaveBeenCalled();
  });
});
