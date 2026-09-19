import UseMyPhotoFilter from "./UseMyPhotoFilter";

const initialState = UseMyPhotoFilter.getState();

describe("UseMyPhotoFilter", () => {
  beforeEach(() => {
    UseMyPhotoFilter.setState(initialState, true);
  });

  it("starts with the default filters", () => {
    const state = UseMyPhotoFilter.getState();
    expect(state.inputValue).toBe("");
    expect(state.searchResult).toBe("");
    expect(state.filterByPhotoDate).toEqual({ name: "Mới nhất", param: "desc" });
    expect(state.filterByUpVote).toEqual({ name: "", param: "" });
    expect(state.isWatermarkChecked).toBe(false);
    expect(state.isForSaleChecked).toBe(false);
    expect(state.isBanned).toBe(false);
  });

  it("stores every filter value", () => {
    const store = UseMyPhotoFilter.getState();
    store.setInputValue("sea");
    store.setSearchResult("sea result");
    store.setFilterByPhotoDate("Cũ nhất", "asc");
    store.setFilterByUpVote("Nhiều vote", "desc");
    store.setIsWatermarkChecked(true);
    store.setIsForSaleChecked(true);
    store.setIsBanned(true);
    const state = UseMyPhotoFilter.getState();
    expect(state.inputValue).toBe("sea");
    expect(state.searchResult).toBe("sea result");
    expect(state.filterByPhotoDate).toEqual({ name: "Cũ nhất", param: "asc" });
    expect(state.filterByUpVote).toEqual({ name: "Nhiều vote", param: "desc" });
    expect(state.isWatermarkChecked).toBe(true);
    expect(state.isForSaleChecked).toBe(true);
    expect(state.isBanned).toBe(true);
  });
});
