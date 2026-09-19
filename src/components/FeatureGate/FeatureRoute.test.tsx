import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../test/render";
import FeatureRoute from "./FeatureRoute";

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

vi.mock("../../pages/LoadingPage", () => ({ default: () => <div>loading page</div> }));

const app = (
  <Routes>
    <Route path="/" element={<div>home page</div>} />
    <Route
      path="/booking"
      element={
        <FeatureRoute flag="booking">
          <div>booking page</div>
        </FeatureRoute>
      }
    />
  </Routes>
);

describe("FeatureRoute", () => {
  it("shows the page when the flag is on", () => {
    renderWithProviders(app, { route: "/booking" });
    expect(screen.getByText("booking page")).toBeInTheDocument();
  });

  it("redirects home when the flag is off", async () => {
    renderWithProviders(app, { route: "/booking", featureFlags: { booking: false } });
    expect(await screen.findByText("home page")).toBeInTheDocument();
    expect(screen.queryByText("booking page")).not.toBeInTheDocument();
  });

  it("shows the loading page until the flags are known", () => {
    renderWithProviders(app, { route: "/booking", featureFlags: null });
    expect(screen.getByText("loading page")).toBeInTheDocument();
  });
});
