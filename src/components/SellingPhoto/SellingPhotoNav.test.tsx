import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../test/render";
import UseSellingPhotoStore from "../../states/UseSellingPhotoStore";
import SellingPhotoNav from "./SellingPhotoNav";

const resetStore = () =>
  UseSellingPhotoStore.setState({
    inputValue: "",
    searchResult: "",
    page: 1,
  });

describe("SellingPhotoNav", () => {
  beforeEach(resetStore);
  afterEach(resetStore);

  it("renders the active icon and title", () => {
    renderWithProviders(
      <SellingPhotoNav
        activeIcon="#"
        activeTitle="Ảnh bán"
        activeQuote="quote"
      />,
    );

    expect(screen.getByText("#")).toBeInTheDocument();
    expect(screen.getByText("Ảnh bán")).toBeInTheDocument();
  });

  it("searches when the search button is clicked, resetting to page 1", async () => {
    UseSellingPhotoStore.setState({ page: 5 });
    renderWithProviders(
      <SellingPhotoNav activeIcon="#" activeTitle="Ảnh bán" activeQuote="quote" />,
    );

    const input = screen.getByPlaceholderText(
      "Tìm kiếm ảnh theo tên ảnh hoặc tên thợ chụp...",
    );
    await userEvent.type(input, "beach");

    const searchButton = input.parentElement?.querySelector("button");
    expect(searchButton).not.toBeNull();
    await userEvent.click(searchButton as HTMLButtonElement);

    expect(UseSellingPhotoStore.getState().searchResult).toBe("beach");
    expect(UseSellingPhotoStore.getState().page).toBe(1);
  });

  it("searches when Enter is pressed in the input", async () => {
    renderWithProviders(
      <SellingPhotoNav activeIcon="#" activeTitle="Ảnh bán" activeQuote="quote" />,
    );

    const input = screen.getByPlaceholderText(
      "Tìm kiếm ảnh theo tên ảnh hoặc tên thợ chụp...",
    );
    await userEvent.type(input, "sunset{Enter}");

    expect(UseSellingPhotoStore.getState().searchResult).toBe("sunset");
  });
});
