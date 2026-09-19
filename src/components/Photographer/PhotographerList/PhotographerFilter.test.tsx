import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UsePhotographerFilterStore from "../../../states/UsePhotographerFilterStore";
import PhotographerFilter from "./PhotographerFilter";

const choose = async (label: string) => {
  await userEvent.click(screen.getByRole("button", { name: /Lượt bình chọn/ }));
  await userEvent.click(await screen.findByText(label));
};

describe("PhotographerFilter", () => {
  beforeAll(() => {
    // headless ui reads animations when menus close; jsdom lacks the API and headless ui warns when it polyfills it
    Element.prototype.getAnimations = () => [];
  });

  // reset before rendering: resetting after would re-render the still mounted menu outside act
  beforeEach(() => {
    UsePhotographerFilterStore.setState({ filterByVote: { name: "", param: "" } });
  });

  it("sorts by vote count and clears the filter", async () => {
    render(<PhotographerFilter />);

    await userEvent.click(screen.getByRole("button", { name: /Lượt bình chọn/ }));
    const items = await screen.findAllByRole("menuitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "Tăng dần",
      "Giảm dần",
      "Xoá bộ lọc",
    ]);
    // the pointer cursor MenuItem used to append is on each item
    items.forEach((item) => expect(item).toHaveClass("hover:cursor-pointer"));
    await userEvent.click(items[1]);

    expect(UsePhotographerFilterStore.getState().filterByVote).toEqual({
      name: "Giảm dần",
      param: "desc",
    });
    expect(screen.getByRole("button", { name: /Giảm dần/ })).toBeInTheDocument();

    await choose("Tăng dần");
    expect(UsePhotographerFilterStore.getState().filterByVote.param).toBe("asc");

    await choose("Xoá bộ lọc");
    expect(UsePhotographerFilterStore.getState().filterByVote).toEqual({
      name: "",
      param: "",
    });
  });
});
