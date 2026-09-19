import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import type { MockInstance } from "vitest";
import useModalStore from "../../states/UseModalStore";
import { renderWithProviders } from "../../test/render";
import { server } from "../../test/server";
import UpdateMapModal from "./UpdateMapModal";

type MapStubProps = {
  children?: ReactNode;
  latitude: number;
  longitude: number;
  zoom: number;
  onClick?: (event: { lngLat: { lng: number; lat: number } }) => void;
  onMove?: (event: {
    viewState: { latitude: number; longitude: number; zoom: number };
  }) => void;
};

type PointStubProps = { children?: ReactNode; latitude: number; longitude: number };

type SearchBoxStubProps = {
  value?: string;
  onRetrieve?: (response: unknown) => void;
  options?: { proximity?: { lng: number; lat: number } };
};

// mapbox-gl cannot render in jsdom: the stub shows the view and fires the map callbacks
vi.mock("react-map-gl", () => ({
  default: ({ children, latitude, longitude, zoom, onClick, onMove }: MapStubProps) => (
    <div>
      <p data-testid="view">{`${latitude},${longitude},${zoom}`}</p>
      <button onClick={() => onClick?.({ lngLat: { lng: 106.7, lat: 10.8 } })}>
        map click
      </button>
      <button
        onClick={() =>
          onMove?.({ viewState: { latitude: 16.05, longitude: 108.2, zoom: 9 } })
        }
      >
        map move
      </button>
      {children}
    </div>
  ),
  Marker: ({ children, latitude, longitude }: PointStubProps) => (
    <div data-testid="marker">
      {`${latitude},${longitude}`}
      {children}
    </div>
  ),
  Popup: ({ children }: PointStubProps) => <div>{children}</div>,
}));

vi.mock("@mapbox/search-js-react", () => ({
  SearchBox: ({ value, onRetrieve, options }: SearchBoxStubProps) => (
    <div>
      <p data-testid="search">{value}</p>
      <p data-testid="proximity">{`${options?.proximity?.lat},${options?.proximity?.lng}`}</p>
      <button
        onClick={() =>
          onRetrieve?.({
            features: [
              {
                geometry: { coordinates: [106.69, 10.77] },
                properties: { full_address: "Chợ Bến Thành" },
              },
            ],
          })
        }
      >
        retrieve
      </button>
    </div>
  ),
}));

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const setGeolocation = (getCurrentPosition?: Geolocation["getCurrentPosition"]) =>
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: getCurrentPosition ? { getCurrentPosition } : undefined,
  });

const located = () =>
  setGeolocation((success) =>
    success({ coords: { latitude: 10.77, longitude: 106.69 } } as GeolocationPosition),
  );

const respondWithAddress = (fullAddress = "Quận 1, TP HCM") => {
  server.use(
    http.get("https://api.mapbox.com/search/geocode/v6/reverse", () =>
      HttpResponse.json({ features: [{ properties: { full_address: fullAddress } }] }),
    ),
  );
};

const locateButton = () => {
  const button = document.querySelector<HTMLElement>(".shadow-md");
  if (!button) throw new Error("locate button not rendered");
  return button;
};

describe("UpdateMapModal", () => {
  let consoleError: MockInstance<typeof console.error>;
  let expectedErrors: string[];

  beforeEach(() => {
    expectedErrors = [];
    useModalStore.setState({
      isUpdateOpenMapModal: true,
      isUpdatePhotoModal: false,
      selectedUpdatePhoto: {},
    } as never);
    setGeolocation(undefined);
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    const unexpected = consoleError.mock.calls
      .map(([text]) => String(text))
      .filter(
        (text) =>
          !text.includes("deprecated") &&
          !expectedErrors.some((expected) => text.includes(expected)),
      );
    expect(unexpected.join("\n")).toBe("");
    consoleError.mockRestore();
    useModalStore.setState({
      isUpdateOpenMapModal: false,
      isUpdatePhotoModal: false,
      selectedUpdatePhoto: {},
    } as never);
  });

  it("recenters the map on the user's location", async () => {
    located();

    renderWithProviders(<UpdateMapModal />);

    expect(await screen.findByText("Vị trí hiện tại của bạn")).toBeInTheDocument();
    expect(screen.getByTestId("marker")).toHaveTextContent("10.77,106.69");

    await userEvent.click(locateButton());
    expect(screen.getByTestId("view")).toHaveTextContent("10.77,106.69,14");
  });

  it("saves a clicked point and its address to the selected photo", async () => {
    respondWithAddress();

    renderWithProviders(<UpdateMapModal />);

    await userEvent.click(screen.getByRole("button", { name: "map click" }));

    expect(screen.getByTestId("marker")).toHaveTextContent("10.8,106.7");
    expect(await screen.findByRole("heading", { name: "Quận 1, TP HCM" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Đồng ý" }));

    expect(useModalStore.getState().selectedUpdatePhoto).toMatchObject({
      exif: { latitude: 10.8, longitude: 106.7 },
      address: "Quận 1, TP HCM",
    });
    expect(useModalStore.getState().isUpdateOpenMapModal).toBe(false);
    expect(useModalStore.getState().isUpdatePhotoModal).toBe(true);
  });

  it("uses a search result", async () => {
    renderWithProviders(<UpdateMapModal />);

    await userEvent.click(screen.getByRole("button", { name: "retrieve" }));
    expect(screen.getByTestId("marker")).toHaveTextContent("10.77,106.69");
    expect(screen.getByTestId("search")).toHaveTextContent("Chợ Bến Thành");
  });

  it("closes without touching the photo", async () => {
    renderWithProviders(<UpdateMapModal />);

    await userEvent.click(screen.getByRole("button", { name: "Hủy" }));
    expect(useModalStore.getState().isUpdateOpenMapModal).toBe(false);
    expect(useModalStore.getState().isUpdatePhotoModal).toBe(true);
    expect(useModalStore.getState().selectedUpdatePhoto).toEqual({});
  });

  it("logs a failed address lookup", async () => {
    expectedErrors = ["Error fetching address:"];
    server.use(
      http.get("https://api.mapbox.com/search/geocode/v6/reverse", () =>
        HttpResponse.json({}, { status: 500 }),
      ),
    );

    renderWithProviders(<UpdateMapModal />);
    await userEvent.click(screen.getByRole("button", { name: "map click" }));

    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith("Error fetching address:", expect.anything()),
    );
  });

  it("shows a spinner while the browser looks up the location", () => {
    setGeolocation(() => {});

    renderWithProviders(<UpdateMapModal />);

    expect(document.querySelector(".ant-spin")).not.toBeNull();
  });

  it("tells the user when their location is unknown", async () => {
    renderWithProviders(<UpdateMapModal />);

    expect(
      await screen.findByText("Trình duyệt không hỗ trợ xác định vị trí hiện tại"),
    ).toBeInTheDocument();
  });

  it("reports a failed location lookup", async () => {
    expectedErrors = ["Error getting current location:"];
    setGeolocation((_success, error) =>
      error?.({ code: 1, message: "denied" } as GeolocationPositionError),
    );
    // the modal is already open when mounted, so no notice follows (matches the source's guard)
    renderWithProviders(<UpdateMapModal />);

    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith(
        "Error getting current location:",
        expect.objectContaining({ code: 1 }),
      ),
    );
    expect(
      screen.queryByText("Không thể xác định vị trí hiện tại của bạn"),
    ).toBeNull();
  });
});
