import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";
import CameraUseChart from "./CameraUseChart";

type LineStubProps = { data: { datasets: { label: string; data: number[] }[] } };

vi.mock("react-chartjs-2", () => ({
  Line: ({ data }: LineStubProps) => (
    <div>
      <p data-testid="label">{data.datasets[0].label}</p>
      <p data-testid="points">{data.datasets[0].data.length}</p>
    </div>
  ),
}));

describe("CameraUseChart", () => {
  it("labels the dataset with the camera name and generates 7 data points", () => {
    renderWithProviders(<CameraUseChart cameraData={{ name: "EOS R5" }} />);

    expect(screen.getByTestId("label")).toHaveTextContent("EOS R5");
    expect(screen.getByTestId("points")).toHaveTextContent("7");
  });
});
