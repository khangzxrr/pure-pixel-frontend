import UseSellingPhotoStore from "./UseSellingPhotoStore";

const initialState = UseSellingPhotoStore.getState();

describe("UseSellingPhotoStore", () => {
  beforeEach(() => {
    UseSellingPhotoStore.setState(initialState, true);
  });

  it("starts on the first page of photos for sale", () => {
    const state = UseSellingPhotoStore.getState();
    expect(state.isForSellingPhoto).toBe(true);
    expect(state.namePhotographer).toBe("");
    expect(state.inputValue).toBe("");
    expect(state.searchResult).toBe("");
    expect(state.page).toBe(1);
    expect(state.searchByPhotoTitle).toBe("");
    expect(state.searchCategory).toEqual({
      name: "Tên ảnh",
      param: "photoName",
      quote: "ảnh",
      icon: "FaRegImage",
    });
  });

  it("stores every value", () => {
    const store = UseSellingPhotoStore.getState();
    store.setIsForSellingPhoto(false);
    store.setNamePhotographer("An");
    store.setSearchResult("sea result");
    store.setInputValue("sea");
    store.setPage(3);
    store.setSearchByPhotoTitle("Sea");
    store.setSearchCategory("Nhiếp ảnh gia", "photographer", "người", "FaUser");
    const state = UseSellingPhotoStore.getState();
    expect(state.isForSellingPhoto).toBe(false);
    expect(state.namePhotographer).toBe("An");
    expect(state.searchResult).toBe("sea result");
    expect(state.inputValue).toBe("sea");
    expect(state.page).toBe(3);
    expect(state.searchByPhotoTitle).toBe("Sea");
    expect(state.searchCategory).toEqual({
      name: "Nhiếp ảnh gia",
      param: "photographer",
      quote: "người",
      icon: "FaUser",
    });
  });
});
