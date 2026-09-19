import UseUserOtherStore from "./UseUserOtherStore";

const initialState = UseUserOtherStore.getState();

describe("UseUserOtherStore", () => {
  beforeEach(() => {
    UseUserOtherStore.setState(initialState, true);
  });

  it("starts with a closed sidebar, nothing selected and sale photos checked", () => {
    const state = UseUserOtherStore.getState();
    expect(state.isSidebarOpen).toBe(false);
    expect(state.activeItem).toBeNull();
    expect(state.activeIcon).toBeNull();
    expect(state.activeTitle).toBeNull();
    expect(state.hoveredItem).toBeNull();
    expect(state.isForSaleChecked).toBe(true);
    expect(state.nameUserOther).toBe("");
    expect(state.userOtherId).toBeNull();
  });

  it("toggleSidebar opens and closes the sidebar", () => {
    UseUserOtherStore.getState().toggleSidebar();
    expect(UseUserOtherStore.getState().isSidebarOpen).toBe(true);
    UseUserOtherStore.getState().toggleSidebar();
    expect(UseUserOtherStore.getState().isSidebarOpen).toBe(false);
  });

  it("setActiveItem stores id, title, icon and quote", () => {
    UseUserOtherStore.getState().setActiveItem(
      "UO2",
      "Hồ sơ",
      "#",
      "/user/u1/photos"
    );
    const state = UseUserOtherStore.getState();
    expect(state.activeItem).toBe("UO2");
    expect(state.activeTitle).toBe("Hồ sơ");
    expect(state.activeIcon).toBe("#");
    expect(state.activeQuote).toBe("/user/u1/photos");
  });

  it("setHoveredItem and clearHoveredItem update the hovered item", () => {
    UseUserOtherStore.getState().setHoveredItem("UO3");
    expect(UseUserOtherStore.getState().hoveredItem).toBe("UO3");
    UseUserOtherStore.getState().clearHoveredItem();
    expect(UseUserOtherStore.getState().hoveredItem).toBeNull();
  });

  it("stores the sale filter, user name and user id", () => {
    UseUserOtherStore.getState().setIsForSaleChecked(false);
    UseUserOtherStore.getState().setNameUserOther("An");
    UseUserOtherStore.getState().setUserOtherId("u1");
    const state = UseUserOtherStore.getState();
    expect(state.isForSaleChecked).toBe(false);
    expect(state.nameUserOther).toBe("An");
    expect(state.userOtherId).toBe("u1");
  });
});
