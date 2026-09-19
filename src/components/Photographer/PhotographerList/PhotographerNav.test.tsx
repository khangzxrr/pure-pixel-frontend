import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UsePhotographerFilterStore from "../../../states/UsePhotographerFilterStore";
import PhotographerNav from "./PhotographerNav";

describe("PhotographerNav", () => {
  // reset before rendering: resetting after would re-render the still mounted nav outside act
  beforeEach(() => {
    UsePhotographerFilterStore.setState({ inputValue: "", searchResult: "" });
  });

  it("shows the active title and a default icon", () => {
    const { rerender } = render(<PhotographerNav activeTitle="Nhiếp ảnh gia" />);
    expect(screen.getByText("#")).toBeInTheDocument();
    expect(screen.getByText("Nhiếp ảnh gia")).toBeInTheDocument();

    rerender(<PhotographerNav activeIcon={<span>icon</span>} activeQuote="quote" />);
    expect(screen.getByText("icon")).toBeInTheDocument();
    expect(screen.queryByText("#")).toBeNull();
    expect(screen.queryByText("quote")).toBeNull();
  });

  it("searches with Enter or the search button", async () => {
    render(<PhotographerNav />);
    const input = screen.getByPlaceholderText("Tìm kiếm nhiếp ảnh gia...");

    await userEvent.type(input, "Lan");
    expect(UsePhotographerFilterStore.getState().inputValue).toBe("Lan");
    expect(UsePhotographerFilterStore.getState().searchResult).toBe("");

    await userEvent.type(input, "{Enter}");
    expect(UsePhotographerFilterStore.getState().searchResult).toBe("Lan");

    await userEvent.type(input, " Anh");
    await userEvent.click(screen.getByRole("button"));
    expect(UsePhotographerFilterStore.getState().searchResult).toBe("Lan Anh");
  });
});
