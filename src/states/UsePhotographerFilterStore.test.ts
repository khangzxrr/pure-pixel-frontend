import UsePhotographerFilterStore from "./UsePhotographerFilterStore";

const initialState = UsePhotographerFilterStore.getState();

describe("UsePhotographerFilterStore", () => {
  beforeEach(() => {
    UsePhotographerFilterStore.setState(initialState, true);
  });

  it("starts empty", () => {
    const state = UsePhotographerFilterStore.getState();
    expect(state.inputValue).toBe("");
    expect(state.searchResult).toBe("");
    expect(state.filterByVote).toEqual({ name: "", param: "" });
    expect(state.namePhotographer).toBe("");
  });

  it("stores the search, vote filter and photographer name", () => {
    const store = UsePhotographerFilterStore.getState();
    store.setInputValue("an");
    store.setSearchResult("an result");
    store.setFilterByVote("Nhiều vote", "desc");
    store.setNamePhotographer("An");
    const state = UsePhotographerFilterStore.getState();
    expect(state.inputValue).toBe("an");
    expect(state.searchResult).toBe("an result");
    expect(state.filterByVote).toEqual({ name: "Nhiều vote", param: "desc" });
    expect(state.namePhotographer).toBe("An");
  });
});
