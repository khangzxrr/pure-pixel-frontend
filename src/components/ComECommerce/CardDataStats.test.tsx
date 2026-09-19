import { fireEvent, screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";
import CardDataStats from "./CardDataStats";

describe("CardDataStats", () => {
  it("renders the provided content, percent and click handler", () => {
    const onClick = vi.fn();
    const { container } = renderWithProviders(
      <CardDataStats
        icon={<span>ICON</span>}
        dataCount={42}
        label="Người dùng"
        percent={12}
        iconPercent={<span>UP</span>}
        colorPercent="text-green-500"
        onClick={onClick}
      />,
    );

    fireEvent.click(container.firstChild as HTMLElement);

    expect(screen.getByText("ICON")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("Người dùng")).toBeInTheDocument();
    expect(screen.getByText("UP")).toBeInTheDocument();
    expect(screen.getByText("12%")).toBeInTheDocument();
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(container.firstChild).toHaveClass("hover:scale-105");
    expect(container.querySelector(".text-green-500")).toHaveTextContent("12%");
  });

  it("omits percent text for a zero value and disables hover scaling when requested", () => {
    const { container } = renderWithProviders(
      <CardDataStats dataCount={0} label="Ảnh" percent={0} isScaleHover={false} />,
    );

    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("Ảnh")).toBeInTheDocument();
    expect(screen.queryByText("0%")).not.toBeInTheDocument();
    expect(container.firstChild).not.toHaveClass("hover:scale-105");
  });
});
