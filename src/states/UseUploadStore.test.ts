import UseUploadStore from "./UseUploadStore";

const initialState = UseUploadStore.getState();

describe("UseUploadStore", () => {
  beforeEach(() => {
    UseUploadStore.setState(initialState, true);
  });

  it("starts with a closed sidebar and nothing selected", () => {
    const state = UseUploadStore.getState();
    expect(state.isSidebarOpen).toBe(false);
    expect(state.activeItem).toBeNull();
    expect(state.activeIcon).toBeNull();
    expect(state.activeTitle).toBeNull();
    expect(state.hoveredItem).toBeNull();
  });

  it("toggleSidebar opens and closes the sidebar", () => {
    UseUploadStore.getState().toggleSidebar();
    expect(UseUploadStore.getState().isSidebarOpen).toBe(true);
    UseUploadStore.getState().toggleSidebar();
    expect(UseUploadStore.getState().isSidebarOpen).toBe(false);
  });

  it("setActiveItem stores id, title, icon and quote", () => {
    UseUploadStore.getState().setActiveItem("U1", "Đăng ảnh", "#", "Q");
    const state = UseUploadStore.getState();
    expect(state.activeItem).toBe("U1");
    expect(state.activeTitle).toBe("Đăng ảnh");
    expect(state.activeIcon).toBe("#");
    expect(state.activeQuote).toBe("Q");
  });

  it("setHoveredItem and clearHoveredItem update the hovered item", () => {
    UseUploadStore.getState().setHoveredItem("U2");
    expect(UseUploadStore.getState().hoveredItem).toBe("U2");
    UseUploadStore.getState().clearHoveredItem();
    expect(UseUploadStore.getState().hoveredItem).toBeNull();
  });
});
