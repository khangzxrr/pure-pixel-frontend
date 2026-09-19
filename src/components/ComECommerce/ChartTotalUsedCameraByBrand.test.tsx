import { screen } from "@testing-library/react";
import { http } from "msw";
import { renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import { server } from "../../test/server";
import UseTotalCameraUsedByUserStore from "../../states/UseTotalCameraUsedByUserStore";
import ChartTotalUsedCameraByBrand from "./ChartTotalUsedCameraByBrand";

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

vi.mock("react-apexcharts", () => ({
  default: ({ options, series, type }: { options: Record<string, unknown>; series: unknown; type: string }) => (
    <div
      data-testid="apexchart"
      data-options={JSON.stringify(options)}
      data-series={JSON.stringify(series)}
      data-type={type}
    />
  ),
}));

describe("ChartTotalUsedCameraByBrand", () => {
  afterEach(() => {
    UseTotalCameraUsedByUserStore.setState({
      idCameraByBrand: "",
      nameCameraByBrand: "",
    });
  });

  it("shows the prompt state when no brand is selected", () => {
    renderWithProviders(<ChartTotalUsedCameraByBrand />);

    expect(
      screen.getByText(/Hãy nhấn chọn một hãng máy ảnh trong/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Danh sách xếp hạng các máy ảnh phổ biến nhất/i),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("apexchart")).not.toBeInTheDocument();
  });

  it("shows a loading spinner while the selected brand data is being fetched", () => {
    UseTotalCameraUsedByUserStore.setState({
      idCameraByBrand: "canon",
      nameCameraByBrand: "Canon",
    });
    server.use(
      http.get("*/camera/brand/canon/top", () => new Promise(() => {})),
    );

    renderWithProviders(<ChartTotalUsedCameraByBrand />);

    expect(screen.getByLabelText("oval-loading")).toBeInTheDocument();
  });

  it("renders the donut chart and usage list for the selected brand", async () => {
    UseTotalCameraUsedByUserStore.setState({
      idCameraByBrand: "canon",
      nameCameraByBrand: "Canon",
    });
    const requests = mockEndpoint("get", "*/camera/brand/canon/top", [
      { name: "EOS R5", _count: { cameraOnUsers: 5 } },
      { name: "EOS R6", _count: { cameraOnUsers: 3 } },
    ]);

    renderWithProviders(<ChartTotalUsedCameraByBrand />);

    expect(
      await screen.findByText(/Số lượng người dùng sử dụng máy ảnh/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Canon", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("EOS R5:")).toBeInTheDocument();
    expect(screen.getByText("EOS R6:")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByTestId("apexchart")).toHaveAttribute("data-type", "donut");
    expect(screen.getByTestId("apexchart")).toHaveAttribute("data-series", "[5,3]");
    expect(screen.getByTestId("apexchart").getAttribute("data-options")).toContain(
      "EOS R5",
    );
    expect(requests).toHaveLength(1);
    expect(requests[0].path).toBe("/camera/brand/canon/top");
    expect(requests[0].query.top).toBe("10");
  });
});
