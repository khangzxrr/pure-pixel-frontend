import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import ComModal from "./ComModal";

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button type="button" onClick={() => setCount(count + 1)}>
      Đếm {count}
    </button>
  );
}

describe("ComModal", () => {
  it("shows the title and content and closes through onClose", async () => {
    const onClose = vi.fn();
    render(
      <ComModal isOpen title="Tiêu đề" onClose={onClose} className="my-modal">
        <p>Nội dung</p>
      </ComModal>,
    );

    expect(screen.getByText("Tiêu đề")).toBeInTheDocument();
    expect(screen.getByText("Nội dung")).toBeInTheDocument();
    expect(document.querySelector(".my-modal")).toHaveStyle({ width: "500px" });

    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("uses the given width", () => {
    render(
      <ComModal isOpen width={800} className="wide">
        <p>Nội dung</p>
      </ComModal>,
    );
    expect(document.querySelector(".wide")).toHaveStyle({ width: "800px" });
  });

  it("resets the content after it was closed", async () => {
    const { rerender } = render(
      <ComModal isOpen>
        <Counter />
      </ComModal>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Đếm 0" }));
    expect(screen.getByRole("button", { name: "Đếm 1" })).toBeInTheDocument();

    rerender(
      <ComModal isOpen={false}>
        <Counter />
      </ComModal>,
    );
    rerender(
      <ComModal isOpen>
        <Counter />
      </ComModal>,
    );

    expect(screen.getByRole("button", { name: "Đếm 0" })).toBeInTheDocument();
  });
});
