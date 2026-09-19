import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FilterModel from "./FilterModel";

vi.mock("./MyPhotoFilter", () => ({ default: () => <div>photo filter</div> }));

describe("FilterModel", () => {
  it("shows the photo filter", () => {
    render(<FilterModel onClose={vi.fn()} />);

    expect(screen.getByText("photo filter")).toBeInTheDocument();
  });

  it("closes after the transition delay when the close button is clicked", async () => {
    const onClose = vi.fn();
    render(<FilterModel onClose={onClose} />);

    await userEvent.click(screen.getByRole("button"));
    expect(onClose).not.toHaveBeenCalled();

    await vi.waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("closes after a click on the overlay but not on the modal content", async () => {
    const onClose = vi.fn();
    const { container } = render(<FilterModel onClose={onClose} />);

    await userEvent.click(screen.getByText("photo filter"));
    await new Promise((resolve) => setTimeout(resolve, 350));
    expect(onClose).not.toHaveBeenCalled();

    const overlay = container.firstElementChild as HTMLElement;
    await userEvent.click(overlay);

    await vi.waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});
