import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import { server } from "../../test/server";
import UseCameraStore from "../../states/UseCameraStore";
import CameraTableList from "./CameraTableList";

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

describe("CameraTableList", () => {
  afterEach(() => {
    UseCameraStore.setState({
      listTopBrandCamera: [],
      brandCamera: "",
      nameCamera: "",
    });
  });

  it("shows a loading spinner while fetching", () => {
    server.use(http.get("*/camera/brand/popular", () => new Promise(() => {})));

    renderWithProviders(<CameraTableList />);

    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("shows an error row when the request fails", async () => {
    server.use(http.get("*/camera/brand/popular", () => new HttpResponse(null, { status: 500 })));

    renderWithProviders(<CameraTableList />);

    expect(await screen.findByText(/Error fetching data/)).toBeInTheDocument();
  });

  it("lists top brands, their top 2 models and stores the brand list", async () => {
    mockEndpoint("get", "*/camera/brand/popular", [
      {
        maker: {
          id: "m1",
          name: "Canon EOS",
          thumbnail: "canon.png",
          cameras: [
            { id: "c1", name: "EOS R5" },
            { id: "c2", name: "EOS R6" },
            { id: "c3", name: "EOS 90D" },
          ],
        },
        userCount: 42,
      },
    ]);

    renderWithProviders(<CameraTableList />);

    // only the first word of the brand name is shown
    expect(await screen.findByText("Canon")).toBeInTheDocument();
    expect(screen.getByText("EOS R5")).toBeInTheDocument();
    expect(screen.getByText("EOS R6")).toBeInTheDocument();
    expect(screen.queryByText("EOS 90D")).not.toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();

    expect(UseCameraStore.getState().listTopBrandCamera).toEqual([
      {
        maker: {
          id: "m1",
          name: "Canon EOS",
          thumbnail: "canon.png",
          cameras: [
            { id: "c1", name: "EOS R5" },
            { id: "c2", name: "EOS R6" },
            { id: "c3", name: "EOS 90D" },
          ],
        },
        userCount: 42,
      },
    ]);

    await userEvent.click(screen.getByText("Canon"));
    expect(UseCameraStore.getState().brandCamera).toBe("Canon EOS");
    expect(UseCameraStore.getState().nameCamera).toBe("");

    await userEvent.click(screen.getByText("EOS R5"));
    expect(UseCameraStore.getState().nameCamera).toBe("EOS R5");
  });

  it("gives the stored brand an empty id when the API omits maker.id", async () => {
    mockEndpoint("get", "*/camera/brand/popular", [
      {
        maker: { name: "NoId Brand", thumbnail: "", cameras: [] },
        userCount: 1,
      },
    ]);

    renderWithProviders(<CameraTableList />);

    await screen.findByText("NoId");
    expect(UseCameraStore.getState().listTopBrandCamera[0].maker.id).toBe("");
  });
});
