import UseBlogStore from "./UseBlogStore";

const initialState = UseBlogStore.getState();

describe("UseBlogStore", () => {
  beforeEach(() => {
    UseBlogStore.setState(initialState, true);
  });

  it("starts with a closed sidebar and nothing selected", () => {
    const state = UseBlogStore.getState();
    expect(state.isSidebarOpen).toBe(false);
    expect(state.activeItem).toBeNull();
    expect(state.activeIcon).toBeNull();
    expect(state.activeTitle).toBeNull();
    expect(state.hoveredItem).toBeNull();
    expect(state.activeQuote).toBeUndefined();
  });

  it("toggleSidebar opens and closes the sidebar", () => {
    UseBlogStore.getState().toggleSidebar();
    expect(UseBlogStore.getState().isSidebarOpen).toBe(true);
    UseBlogStore.getState().toggleSidebar();
    expect(UseBlogStore.getState().isSidebarOpen).toBe(false);
  });

  it("setActiveItem stores id, title, icon and quote", () => {
    UseBlogStore.getState().setActiveItem("B1", "Blog", "#", "Quote");
    const state = UseBlogStore.getState();
    expect(state.activeItem).toBe("B1");
    expect(state.activeTitle).toBe("Blog");
    expect(state.activeIcon).toBe("#");
    expect(state.activeQuote).toBe("Quote");
  });

  it("setHoveredItem and clearHoveredItem update the hovered item", () => {
    UseBlogStore.getState().setHoveredItem("B2");
    expect(UseBlogStore.getState().hoveredItem).toBe("B2");
    UseBlogStore.getState().clearHoveredItem();
    expect(UseBlogStore.getState().hoveredItem).toBeNull();
  });
});
