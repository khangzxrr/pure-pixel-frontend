import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { RefObject } from "react";
import { renderWithProviders } from "../../test/render";
import { server } from "../../test/server";
import { mockEndpoint } from "../../test/mockEndpoint";
import Wallet from "./Wallet";

type SideFormProps = {
  sideNavRef: RefObject<HTMLDivElement>;
  isNavVisible: boolean;
  balance?: number;
};

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

// the side forms and the transaction table load their own data; the page only positions them
vi.mock("../../components/Wallet/SideDepositForm", () => ({
  default: ({ sideNavRef, isNavVisible }: SideFormProps) => (
    <div ref={sideNavRef}>deposit form {isNavVisible ? "open" : "closed"}</div>
  ),
}));
vi.mock("../../components/Wallet/SideWithdrawalForm", () => ({
  default: ({ sideNavRef, isNavVisible, balance }: SideFormProps) => (
    <div ref={sideNavRef}>
      withdrawal form {isNavVisible ? "open" : "closed"} balance {balance}
    </div>
  ),
}));
vi.mock("../../components/Wallet/TableTransactilonList", () => ({
  default: () => <div>transactions</div>,
}));

describe("Wallet", () => {
  it("hides the balance until it is revealed", async () => {
    const requests = mockEndpoint("get", "*/wallet", { walletBalance: 150000 });

    renderWithProviders(<Wallet />);

    expect(
      await screen.findByText("withdrawal form closed balance 150000"),
    ).toBeInTheDocument();
    expect(screen.getByText("transactions")).toBeInTheDocument();
    expect(screen.getByText("******")).toBeInTheDocument();

    await userEvent.click(screen.getByText("******"));
    expect(screen.getByText(/150\.000\s₫/)).toBeInTheDocument();

    await userEvent.click(screen.getByText(/150\.000\s₫/));
    expect(screen.getByText("******")).toBeInTheDocument();
    expect(requests).toHaveLength(1);
  });

  it("shows a zero balance when the wallet cannot be loaded", async () => {
    let answered = false;
    server.use(
      http.get("*/wallet", () => {
        answered = true;
        return new HttpResponse(null, { status: 500 });
      }),
    );

    renderWithProviders(<Wallet />);

    await vi.waitFor(() => expect(answered).toBe(true));
    await userEvent.click(screen.getByText("******"));
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(
      screen.getByText("withdrawal form closed balance 0"),
    ).toBeInTheDocument();
  });

  it("opens the deposit form and closes it on an outside click", async () => {
    mockEndpoint("get", "*/wallet", { walletBalance: 1000 });
    const { container } = renderWithProviders(<Wallet />);

    await userEvent.click(screen.getByRole("button", { name: /Nạp tiền/ }));
    const form = screen.getByText("deposit form open");
    expect(container.querySelector(".opacity-60")).not.toBeNull();

    // clicks inside the form keep it open
    fireEvent.mouseDown(form);
    expect(screen.getByText("deposit form open")).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.getByText("deposit form closed")).toBeInTheDocument();
    expect(container.querySelector(".opacity-100")).not.toBeNull();
  });

  it("opens the withdrawal form and closes it on an outside click", async () => {
    mockEndpoint("get", "*/wallet", { walletBalance: 1000 });
    renderWithProviders(<Wallet />);
    await screen.findByText("withdrawal form closed balance 1000");

    await userEvent.click(screen.getByRole("button", { name: /Rút tiền/ }));
    const form = screen.getByText("withdrawal form open balance 1000");

    fireEvent.mouseDown(form);
    expect(
      screen.getByText("withdrawal form open balance 1000"),
    ).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(
      screen.getByText("withdrawal form closed balance 1000"),
    ).toBeInTheDocument();
  });

  it("stops listening for outside clicks when it unmounts", () => {
    mockEndpoint("get", "*/wallet", { walletBalance: 1000 });
    const removeListener = vi.spyOn(document, "removeEventListener");
    const { unmount } = renderWithProviders(<Wallet />);

    unmount();

    expect(
      removeListener.mock.calls.filter(([type]) => type === "mousedown"),
    ).toHaveLength(2);
    removeListener.mockRestore();
  });
});
