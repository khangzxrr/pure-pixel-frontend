import { render, screen } from "@testing-library/react";
import BookingPackageShowCaseList from "./BookingPackageShowCase";

describe("BookingPackageShowCaseList", () => {
  it("shows every showcase photo", () => {
    const { container } = render(
      <BookingPackageShowCaseList
        photoshootPackage={{
          showcases: [
            { id: "s-1", photoUrl: "https://cdn.test/s-1.jpg" },
            { id: "s-2", photoUrl: "https://cdn.test/s-2.jpg" },
          ],
        }}
      />,
    );

    expect(screen.getByText("Bộ sưu tập")).toBeInTheDocument();
    expect(
      [...container.querySelectorAll("img")].map((img) => img.src),
    ).toEqual(["https://cdn.test/s-1.jpg", "https://cdn.test/s-2.jpg"]);
  });
});
