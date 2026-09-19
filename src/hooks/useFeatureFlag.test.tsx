import { screen, waitFor } from "@testing-library/react";
import { HttpResponse } from "msw";
import { mockEndpoint } from "../test/mockEndpoint";
import { renderWithProviders } from "../test/render";
import { useFeatureFlag } from "./useFeatureFlag";

vi.mock("../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

function Probe({ label }: { label: string }) {
  const booking = useFeatureFlag("booking");
  return <div>{`${label}: ${booking === undefined ? "loading" : String(booking)}`}</div>;
}

// featureFlags: null leaves the flags unloaded so the hook fetches them
const renderProbes = () =>
  renderWithProviders(
    <>
      <Probe label="a" />
      <Probe label="b" />
    </>,
    { featureFlags: null },
  );

describe("useFeatureFlag", () => {
  it("is undefined while loading, then the flag value, with one shared request", async () => {
    const requests = mockEndpoint("get", "*/feature-flags", { booking: false });
    renderProbes();

    expect(screen.getByText("a: loading")).toBeInTheDocument();
    expect(await screen.findByText("a: false")).toBeInTheDocument();
    expect(screen.getByText("b: false")).toBeInTheDocument();
    expect(requests).toHaveLength(1);
  });

  it("fails open when the flags cannot be loaded", async () => {
    mockEndpoint("get", "*/feature-flags", () => new HttpResponse(null, { status: 500 }));
    renderProbes();

    await waitFor(() => expect(screen.getByText("a: true")).toBeInTheDocument());
  });

  it("uses flags already in the query cache without a request", async () => {
    const requests = mockEndpoint("get", "*/feature-flags", { booking: true });
    renderWithProviders(<Probe label="c" />, { featureFlags: { booking: false } });

    expect(screen.getByText("c: false")).toBeInTheDocument();
    expect(requests).toHaveLength(0);
  });
});
