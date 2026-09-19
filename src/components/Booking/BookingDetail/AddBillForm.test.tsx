import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { MockInstance } from "vitest";
import { renderWithProviders, createTestQueryClient } from "../../../test/render";
import { mockEndpoint } from "../../../test/mockEndpoint";
import { buildBillItem } from "../bookingTestData";
import AddBillForm from "./AddBillForm";

vi.mock("../../../services/Keycloak", () => ({
  default: {
    isLoggedIn: () => false,
    getToken: () => undefined,
    getUserId: () => "photographer-1",
    hasRole: () => false,
  },
}));

const titleInput = () => screen.getByPlaceholderText("Nhập dịch vụ thêm");
const priceInput = () => screen.getByPlaceholderText("Nhập giá");
const submit = () => userEvent.click(screen.getByRole("button", { name: "Thêm" }));

describe("AddBillForm", () => {
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
    renderWithProviders(<AddBillForm bookingId="booking-1" />);

    await submit();

    expect(await screen.findByText("Tiêu đề là bắt buộc")).toBeInTheDocument();
    expect(screen.getByText("Giá là bắt buộc")).toBeInTheDocument();
    expect(titleInput()).toHaveClass("border-red-500");
    expect(priceInput()).toHaveClass("border-red-500");
    expect(requests).toHaveLength(0);
  });

  it("limits the title length and the minimum price", async () => {
    renderWithProviders(<AddBillForm bookingId="booking-1" />);

    await userEvent.type(titleInput(), "a".repeat(51));
    await userEvent.type(priceInput(), "9000");
    await submit();

    expect(await screen.findByText("Tiêu đề quá dài")).toBeInTheDocument();
    expect(screen.getByText("Giá ít nhất là 10.000đ")).toBeInTheDocument();
  });

  it("adds a service to the bill and clears the form", async () => {
    const requests = mockEndpoint(
      "post",
      "*/photographer/booking/:id/bill-item",
      buildBillItem({ title: "Quay phim", price: 1500000 }),
    );
    const queryClient = createTestQueryClient();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    renderWithProviders(<AddBillForm bookingId="booking-1" />, { queryClient });

    await userEvent.type(titleInput(), "Quay phim");
    await userEvent.type(priceInput(), "1500000");
    expect(priceInput()).toHaveValue("1.500.000 ₫");
    await submit();

    await waitFor(() => expect(titleInput()).toHaveValue(""));
    expect(priceInput()).toHaveValue("");
    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({
      method: "POST",
      path: "/photographer/booking/booking-1/bill-item",
      json: {
        title: "Quay phim",
        description: "mô tả thêm",
        price: 1500000,
        type: "INCREASE",
      },
    });
    expect(invalidate).toHaveBeenCalledWith();
  });
});
