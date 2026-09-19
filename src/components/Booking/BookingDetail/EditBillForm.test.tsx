import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { MockInstance } from "vitest";
import { renderWithProviders } from "../../../test/render";
import { mockEndpoint } from "../../../test/mockEndpoint";
import type { Schema } from "../../../apis/types";
import { buildBillItem } from "../bookingTestData";
import EditBillForm from "./EditBillForm";

vi.mock("../../../services/Keycloak", () => ({
  default: {
    isLoggedIn: () => false,
    getToken: () => undefined,
    getUserId: () => "photographer-1",
    hasRole: () => false,
  },
}));

const renderForm = (bill: Schema<"BookingBillItemDto"> = buildBillItem()) => {
  const setEditItemId = vi.fn();
  const onCancel = vi.fn();
  const view = renderWithProviders(
    <EditBillForm
      bill={bill}
      bookingId="booking-1"
      setEditItemId={setEditItemId}
      onCancel={onCancel}
    />,
  );
  return { ...view, setEditItemId, onCancel };
};

const titleInput = () => screen.getByPlaceholderText("Nhập dịch vụ thêm");
const priceInput = () => screen.getByPlaceholderText("Nhập giá");

describe("EditBillForm", () => {
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

  it("saves the edited service", async () => {
    const requests = mockEndpoint(
      "patch",
      "*/photographer/booking/:id/bill-item/:itemId",
      buildBillItem(),
    );
    const { container, setEditItemId } = renderForm();

    expect(screen.getByText("Sửa dịch vụ")).toHaveClass("text-green-500");
    expect(titleInput()).toHaveValue("Trang điểm");
    expect(priceInput()).toHaveValue("200.000 ₫");

    await userEvent.type(titleInput(), " cô dâu");
    await userEvent.click(container.querySelector(".lucide-check") as SVGElement);

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(requests[0]).toMatchObject({
      method: "PATCH",
      path: "/photographer/booking/booking-1/bill-item/bill-1",
      json: {
        title: "Trang điểm cô dâu",
        description: "Mô tả thêm",
        price: 200000,
        type: "INCREASE",
      },
    });
    expect(setEditItemId).toHaveBeenCalledWith(null);
  });

  it("edits a discount and can be cancelled", async () => {
    const { container, onCancel } = renderForm(
      buildBillItem({ type: "DECREASE", title: "Khách quen" }),
    );

    expect(screen.getByText("Sửa giảm giá")).toHaveClass("text-red-500");

    await userEvent.click(container.querySelector(".lucide-x") as SVGElement);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("does not save invalid values", async () => {
    const requests = mockEndpoint(
      "patch",
      "*/photographer/booking/:id/bill-item/:itemId",
      {},
    );
    const { container, setEditItemId } = renderForm();

    await userEvent.clear(titleInput());
    await userEvent.clear(priceInput());
    await userEvent.type(priceInput(), "5000");
    await userEvent.click(container.querySelector(".lucide-check") as SVGElement);

    expect(await screen.findByText("Tiêu đề là bắt buộc")).toBeInTheDocument();
    expect(screen.getByText("Giá ít nhất là 10.000đ")).toBeInTheDocument();
    expect(titleInput()).toHaveClass("border-red-500");
    expect(priceInput()).toHaveClass("border-red-500");
    expect(setEditItemId).not.toHaveBeenCalled();
    expect(requests).toHaveLength(0);
  });
});
