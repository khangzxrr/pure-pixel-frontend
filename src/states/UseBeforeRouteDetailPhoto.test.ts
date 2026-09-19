import useBeforeRouteDetailPhoto from "./UseBeforeRouteDetailPhoto";

const initialState = useBeforeRouteDetailPhoto.getState();

describe("useBeforeRouteDetailPhoto", () => {
  beforeEach(() => {
    useBeforeRouteDetailPhoto.setState(initialState, true);
  });

  it("starts without a previous route", () => {
    expect(useBeforeRouteDetailPhoto.getState().beforeRoute).toBe("");
  });

  it("setBeforeRoute stores the route", () => {
    useBeforeRouteDetailPhoto.getState().setBeforeRoute("/explore/photo-map");
    expect(useBeforeRouteDetailPhoto.getState().beforeRoute).toBe(
      "/explore/photo-map"
    );
  });
});
