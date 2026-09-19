import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { MockInstance } from "vitest";
import { renderWithProviders, createTestQueryClient } from "../../../test/render";
import { mockEndpoint } from "../../../test/mockEndpoint";
import { buildBillItem } from "../bookingTestData";
import DiscountForm from "./DiscountForm";

vi.mock("../../../services/Keycloak", () => ({
  default: {
    isLoggedIn: () => false,
    getToken: () => undefined,
    getUserId: () => "photographer-1",
    hasRole: () => false,
  },
}));

const titleInput = () => screen.getByPlaceholderText("Nhập dịch vụ giảm");
const priceInput = () => screen.getByPlaceholderText("Nhập giá");
const submit = () => userEvent.click(screen.getByRole("button", { name: "Giảm" }));

describe("DiscountForm", () => {
  let consoleError: MockInstance<typeof console.error>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    const unexpected = consoleError.mock.calls
      .map(([message]) => String(message))
      // the price field spreads react-hook-form's ref onto NumericFormat, which cannot hold one
      .filter((message) => !message.includes("Function components cannot be given refs"));
    consoleError.mockRestore();
    expect(unexpected).toEqual([]);
  });

  it("requires a title and a price", async () => {
    const requests = mockEndpoint("post", "*/photographer/booking/:id/bill-item", {});
    renderWithProviders(<DiscountForm bookingId="booking-1" />);

    await submit();

    expect(await screen.findByText("Tiêu đề là bắt buộc")).toBeInTheDocument();
    expect(screen.getByText("Giá là bắt buộc")).toBeInTheDocument();
    expect(titleInput()).toHaveClass("border-red-500");
    expect(priceInput()).toHaveClass("border-red-500");
    expect(requests).toHaveLength(0);
  });

  it("adds a discount to the bill and clears the form", async () => {
    const requests = mockEndpoint(
      "post",
      "*/photographer/booking/:id/bill-item",
      buildBillItem({ type: "DECREASE" }),
    );
    const queryClient = createTestQueryClient();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    renderWithProviders(<DiscountForm bookingId="booking-1" />, { queryClient });

    await userEvent.type(titleInput(), "Khách quen");
    await userEvent.type(priceInput(), "50000");
    expect(priceInput()).toHaveValue("50.000 ₫");
    await submit();

    await waitFor(() => expect(titleInput()).toHaveValue(""));
    expect(priceInput()).toHaveValue("");
    expect(requests[0]).toMatchObject({
      method: "POST",
      path: "/photographer/booking/booking-1/bill-item",
      json: {
        title: "Khách quen",
        description: "mô tả thêm",
        price: 50000,
        type: "DECREASE",
      },
    });
    expect(invalidate).toHaveBeenCalledWith();
  });
});
