import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginWarningModal from "./LoginWarningModal";

const keycloak = vi.hoisted(() => ({ login: vi.fn() }));

vi.mock("@react-keycloak/web", () => ({
  useKeycloak: () => ({ keycloak, initialized: true }),
}));

describe("LoginWarningModal", () => {
  it("asks to log in and starts the login", async () => {
    const onCloseLogin = vi.fn();
    render(<LoginWarningModal onCloseLogin={onCloseLogin} />);

    expect(
      screen.getByText(/Bạn cần đăng nhập tài khoản/),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));

    expect(keycloak.login).toHaveBeenCalledTimes(1);
    expect(onCloseLogin).not.toHaveBeenCalled();
  });
});
