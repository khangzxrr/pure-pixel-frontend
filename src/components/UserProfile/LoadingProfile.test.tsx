import { render, screen } from "@testing-library/react";
import LoadingProfile from "./LoadingProfile";

vi.mock("../UI/Skeleton/SkeletonImage", () => ({
  default: () => <div>skeleton image</div>,
}));

describe("LoadingProfile", () => {
  it("renders the profile placeholders", () => {
    const { container } = render(<LoadingProfile />);

    expect(screen.getByText("skeleton image")).toBeInTheDocument();
    expect(container.querySelectorAll(".ant-skeleton-avatar-circle")).toHaveLength(1);
    expect(container.querySelectorAll(".ant-skeleton-paragraph")).toHaveLength(2);
    expect(container.querySelectorAll(".ant-skeleton-button")).toHaveLength(4);
  });
});
