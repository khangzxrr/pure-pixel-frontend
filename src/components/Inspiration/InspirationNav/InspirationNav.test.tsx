import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test/render";
import { mockEndpoint } from "../../../test/mockEndpoint";
import UseCategoryStore from "../../../states/UseCategoryStore";
import InspirationNav from "./InspirationNav";

vi.mock("../../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const resetCategoryStore = () => {
  UseCategoryStore.setState({
    selectedPhotoCategory: { name: "", param: "" },
    filterByPhotoDate: { name: "Mới nhất", param: "desc" },
    filterByUpVote: { name: "", param: "" },
    isWatermarkChecked: false,
    isForSaleChecked: false,
    inputValue: "",
    searchResult: "",
    searchByPhotoTitle: "",
    searchCategory: {
      name: "Tên ảnh",
      param: "photoName",
      quote: "ảnh",
      icon: "FaRegImage",
    },
    searchByTags: [""],
    filterByIsFollowed: { name: "", param: "" },
  });
};

const renderNav = () => {
  mockEndpoint("get", "*/category", [
    { id: "c1", name: "Thiên nhiên" },
    { id: "c2", name: "Đường phố" },
  ]);

  return renderWithProviders(
    <InspirationNav activeIcon={<span>✨</span>} activeTitle="Cảm hứng hôm nay" />,
  );
};

describe("InspirationNav", () => {
  beforeEach(() => {
    resetCategoryStore();
  });

  it("searches by photo title and lets the visitor choose a category", async () => {
    renderNav();

    const input = screen.getByPlaceholderText(
      "Tìm kiếm ảnh theo tên ảnh hoặc tên thợ chụp ảnh...",
    );

    expect(screen.getByText("✨")).toBeInTheDocument();
    expect(screen.getByText("Cảm hứng hôm nay")).toBeInTheDocument();

    await userEvent.type(input, "hoàng hôn");
    await userEvent.click(input.parentElement?.querySelector("button") as HTMLButtonElement);

    expect(UseCategoryStore.getState().searchByPhotoTitle).toBe("hoàng hôn");
    expect(UseCategoryStore.getState().searchResult).toBe("");

    await userEvent.click(screen.getByRole("button", { name: /Danh mục/i }));
    await userEvent.click(await screen.findByText("Thiên nhiên"));

    expect(UseCategoryStore.getState().selectedPhotoCategory.name).toBe("Thiên nhiên");
  });

  it("searches by tags when Enter is pressed", async () => {
    UseCategoryStore.getState().setSearchCategory(
      "Thẻ",
      "photoTags",
      "thẻ",
      "MdNumbers",
    );

    renderNav();

    const input = screen.getByPlaceholderText(
      "Tìm kiếm ảnh theo tên ảnh hoặc tên thợ chụp ảnh...",
    );

    await userEvent.type(input, "macro{enter}");

    expect(UseCategoryStore.getState().searchByTags).toEqual(["macro"]);
    expect(UseCategoryStore.getState().searchByPhotoTitle).toBe("");
  });

  it("falls back to the default icon and stores generic search results", async () => {
    UseCategoryStore.getState().setSearchCategory(
      "Nhiếp ảnh gia",
      "photographerName",
      "nhiếp ảnh gia",
      "BsPersonBoundingBox",
    );
    mockEndpoint("get", "*/category", []);

    renderWithProviders(<InspirationNav />);

    const input = screen.getByPlaceholderText(
      "Tìm kiếm ảnh theo tên ảnh hoặc tên thợ chụp ảnh...",
    );

    expect(screen.getByText("#")).toBeInTheDocument();

    await userEvent.type(input, "Ansel Adams");
    await userEvent.click(input.parentElement?.querySelector("button") as HTMLButtonElement);

    expect(UseCategoryStore.getState().searchResult).toBe("Ansel Adams");
    expect(UseCategoryStore.getState().searchByPhotoTitle).toBe("");
  });
});
