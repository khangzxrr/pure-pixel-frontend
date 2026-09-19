import { render, screen } from "@testing-library/react";
import { buildUser } from "./bookingTestData";
import BookingPackageReviewCard from "./BookingPackageReviewCard";

describe("BookingPackageReviewCard", () => {
  it("shows the stars, text and reviewer with the review age", () => {
    const { container } = render(
      <BookingPackageReviewCard
        photoshootPackage={{ title: "Gói cưới" }}
        review={{
          id: "review-1",
          star: 4,
          description: "Ảnh rất đẹp",
          user: buildUser({ avatar: "https://cdn.test/reviewer.jpg" }),
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        }}
      />,
    );

    expect(screen.getByText("Gói cưới")).toBeInTheDocument();
    expect(screen.getByText("Ảnh rất đẹp")).toBeInTheDocument();
    expect(screen.getByText("Khách Hàng")).toBeInTheDocument();
    expect(screen.getByText("2 ngày trước")).toBeInTheDocument();
    expect(container.querySelectorAll(".ant-rate-star-full")).toHaveLength(4);
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "https://cdn.test/reviewer.jpg",
    );
  });

  it("treats a review without a date as just written", () => {
    render(
      <BookingPackageReviewCard
        photoshootPackage={{ title: "Gói cưới" }}
        review={{
          id: "review-1",
          star: 5,
          description: "Tuyệt",
          user: buildUser(),
        }}
      />,
    );

    expect(screen.getByText("vừa xong")).toBeInTheDocument();
  });
});
