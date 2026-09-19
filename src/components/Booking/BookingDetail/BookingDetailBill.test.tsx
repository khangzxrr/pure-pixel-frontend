import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { MockInstance } from "vitest";
import { renderWithProviders } from "../../../test/render";
import { mockEndpoint } from "../../../test/mockEndpoint";
import { buildBillItem, buildBooking } from "../bookingTestData";
import BookingDetailBill from "./BookingDetailBill";

vi.mock("../../../services/Keycloak", () => ({
  default: {
    isLoggedIn: () => false,
    getToken: () => undefined,
    getUserId: () => "photographer-1",
    hasRole: () => false,
  },
}));

// the three forms have their own tests
vi.mock("./AddBillForm", () => ({
  default: ({ bookingId }: { bookingId: string }) => (
    <div>add form {bookingId}</div>
  ),
}));

vi.mock("./DiscountForm", () => ({
  default: ({ bookingId }: { bookingId: string }) => (
    <div>discount form {bookingId}</div>
  ),
}));

vi.mock("./EditBillForm", () => ({
  default: ({
    bill,
    bookingId,
    onCancel,
    setEditItemId,
  }: {
    bill: { title: string };
    bookingId: string;
    onCancel: () => void;
    setEditItemId: (id: string | null) => void;
  }) => (
    <div>
      editing {bill.title} of {bookingId}
      <button onClick={onCancel}>hủy sửa</button>
      <button onClick={() => setEditItemId(null)}>lưu sửa</button>
    </div>
  ),
}));

const booking = buildBooking({
  status: "ACCEPTED",
  billItems: [
    buildBillItem(),
    buildBillItem({
      id: "bill-2",
      title: "Giảm giá khách quen",
      price: 50000,
      type: "DECREASE",
    }),
  ],
  totalBillItem: 1650000,
});

const mockBillItems = () =>
  mockEndpoint("get", "*/photographer/booking/:id/bill-item", {
    objects: booking.billItems,
    totalPage: 1,
    totalRecord: 2,
    totalAmount: 1650000,
  });

describe("BookingDetailBill", () => {
  let consoleError: MockInstance<typeof console.error>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    const unexpected = consoleError.mock.calls
      .map(([message]) => String(message))
      // antd's Tooltip still calls findDOMNode for icons that do not forward refs
      .filter((message) => !message.includes("findDOMNode is deprecated"));
    expect(unexpected).toEqual([]);
    consoleError.mockRestore();
  });

  it("lists the bill read-only and fetches the bill items", async () => {
    const requests = mockBillItems();
    const { container } = renderWithProviders(
      <BookingDetailBill bookingDetail={booking} enableUpdate={false} />,
    );

    expect(screen.getByText("Trang điểm")).toBeInTheDocument();
    expect(screen.getByText("+200.000đ")).toHaveClass("text-green-500");
    expect(screen.getByText("-50.000đ")).toHaveClass("text-red-500");
    expect(screen.getByText("1.650.000đ")).toBeInTheDocument();
    expect(container.querySelector(".lucide-pencil")).toBeNull();
    expect(screen.queryByText(/add form/)).toBeNull();
    expect(screen.queryByText(/discount form/)).toBeNull();

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(requests[0]).toMatchObject({
      path: "/photographer/booking/booking-1/bill-item",
      query: { limit: "10", page: "0" },
    });
  });

  it("edits one item at a time", async () => {
    mockBillItems();
    const { container } = renderWithProviders(
      <BookingDetailBill bookingDetail={booking} enableUpdate />,
    );

    expect(screen.getByText("add form booking-1")).toBeInTheDocument();
    expect(screen.getByText("discount form booking-1")).toBeInTheDocument();

    const pencils = () => container.querySelectorAll(".lucide-pencil");
    await userEvent.click(pencils()[0]);
    expect(
      screen.getByText("editing Trang điểm of booking-1"),
    ).toBeInTheDocument();
    expect(pencils()).toHaveLength(1);

    await userEvent.click(screen.getByRole("button", { name: "hủy sửa" }));
    expect(screen.queryByText(/^editing/)).toBeNull();

    await userEvent.click(pencils()[1]);
    expect(
      screen.getByText("editing Giảm giá khách quen of booking-1"),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "lưu sửa" }));
    expect(screen.queryByText(/^editing/)).toBeNull();
  });

  it("deletes an item", async () => {
    mockBillItems();
    const requests = mockEndpoint(
      "delete",
      "*/photographer/booking/:id/bill-item/:itemId",
      {},
    );
    const { container } = renderWithProviders(
      <BookingDetailBill bookingDetail={booking} enableUpdate />,
    );

    await userEvent.click(container.querySelectorAll(".lucide-trash2")[1]);

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(requests[0]).toMatchObject({
      method: "DELETE",
      path: "/photographer/booking/booking-1/bill-item/bill-2",
    });
  });
});
