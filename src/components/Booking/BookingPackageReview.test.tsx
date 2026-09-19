import { render, screen } from "@testing-library/react";
import { buildUser } from "./bookingTestData";
import BookingPackageReviewList from "./BookingPackageReview";

describe("BookingPackageReviewList", () => {
  it("renders a card per review", () => {
    render(
      <BookingPackageReviewList
        photoshootPackage={{
          title: "Gói cưới",
          reviews: [
            { id: "r-1", star: 5, description: "Tuyệt vời", user: buildUser() },
            {
              id: "r-2",
              star: 3,
              description: "Tạm được",
              user: buildUser({ id: "customer-2", name: "Khách Hai" }),
            },
          ],
        }}
      />,
    );

    expect(
      screen.getByText("Đánh giá của khách hàng đã sử dụng dịch vụ"),
    ).toBeInTheDocument();
    expect(screen.getByText("Tuyệt vời")).toBeInTheDocument();
    expect(screen.getByText("Tạm được")).toBeInTheDocument();
    expect(screen.getAllByText("Gói cưới")).toHaveLength(2);
  });

  it("shows only the heading without reviews", () => {
    render(
      <BookingPackageReviewList
        photoshootPackage={{ title: "Gói cưới", reviews: [] }}
      />,
    );

    expect(
      screen.getByText("Đánh giá của khách hàng đã sử dụng dịch vụ"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Gói cưới")).toBeNull();
  });
});
