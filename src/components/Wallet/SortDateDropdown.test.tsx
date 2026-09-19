import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SortDateDropdown from "./SortDateDropdown";
import { renderWithProviders } from "../../test/render";

describe("SortDateDropdown", () => {
  it("shows the current sort direction and lets the user switch it", async () => {
    const setOrderByCreatedAt = vi.fn();
    const { rerender } = renderWithProviders(
      <SortDateDropdown
        orderByCreatedAt="desc"
        setOrderByCreatedAt={setOrderByCreatedAt}
      />,
    );

    expect(screen.getByText("Từ mới đến cũ")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Từ mới đến cũ"));
    await userEvent.click(await screen.findByText("Sắp xếp theo cũ nhất"));
    expect(setOrderByCreatedAt).toHaveBeenCalledWith("asc");

    rerender(
      <SortDateDropdown
        orderByCreatedAt="asc"
        setOrderByCreatedAt={setOrderByCreatedAt}
      />,
    );

    expect(screen.getByText("Từ cũ đến mới")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Từ cũ đến mới"));
    await userEvent.click(await screen.findByText("Sắp xếp theo mới nhất"));
    expect(setOrderByCreatedAt).toHaveBeenLastCalledWith("desc");
  });
});
