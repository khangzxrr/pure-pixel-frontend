import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import type { MockInstance } from "vitest";
import useUploadPhotoStore from "../../../states/UploadPhotoState";
import { renderWithProviders } from "../../../test/render";
import { server } from "../../../test/server";
import MapBoxModal from "./MapBoxModal";

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
      <button onClick={() => onRetrieve?.({ features: [] })}>retrieve nothing</button>
      <button onClick={() => onRetrieve?.(null)}>retrieve null</button>
      <button onClick={() => onRetrieve?.({})}>retrieve without features</button>
    </div>
  ),
}));

vi.mock("../../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

const rcFile = (uid: string) =>
  Object.assign(new File(["img"], `${uid}.jpg`, { type: "image/jpeg" }), {
    uid,
    lastModifiedDate: new Date(2026, 8, 15),
  });

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
  const queries: Record<string, string>[] = [];
  server.use(
    http.get("https://api.mapbox.com/search/geocode/v6/reverse", ({ request }) => {
      queries.push(Object.fromEntries(new URL(request.url).searchParams));
      return HttpResponse.json({ features: [{ properties: { full_address: fullAddress } }] });
    }),
  );
  return queries;
};

const locateButton = () => {
  const button = document.querySelector<HTMLElement>(".shadow-md.cursor-pointer");
  if (!button) throw new Error("locate button not rendered");
  return button;
};

const photo = () => useUploadPhotoStore.getState().photoArray[0];

describe("MapBoxModal (upload)", () => {
  let consoleError: MockInstance<typeof console.error>;
  // console.error messages a test expects besides antd's deprecation warnings
  let expectedErrors: string[];

  beforeEach(() => {
    expectedErrors = [];
    const store = useUploadPhotoStore.getState();
    store.clearState();
    store.addPhoto("a", { file: rcFile("a"), exif: {} });
    store.setSelectedPhotoByUid("a");
    store.setIsOpenMapModal(true);
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
  });

  it("tells the user when their location is unknown", async () => {
    renderWithProviders(<MapBoxModal />);

    expect(
      await screen.findByText("Trình duyệt không hỗ trợ xác định vị trí hiện tại"),
    ).toBeInTheDocument();

    // reading the missing location used to throw before this notice
    await userEvent.click(locateButton());

    expect(
      await screen.findByText("Vui lòng cho phép vị trí để có trải nghiệm tốt hơn"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("view")).toHaveTextContent("11.16667,106.66667,14");
  });

  it("recenters the map on the user's location", async () => {
    located();

    renderWithProviders(<MapBoxModal />);

    expect(screen.getByText("Vị trí hiện tại của bạn")).toBeInTheDocument();
    expect(screen.getByTestId("marker")).toHaveTextContent("10.77,106.69");
    expect(screen.getByTestId("view")).toHaveTextContent("11.16667,106.66667,14");

    // this used to call an undefined setPage after moving the view
    await userEvent.click(locateButton());
    expect(screen.getByTestId("view")).toHaveTextContent("10.77,106.69,13");

    // already there: nothing changes
    await userEvent.click(locateButton());
    expect(screen.getByTestId("view")).toHaveTextContent("10.77,106.69,13");
  });

  it("saves a clicked point and its address to the selected photo", async () => {
    expectedErrors = ["Error getting current location:"];
    setGeolocation((_success, error) =>
      error?.({ code: 1, message: "denied" } as GeolocationPositionError),
    );
    const queries = respondWithAddress();

    renderWithProviders(<MapBoxModal />);

    expect(consoleError).toHaveBeenCalledWith(
      "Error getting current location:",
      expect.objectContaining({ code: 1 }),
    );
    // the modal is open whenever it is mounted, so no notice follows
    expect(screen.queryByText("Không thể xác định vị trí hiện tại của bạn")).toBeNull();

    await userEvent.click(screen.getByRole("button", { name: "map click" }));

    expect(screen.getByTestId("marker")).toHaveTextContent("10.8,106.7");
    expect(screen.getByTestId("view")).toHaveTextContent("10.8,106.7,14");
    expect(await screen.findByRole("heading", { name: "Quận 1, TP HCM" })).toBeInTheDocument();
    expect(screen.getByTestId("search")).toHaveTextContent("Quận 1, TP HCM");
    expect(queries).toEqual([
      expect.objectContaining({
        longitude: "106.7",
        latitude: "10.8",
        types: "place",
        language: "vi",
        limit: "1",
      }),
    ]);

    await userEvent.click(screen.getByRole("button", { name: "Đồng ý" }));

    expect(photo()).toMatchObject({
      exif: { latitude: 10.8, longitude: 106.7 },
      address: "Quận 1, TP HCM",
    });
    expect(useUploadPhotoStore.getState().isOpenMapModal).toBe(false);
  });

  it("uses a search result and follows map moves", async () => {
    renderWithProviders(<MapBoxModal />);

    await userEvent.click(screen.getByRole("button", { name: "retrieve nothing" }));
    expect(screen.queryByTestId("marker")).toBeNull();

    await userEvent.click(screen.getByRole("button", { name: "retrieve" }));
    expect(screen.getByTestId("marker")).toHaveTextContent("10.77,106.69");
    expect(screen.getByTestId("view")).toHaveTextContent("10.77,106.69,14");
    expect(screen.getByTestId("search")).toHaveTextContent("Chợ Bến Thành");
    expect(screen.getByTestId("proximity")).toHaveTextContent("10.77,106.69");

    await userEvent.click(screen.getByRole("button", { name: "map move" }));
    expect(screen.getByTestId("view")).toHaveTextContent("16.05,108.2,9");

    await userEvent.click(screen.getByRole("button", { name: "Đồng ý" }));
    expect(photo()).toMatchObject({
      exif: { latitude: 10.77, longitude: 106.69 },
      address: "Chợ Bến Thành",
    });
  });

  it("closes without touching the photo", async () => {
    renderWithProviders(<MapBoxModal />);

    await userEvent.click(screen.getByRole("button", { name: "Hủy" }));
    expect(useUploadPhotoStore.getState().isOpenMapModal).toBe(false);

    act(() => useUploadPhotoStore.getState().setIsOpenMapModal(true));
    await userEvent.click(await screen.findByRole("button", { name: "Đồng ý" }));
    expect(useUploadPhotoStore.getState().isOpenMapModal).toBe(false);
    expect(photo()).toEqual({ file: expect.anything(), exif: {} });
  });

  it("logs a failed address lookup", async () => {
    expectedErrors = ["Error fetching address:"];
    server.use(
      http.get("https://api.mapbox.com/search/geocode/v6/reverse", () =>
        HttpResponse.json({}, { status: 500 }),
      ),
    );

    renderWithProviders(<MapBoxModal />);
    await userEvent.click(screen.getByRole("button", { name: "map click" }));

    await waitFor(() =>
      expect(consoleError).toHaveBeenCalledWith("Error fetching address:", expect.anything()),
    );
    expect(screen.getByTestId("marker")).toHaveTextContent("10.8,106.7");
    expect(screen.getByTestId("search")).toBeEmptyDOMElement();
  });

  it("shows a spinner while the browser looks up the location", () => {
    // the browser has not answered yet
    setGeolocation(() => {});

    renderWithProviders(<MapBoxModal />);

    expect(document.querySelector(".ant-spin")).not.toBeNull();
  });

  it("ignores search responses without results", async () => {
    renderWithProviders(<MapBoxModal />);

    await userEvent.click(screen.getByRole("button", { name: "retrieve null" }));
    await userEvent.click(screen.getByRole("button", { name: "retrieve without features" }));

    expect(screen.queryByTestId("marker")).toBeNull();
    expect(screen.getByTestId("view")).toHaveTextContent("11.16667,106.66667,14");
  });

  it("reports a failed location lookup when mounted with the modal closed", async () => {
    expectedErrors = ["Error getting current location:"];
    useUploadPhotoStore.getState().setIsOpenMapModal(false);
    setGeolocation((_success, error) =>
      error?.({ code: 2, message: "unavailable" } as GeolocationPositionError),
    );

    renderWithProviders(<MapBoxModal />);

    expect(
      await screen.findByText("Không thể xác định vị trí hiện tại của bạn"),
    ).toBeInTheDocument();
  });
});
