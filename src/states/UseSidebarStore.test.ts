import UseSidebarStore from "./UseSidebarStore";

const initialState = UseSidebarStore.getState();

describe("UseSidebarStore", () => {
  beforeEach(() => {
    UseSidebarStore.setState(initialState, true);
  });

  it("starts closed without an active link", () => {
    expect(UseSidebarStore.getState().isSidebarOpen).toBe(false);
    expect(UseSidebarStore.getState().activeLink).toBeNull();
  });

  it("toggleSidebar opens and closes the sidebar", () => {
    UseSidebarStore.getState().toggleSidebar();
    expect(UseSidebarStore.getState().isSidebarOpen).toBe(true);
    UseSidebarStore.getState().toggleSidebar();
    expect(UseSidebarStore.getState().isSidebarOpen).toBe(false);
  });

  it("setIsSidebarOpen and setActiveLink store the values", () => {
    UseSidebarStore.getState().setIsSidebarOpen(true);
    UseSidebarStore.getState().setActiveLink("S1");
    expect(UseSidebarStore.getState().isSidebarOpen).toBe(true);
    expect(UseSidebarStore.getState().activeLink).toBe("S1");
  });

  it("setActiveLink accepts numeric menu ids", () => {
    UseSidebarStore.getState().setActiveLink(2);
    expect(UseSidebarStore.getState().activeLink).toBe(2);
  });
});
