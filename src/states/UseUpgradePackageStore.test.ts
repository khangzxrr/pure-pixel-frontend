import useUpgradePackageStore from "./UseUpgradePackageStore";

const initialState = useUpgradePackageStore.getState();

describe("useUpgradePackageStore", () => {
  beforeEach(() => {
    useUpgradePackageStore.setState(initialState, true);
  });

  it("starts not upgraded", () => {
    expect(useUpgradePackageStore.getState().isUpgraded).toBe(false);
  });

  it("setIsUpgraded stores the flag", () => {
    useUpgradePackageStore.getState().setIsUpgraded(true);
    expect(useUpgradePackageStore.getState().isUpgraded).toBe(true);
  });
});
