import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test/render";
import CameraList from "./CameraList";

vi.mock("./CameraChart", () => ({ default: () => <div>chart</div> }));
vi.mock("./CameraTableList", () => ({ default: () => <div>table</div> }));
vi.mock("./CameraPopularBrand", () => ({ default: () => <div>popular brand</div> }));

describe("CameraList", () => {
  it("renders the popular brand list, chart and table", () => {
    renderWithProviders(<CameraList />);

    expect(screen.getByText("popular brand")).toBeInTheDocument();
    expect(screen.getByText("chart")).toBeInTheDocument();
    expect(screen.getByText("table")).toBeInTheDocument();
  });
});
