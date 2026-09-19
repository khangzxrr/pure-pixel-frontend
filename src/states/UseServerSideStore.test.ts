import UseServerSideStore from "./UseServerSideStore";

const initialState = UseServerSideStore.getState();

describe("UseServerSideStore", () => {
  beforeEach(() => {
    UseServerSideStore.setState(initialState, true);
  });

  it("starts without an active link", () => {
    expect(UseServerSideStore.getState().activeLinkServer).toBeNull();
  });

  it("setActiveLinkServer stores the link", () => {
    UseServerSideStore.getState().setActiveLinkServer("/home");
    expect(UseServerSideStore.getState().activeLinkServer).toBe("/home");
  });
});
