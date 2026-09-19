import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RefreshButton from "./RefreshButton";

describe("RefreshButton", () => {
  it("renders a titled button that calls onClick", async () => {
    const onClick = vi.fn();
    render(<RefreshButton onClick={onClick} />);

    const button = screen.getByTitle("Làm mới");
    await userEvent.click(button);

    expect(button.tagName).toBe("BUTTON");
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
