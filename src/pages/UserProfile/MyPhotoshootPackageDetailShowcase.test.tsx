import { render, screen } from "@testing-library/react";
import MyPhotoshootPackageDetailShowcase from "./MyPhotoshootPackageDetailShowcase";

describe("MyPhotoshootPackageDetailShowcase", () => {
  it("shows every showcase photo", () => {
    const { container } = render(
      <MyPhotoshootPackageDetailShowcase
        showcases={[
          { id: "s1", photoUrl: "https://cdn.test/s1.jpg" },
          { id: "s2", photoUrl: "https://cdn.test/s2.jpg" },
        ]}
      />,
    );

    expect(screen.getByText("Bộ sưu tập")).toBeInTheDocument();
    expect(
      Array.from(container.querySelectorAll("img")).map((img) => img.src),
    ).toEqual(["https://cdn.test/s1.jpg", "https://cdn.test/s2.jpg"]);
  });

  it("shows an empty collection", () => {
    const { container } = render(
      <MyPhotoshootPackageDetailShowcase showcases={[]} />,
    );

    expect(screen.getByText("Bộ sưu tập")).toBeInTheDocument();
    expect(container.querySelectorAll("img")).toHaveLength(0);
  });
});
