import UseUserProfileStore from "./UseUserProfileStore";

const initialState = UseUserProfileStore.getState();

describe("UseUserProfileStore", () => {
  beforeEach(() => {
    UseUserProfileStore.setState(initialState, true);
  });

  it("starts with a closed sidebar and nothing selected", () => {
    const state = UseUserProfileStore.getState();
    expect(state.isSidebarOpen).toBe(false);
    expect(state.activeItem).toBeNull();
    expect(state.activeIcon).toBeNull();
    expect(state.activeTitle).toBeNull();
    expect(state.hoveredItem).toBeNull();
  });

  it("toggleSidebar opens and closes the sidebar", () => {
    UseUserProfileStore.getState().toggleSidebar();
    expect(UseUserProfileStore.getState().isSidebarOpen).toBe(true);
    UseUserProfileStore.getState().toggleSidebar();
    expect(UseUserProfileStore.getState().isSidebarOpen).toBe(false);
  });

  it("setActiveItem stores id, title, icon and quote", () => {
    UseUserProfileStore.getState().setActiveItem("P1", "Hồ sơ", "#", "Q");
    const state = UseUserProfileStore.getState();
    expect(state.activeItem).toBe("P1");
    expect(state.activeTitle).toBe("Hồ sơ");
    expect(state.activeIcon).toBe("#");
    expect(state.activeQuote).toBe("Q");
  });

  it("setActiveTitle changes only the title", () => {
    UseUserProfileStore.getState().setActiveItem("P1", "Hồ sơ", "#", "Q");
    UseUserProfileStore.getState().setActiveTitle("Ảnh của tôi");
    const state = UseUserProfileStore.getState();
    expect(state.activeTitle).toBe("Ảnh của tôi");
    expect(state.activeItem).toBe("P1");
  });

  it("setHoveredItem and clearHoveredItem update the hovered item", () => {
    UseUserProfileStore.getState().setHoveredItem("P2");
    expect(UseUserProfileStore.getState().hoveredItem).toBe("P2");
    UseUserProfileStore.getState().clearHoveredItem();
    expect(UseUserProfileStore.getState().hoveredItem).toBeNull();
  });
});
