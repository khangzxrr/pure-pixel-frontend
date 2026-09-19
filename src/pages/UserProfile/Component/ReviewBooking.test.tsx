import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createTestQueryClient, renderWithProviders } from "../../../test/render";
import { mockEndpoint } from "../../../test/mockEndpoint";
import type { Schema } from "../../../apis/types";
import ReviewBooking from "./ReviewBooking";

vi.mock("../../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const review = (
  overrides: Partial<Schema<"PhotoshootPackageReviewDto">> = {},
): Schema<"PhotoshootPackageReviewDto"> => ({
  id: "r1",
  star: 4,
  description: "Ảnh rất đẹp",
  user: {
    id: "c1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    roles: ["customer"],
    enabled: true,
    username: "khach",
    cover: "",
    location: "",
    mail: "",
    phonenumber: "",
    socialLinks: [],
    expertises: [],
    avatar: "https://cdn.test/khach.jpg",
    name: "Khách A",
    quote: "",
  },
  ...overrides,
});

const DESCRIPTION = "Mô tả chi tiết";

describe("ReviewBooking", () => {
  it("shows the customer's review to the photographer", () => {
    const { container } = renderWithProviders(
      <ReviewBooking bookingId="b1" userReview={review()} role="photographer" />,
    );

    expect(screen.getByText("Đánh giá của khách")).toBeInTheDocument();
    expect(screen.getByText("Khách A")).toBeInTheDocument();
    expect(screen.getByText("Ảnh rất đẹp")).toHaveAttribute(
      "placeholder",
      DESCRIPTION,
    );
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "https://cdn.test/khach.jpg",
    );
    expect(container.querySelector("span.mx-4")).toHaveTextContent("Tốt");
    expect(screen.queryByText("Gửi đánh giá")).toBeNull();
  });

  it("shows a review without stars to the customer", () => {
    const { container } = renderWithProviders(
      <ReviewBooking bookingId="b1" userReview={review({ star: 0 })} role="customer" />,
    );

    expect(screen.getByText(/^Đánh giá\s*$/)).toBeInTheDocument();
    expect(container.querySelector("span.mx-4")).toBeNull();
  });

  it.each([
    ["a photographer without a review", "photographer", ""],
    ["another role", "manager", undefined],
  ] as const)("renders nothing for %s", (_case, role, userReview) => {
    const { container } = renderWithProviders(
      <ReviewBooking bookingId="b1" userReview={userReview} role={role} />,
    );

    expect(container).toHaveTextContent("");
  });

  it("validates and sends the customer's review", async () => {
    const reviews = mockEndpoint("post", "*/customer/booking/:id/review", {});
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(["customer-booking-detail", "b1"], { id: "b1" });
    const { container } = renderWithProviders(
      <ReviewBooking bookingId="b1" role="customer" />,
      { queryClient },
    );

    const confirm = async () => {
      await userEvent.click(screen.getByRole("button", { name: "Gửi đánh giá" }));
      await userEvent.click(
        await screen.findByRole("button", { name: "Đánh giá" }),
      );
    };

    await confirm();
    expect(
      await screen.findByText("Vui lòng đánh giá bằng cách chọn số sao."),
    ).toBeInTheDocument();
    expect(screen.getByText("Vui lòng nhập mô tả chi tiết.")).toBeInTheDocument();
    expect(reviews).toHaveLength(0);

    await userEvent.click(screen.getAllByRole("radio")[3]);
    expect(
      screen.queryByText("Vui lòng đánh giá bằng cách chọn số sao."),
    ).toBeNull();
    expect(container.querySelector("span.mx-4")).toHaveTextContent("Tốt");

    // whitespace alone keeps the description error
    await userEvent.type(screen.getByPlaceholderText(DESCRIPTION), " ");
    expect(screen.getByText("Vui lòng nhập mô tả chi tiết.")).toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText(DESCRIPTION), "Rất hài lòng");
    expect(screen.queryByText("Vui lòng nhập mô tả chi tiết.")).toBeNull();

    await confirm();

    await waitFor(() => expect(reviews).toHaveLength(1));
    expect(reviews[0].path).toMatch(/\/customer\/booking\/b1\/review$/);
    expect(reviews[0].json).toEqual({ star: 4, description: " Rất hài lòng" });
    // the form resets and the cached booking reloads
    await waitFor(() =>
      expect(screen.getByPlaceholderText(DESCRIPTION)).toHaveValue(""),
    );
    expect(container.querySelector("span.mx-4")).toBeNull();
    expect(
      queryClient.getQueryState(["customer-booking-detail", "b1"])?.isInvalidated,
    ).toBe(true);
  });

  it("clears the star when the same star is chosen again", async () => {
    const { container } = renderWithProviders(
      <ReviewBooking bookingId="b1" role="customer" />,
    );

    await userEvent.click(screen.getAllByRole("radio")[1]);
    expect(container.querySelector("span.mx-4")).toHaveTextContent(
      "Chưa hài lòng",
    );

    await userEvent.click(screen.getAllByRole("radio")[1]);
    expect(container.querySelector("span.mx-4")).toBeNull();
  });

  it("logs a cancelled confirmation", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    renderWithProviders(<ReviewBooking bookingId="b1" role="customer" />);

    await userEvent.click(screen.getByRole("button", { name: "Gửi đánh giá" }));
    await userEvent.click(await screen.findByRole("button", { name: "Hủy" }));

    expect(log).toHaveBeenCalledWith("Cancelled");
    log.mockRestore();
  });
});
