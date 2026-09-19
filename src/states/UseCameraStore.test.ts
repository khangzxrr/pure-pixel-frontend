import type { Schema } from "../apis/types";
import UseCameraStore, { type TopBrandCamera } from "./UseCameraStore";

const initialState = UseCameraStore.getState();

const camera: Schema<"CameraDto"> = {
  id: "c1",
  name: "EOS R5",
  thumbnail: "https://cdn/eos.png",
  description: "Mirrorless",
};

const brand: TopBrandCamera = {
  userCount: 3,
  maker: {
    id: "m1",
    name: "Canon",
    thumbnail: "https://cdn/canon.png",
    cameras: [camera],
  },
};

describe("UseCameraStore", () => {
  beforeEach(() => {
    UseCameraStore.setState(initialState, true);
  });

  it("starts empty", () => {
    const state = UseCameraStore.getState();
    expect(state.isSidebarOpen).toBe(false);
    expect(state.activeItem).toBeNull();
    expect(state.activeIcon).toBeNull();
    expect(state.activeTitle).toBeNull();
    expect(state.hoveredItem).toBeNull();
    expect(state.nameBrandCamera).toBe("");
    expect(state.brandCamera).toBe("");
    expect(state.nameCamera).toBe("");
    expect(state.listTopBrandCamera).toEqual([]);
    expect(state.listTopCameraByBrand).toEqual([]);
    expect(state.idCamera).toBeNull();
  });

  it("toggleSidebar flips the sidebar", () => {
    UseCameraStore.getState().toggleSidebar();
    expect(UseCameraStore.getState().isSidebarOpen).toBe(true);
    UseCameraStore.getState().toggleSidebar();
    expect(UseCameraStore.getState().isSidebarOpen).toBe(false);
  });

  it("setActiveItem stores id, title, icon and quote", () => {
    UseCameraStore.getState().setActiveItem("C1", "Máy ảnh", "#", "Quote");
    const state = UseCameraStore.getState();
    expect(state.activeItem).toBe("C1");
    expect(state.activeTitle).toBe("Máy ảnh");
    expect(state.activeIcon).toBe("#");
    expect(state.activeQuote).toBe("Quote");
  });

  it("setHoveredItem and clearHoveredItem update the hovered item", () => {
    UseCameraStore.getState().setHoveredItem("C2");
    expect(UseCameraStore.getState().hoveredItem).toBe("C2");
    UseCameraStore.getState().clearHoveredItem();
    expect(UseCameraStore.getState().hoveredItem).toBeNull();
  });

  it("stores the brand and camera names", () => {
    UseCameraStore.getState().setNameBrandCamera("Canon");
    UseCameraStore.getState().setNameCamera("Nikon", "Z6");
    const state = UseCameraStore.getState();
    expect(state.nameBrandCamera).toBe("Canon");
    expect(state.brandCamera).toBe("Nikon");
    expect(state.nameCamera).toBe("Z6");
  });

  it("stores the top brand and top camera lists and the camera id", () => {
    UseCameraStore.getState().setListTopBrandCamera([brand]);
    UseCameraStore.getState().setListTopCameraByBrand([camera]);
    UseCameraStore.getState().setIdCamera("c1");
    const state = UseCameraStore.getState();
    expect(state.listTopBrandCamera).toEqual([brand]);
    expect(state.listTopCameraByBrand).toEqual([camera]);
    expect(state.idCamera).toBe("c1");
  });
});
