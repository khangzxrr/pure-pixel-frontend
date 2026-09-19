import UseInspirationStore from "./UseInspirationStore";

const initialState = UseInspirationStore.getState();

describe("UseInspirationStore", () => {
  beforeEach(() => {
    UseInspirationStore.setState(initialState, true);
  });

  it("starts with a closed sidebar and nothing selected", () => {
    const state = UseInspirationStore.getState();
    expect(state.isSidebarOpen).toBe(false);
    expect(state.activeItem).toBeNull();
    expect(state.activeIcon).toBeNull();
    expect(state.activeTitle).toBeNull();
    expect(state.hoveredItem).toBeNull();
  });

  it("toggleSidebar opens and closes the sidebar", () => {
    UseInspirationStore.getState().toggleSidebar();
    expect(UseInspirationStore.getState().isSidebarOpen).toBe(true);
    UseInspirationStore.getState().toggleSidebar();
    expect(UseInspirationStore.getState().isSidebarOpen).toBe(false);
  });

  it("setActiveItem stores id, title, icon and quote", () => {
    UseInspirationStore.getState().setActiveItem("I1", "Cảm hứng", "#", "Q");
    const state = UseInspirationStore.getState();
    expect(state.activeItem).toBe("I1");
    expect(state.activeTitle).toBe("Cảm hứng");
    expect(state.activeIcon).toBe("#");
    expect(state.activeQuote).toBe("Q");
  });

  it("setActiveItem accepts numeric menu ids", () => {
    UseInspirationStore.getState().setActiveItem(1, "Khám phá", "#", "Q");
    expect(UseInspirationStore.getState().activeItem).toBe(1);
  });

  it("setHoveredItem and clearHoveredItem update the hovered item", () => {
    UseInspirationStore.getState().setHoveredItem("I2");
    expect(UseInspirationStore.getState().hoveredItem).toBe("I2");
    UseInspirationStore.getState().clearHoveredItem();
    expect(UseInspirationStore.getState().hoveredItem).toBeNull();
  });
});
