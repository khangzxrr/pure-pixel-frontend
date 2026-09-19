import UseCategoryStore from "./UseCategoryStore";

const initialState = UseCategoryStore.getState();

describe("UseCategoryStore", () => {
  beforeEach(() => {
    UseCategoryStore.setState(initialState, true);
  });

  it("starts with the default filters", () => {
    const state = UseCategoryStore.getState();
    expect(state.selectedPhotoCategory).toEqual({ name: "", param: "" });
    expect(state.filterByPhotoDate).toEqual({ name: "Mới nhất", param: "desc" });
    expect(state.filterByUpVote).toEqual({ name: "", param: "" });
    expect(state.filterByIsFollowed).toEqual({ name: "", param: "" });
    expect(state.isWatermarkChecked).toBe(false);
    expect(state.isForSaleChecked).toBe(false);
    expect(state.inputValue).toBe("");
    expect(state.searchResult).toBe("");
    expect(state.searchByPhotoTitle).toBe("");
    expect(state.searchCategory).toEqual({
      name: "Tên ảnh",
      param: "photoName",
      quote: "ảnh",
      icon: "FaRegImage",
    });
    expect(state.searchByTags).toEqual([""]);
  });

  it("setSearchByTags wraps the tag in a list", () => {
    UseCategoryStore.getState().setSearchByTags("sunset");
    expect(UseCategoryStore.getState().searchByTags).toEqual(["sunset"]);
  });

  it("selects a category by name only", () => {
    UseCategoryStore.getState().setSelectedPhotoCategory("Chân dung");
    expect(UseCategoryStore.getState().selectedPhotoCategory).toEqual({
      name: "Chân dung",
      param: undefined,
    });
  });

  it("stores the name/param filters", () => {
    const store = UseCategoryStore.getState();
    store.setSelectedPhotoCategory("Phong cảnh", "landscape");
    store.setFilterByPhotoDate("Cũ nhất", "asc");
    store.setFilterByUpVote("Nhiều vote", "desc");
    store.setFilterByIsFollowed("Đang theo dõi", "true");
    const state = UseCategoryStore.getState();
    expect(state.selectedPhotoCategory).toEqual({
      name: "Phong cảnh",
      param: "landscape",
    });
    expect(state.filterByPhotoDate).toEqual({ name: "Cũ nhất", param: "asc" });
    expect(state.filterByUpVote).toEqual({ name: "Nhiều vote", param: "desc" });
    expect(state.filterByIsFollowed).toEqual({
      name: "Đang theo dõi",
      param: "true",
    });
  });

  it("stores the checkboxes and search values", () => {
    const store = UseCategoryStore.getState();
    store.setIsWatermarkChecked(true);
    store.setIsForSaleChecked(true);
    store.setInputValue("sea");
    store.setSearchResult("sea result");
    store.setSearchByPhotoTitle("Sea");
    store.setSearchCategory("Thẻ", "tag", "thẻ", "FaTag");
    const state = UseCategoryStore.getState();
    expect(state.isWatermarkChecked).toBe(true);
    expect(state.isForSaleChecked).toBe(true);
    expect(state.inputValue).toBe("sea");
    expect(state.searchResult).toBe("sea result");
    expect(state.searchByPhotoTitle).toBe("Sea");
    expect(state.searchCategory).toEqual({
      name: "Thẻ",
      param: "tag",
      quote: "thẻ",
      icon: "FaTag",
    });
  });
});
