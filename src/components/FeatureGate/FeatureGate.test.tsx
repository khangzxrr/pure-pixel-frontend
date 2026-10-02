import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";
import FeatureGate from "./FeatureGate";

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

describe("FeatureGate", () => {
  it("renders the children when the flag is on", () => {
    renderWithProviders(<FeatureGate flag="booking">booking ui</FeatureGate>);
    expect(screen.getByText("booking ui")).toBeInTheDocument();
  });

  it("renders the fallback when the flag is off", () => {
    renderWithProviders(
      <FeatureGate flag="booking" fallback={<span>no booking</span>}>
        booking ui
      </FeatureGate>,
      { featureFlags: { booking: false } },
    );
    expect(screen.queryByText("booking ui")).not.toBeInTheDocument();
    expect(screen.getByText("no booking")).toBeInTheDocument();
  });

  it("renders nothing while the flags are loading", () => {
    renderWithProviders(<FeatureGate flag="booking">booking ui</FeatureGate>, {
      featureFlags: null,
    });
    expect(screen.queryByText("booking ui")).not.toBeInTheDocument();
  });
});
