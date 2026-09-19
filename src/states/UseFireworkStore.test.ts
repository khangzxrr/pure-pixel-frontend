import useFireworkStore from "./UseFireworkStore";

const initialState = useFireworkStore.getState();

describe("useFireworkStore", () => {
  beforeEach(() => {
    useFireworkStore.setState(initialState, true);
  });

  it("starts without fireworks", () => {
    expect(useFireworkStore.getState().isFiring).toBe(false);
  });

  it("startFireworks and stopFireworks toggle the fireworks", () => {
    useFireworkStore.getState().startFireworks();
    expect(useFireworkStore.getState().isFiring).toBe(true);
    useFireworkStore.getState().stopFireworks();
    expect(useFireworkStore.getState().isFiring).toBe(false);
  });
});
