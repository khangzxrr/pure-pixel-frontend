import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import { server } from "../../test/server";
import { http, HttpResponse } from "msw";
import CameraChart from "./CameraChart";

type LineStubProps = { data: { labels: string[]; datasets: { label: string; data: number[] }[] } };

vi.mock("react-chartjs-2", () => ({
  Line: ({ data }: LineStubProps) => (
    <div>
      <p data-testid="labels">{data.labels.join(",")}</p>
      {data.datasets.map((ds) => (
        <p key={ds.label} data-testid="dataset">
          {ds.label}:{ds.data.join(",")}
        </p>
      ))}
    </div>
  ),
}));

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

describe("CameraChart", () => {
  it("shows a loading message while fetching", () => {
    server.use(http.get("*/camera/popular-graph", () => new Promise(() => {})));

    renderWithProviders(<CameraChart />);

    expect(screen.getByText("Đang tải...")).toBeInTheDocument();
  });

  it("shows an error message when the request fails", async () => {
    server.use(
      http.get("*/camera/popular-graph", () => new HttpResponse(null, { status: 500 })),
    );

    renderWithProviders(<CameraChart />);

    expect(await screen.findByText("Có lỗi xảy ra")).toBeInTheDocument();
  });

  it("builds a per-camera timeline dataset from the API response", async () => {
    mockEndpoint("get", "*/camera/popular-graph", [
      {
        timestamp: "2024-01-01T00:00:00.000Z",
        popularCameraDataPoints: [
          { camera: { name: "EOS R5" }, userCount: 5 },
        ],
      },
      {
        timestamp: "2024-01-02T00:00:00.000Z",
        popularCameraDataPoints: [
          { camera: { name: "EOS R5" }, userCount: 8 },
        ],
      },
    ]);

    renderWithProviders(<CameraChart />);

    expect(await screen.findByTestId("labels")).toHaveTextContent(
      "1/1/2024,2/1/2024",
    );
    expect(screen.getByTestId("dataset")).toHaveTextContent("EOS R5:5,8");
  });
});
