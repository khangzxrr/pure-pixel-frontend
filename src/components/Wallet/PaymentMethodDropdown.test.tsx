import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PaymentMethodDropdown from "./PaymentMethodDropdown";
import { renderWithProviders } from "../../test/render";

describe("PaymentMethodDropdown", () => {
  it("shows the current payment method and updates the filter", async () => {
    const setPaymentMethods = vi.fn();
    const setPage = vi.fn();
    const { rerender } = renderWithProviders(
      <PaymentMethodDropdown
        paymentMethods=""
        setPaymentMethods={setPaymentMethods}
        setPage={setPage}
      />,
    );

    expect(screen.getByText("Tất cả")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Tất cả"));
    await userEvent.click(await screen.findByText("SEPAY"));
    expect(setPaymentMethods).toHaveBeenLastCalledWith("SEPAY");
    expect(setPage).toHaveBeenLastCalledWith(1);

    rerender(
      <PaymentMethodDropdown
        paymentMethods="SEPAY"
        setPaymentMethods={setPaymentMethods}
        setPage={setPage}
      />,
    );
    expect(screen.getAllByText("SEPAY")[0]).toBeInTheDocument();

    await userEvent.click(screen.getAllByText("SEPAY")[0]);
    await userEvent.click(await screen.findByText("Ví"));
    expect(setPaymentMethods).toHaveBeenLastCalledWith("WALLET");
    expect(setPage).toHaveBeenLastCalledWith(1);

    rerender(
      <PaymentMethodDropdown
        paymentMethods="WALLET"
        setPaymentMethods={setPaymentMethods}
        setPage={setPage}
      />,
    );
    expect(screen.getAllByText("Ví")[0]).toBeInTheDocument();
  });

  it("falls back to an unknown label for unsupported payment methods", () => {
    renderWithProviders(
      <PaymentMethodDropdown
        paymentMethods={"UNKNOWN" as never}
        setPaymentMethods={vi.fn()}
        setPage={vi.fn()}
      />,
    );

    expect(screen.getByText("Không xác định")).toBeInTheDocument();
  });
});
