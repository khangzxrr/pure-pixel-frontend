import UseTotalCameraUsedByUserStore from "./UseTotalCameraUsedByUserStore";

const initialState = UseTotalCameraUsedByUserStore.getState();

describe("UseTotalCameraUsedByUserStore", () => {
  beforeEach(() => {
    UseTotalCameraUsedByUserStore.setState(initialState, true);
  });

  it("starts without a brand", () => {
    expect(UseTotalCameraUsedByUserStore.getState().idCameraByBrand).toBe("");
    expect(UseTotalCameraUsedByUserStore.getState().nameCameraByBrand).toBe("");
  });

  it("stores the brand id and name", () => {
    UseTotalCameraUsedByUserStore.getState().setIdCameraByBrand("m1");
    UseTotalCameraUsedByUserStore.getState().setNameCameraByBrand("Canon");
    expect(UseTotalCameraUsedByUserStore.getState().idCameraByBrand).toBe("m1");
    expect(UseTotalCameraUsedByUserStore.getState().nameCameraByBrand).toBe(
      "Canon"
    );
  });
});
