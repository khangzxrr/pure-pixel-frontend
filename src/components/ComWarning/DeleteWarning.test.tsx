import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteWarning from "./DeleteWarning";

describe("DeleteWarning", () => {
  it("asks for confirmation", () => {
    render(<DeleteWarning onClose={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/Bạn có chắc chắn muốn/)).toBeInTheDocument();
    expect(screen.getByText("XÓA")).toBeInTheDocument();
  });

  it("closes without deleting on cancel", async () => {
    const onClose = vi.fn();
    const onDelete = vi.fn();
    render(<DeleteWarning onClose={onClose} onDelete={onDelete} />);

    await userEvent.click(screen.getByRole("button", { name: "Hủy bỏ" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("deletes, then closes", async () => {
    const calls: string[] = [];
    render(
      <DeleteWarning
        onClose={() => calls.push("close")}
        onDelete={() => calls.push("delete")}
        loading={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Xóa" }));

    expect(calls).toEqual(["delete", "close"]);
  });
});
