import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import useBeforeRouteDetailPhoto from "../../states/UseBeforeRouteDetailPhoto";
import usePhotoMapStore from "../../states/UsePhotoMapStore";
import { renderWithProviders } from "../../test/render";
import { mockEndpoint } from "../../test/mockEndpoint";
import { server } from "../../test/server";
import PhotoMap from "./PhotoMap";

type MapStubProps = {
  children?: ReactNode;
  latitude: number;
  longitude: number;
  zoom: number;
  onClick?: (event: { lngLat: { lng: number; lat: number } }) => void;
  onMove?: (event: {
    viewState: { latitude: number; longitude: number; zoom: number };
  }) => void;
  onMoveEnd?: (event: {
    viewState: { latitude: number; longitude: number; zoom: number };
  }) => void;
};

type PointStubProps = {
  children?: ReactNode;
  latitude: number;
  longitude: number;
};

vi.mock("react-map-gl", () => ({
  default: ({
    children,
    latitude,
    longitude,
    zoom,
    onClick,
    onMove,
    onMoveEnd,
  }: MapStubProps) => (
    <div>
      <p data-testid="map-view">{`${latitude},${longitude},${zoom}`}</p>
      <button onClick={() => onClick?.({ lngLat: { lng: 106.81, lat: 10.91 } })}>
        map click
      </button>
      <button
        onClick={() =>
          onMove?.({ viewState: { latitude: 11, longitude: 107, zoom: 9 } })
        }
      >
        map move
      </button>
      <button
        onClick={() =>
          onMoveEnd?.({ viewState: { latitude: 11, longitude: 107, zoom: 9 } })
        }
      >
        map move end
      </button>
      {children}
    </div>
  ),
  Marker: ({ children, latitude, longitude }: PointStubProps) => (
    <div data-testid={`marker-${latitude}-${longitude}`}>{children}</div>
  ),
  Popup: ({ children }: PointStubProps) => <div>{children}</div>,
}));

vi.mock("../../services/Keycloak", () => ({
  default: { isLoggedIn: () => false, getToken: () => undefined },
}));

vi.mock("../DetailPhoto/DetailPhoto", () => ({
  default: ({
    photo,
    onClose,
  }: {
    photo: { title: string };
    onClose: () => void;
  }) => (
    <div>
      <p>detail-{photo.title}</p>
      <button onClick={onClose}>close detail</button>
    </div>
  ),
}));

const setGeolocation = (getCurrentPosition?: Geolocation["getCurrentPosition"]) =>
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: getCurrentPosition ? { getCurrentPosition } : undefined,
  });

const mapPhotos = [
  {
    id: "photo-1",
    title: "A very long title for the first photo",
    signedUrl: { thumbnail: "https://cdn.test/photo-1-thumb.jpg" },
    photographer: { id: "ptg-1" },
    exif: { latitude: 10.7, longitude: 106.6 },
  },
  {
    id: "photo-2",
    title: "Second photo",
    signedUrl: { thumbnail: "https://cdn.test/photo-2-thumb.jpg" },
    photographer: { id: "ptg-2" },
    exif: { latitude: 10.71, longitude: 106.61 },
  },
  {
    id: "photo-3",
    title: "Third photo",
    signedUrl: { thumbnail: "https://cdn.test/photo-3-thumb.jpg" },
    photographer: { id: "ptg-3" },
    exif: { latitude: 10.72, longitude: 106.62 },
  },
  {
    id: "photo-4",
    title: "Fourth photo",
    signedUrl: { thumbnail: "https://cdn.test/photo-4-thumb.jpg" },
    photographer: { id: "ptg-4" },
    exif: { latitude: 10.73, longitude: 106.63 },
  },
];

describe("PhotoMap", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_MAPBOX_TOKEN", "pk.test");
    setGeolocation(undefined);
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    });
    usePhotoMapStore.setState({
      photoList: [],
      selectedPhoto: null,
      isFromPhotoDetailPage: false,
    });
    useBeforeRouteDetailPhoto.setState({ beforeRoute: "" });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("loads nearby photos and asks for location access when the browser has none", async () => {
    const requests = mockEndpoint("get", "*/photo/public", {
      objects: [],
      totalPage: 1,
    });

    renderWithProviders(<PhotoMap />);

    expect(await screen.findByText("Vui lòng cho phép vị trí để có trải nghiệm tốt hơn")).toBeInTheDocument();
    expect(requests[0].query).toMatchObject({
      limit: "88",
      page: "0",
      longitude: "106.79257343412127",
      latitude: "10.844706068296105",
      distance: "100",
      selling: "false",
    });

    await userEvent.click(screen.getByText("Trở về Vị trí hiện tại"));
    expect(
      await screen.findAllByText("Vui lòng cho phép vị trí để có trải nghiệm tốt hơn"),
    ).not.toHaveLength(0);
  });

  it("selects a photo, reverse geocodes it and opens the detail view", async () => {
    setGeolocation((success) =>
      success({ coords: { latitude: 10.77, longitude: 106.69 } } as GeolocationPosition),
    );
    mockEndpoint("get", "*/photo/public", {
      objects: mapPhotos.slice(0, 3),
      totalPage: 1,
    });
    mockEndpoint(
      "get",
      "https://api.mapbox.com/search/geocode/v6/reverse",
      { features: [{ properties: { full_address: "Quận 1, Hồ Chí Minh" } }] },
    );

    renderWithProviders(<PhotoMap />);

    await screen.findByAltText("Second photo");
    await userEvent.click(screen.getByAltText("A very long title for the first photo"));

    expect(await screen.findByText("A very long title...")).toBeInTheDocument();
    expect(await screen.findByText("Quận 1, Hồ Chí Minh")).toBeInTheDocument();
    expect(screen.getByText("Vị trí của bạn")).toBeInTheDocument();

    const selectedPreview = screen.getAllByAltText(
      "A very long title for the first photo",
    )[1];
    Object.defineProperty(selectedPreview, "width", {
      configurable: true,
      value: 100,
    });
    Object.defineProperty(selectedPreview, "height", {
      configurable: true,
      value: 220,
    });
    fireEvent.load(selectedPreview);
    expect(
      screen.getByText("A very long title for the first photo"),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByText("A very long title for the first photo"));

    expect(await screen.findByText("detail-A very long title for the first photo")).toBeInTheDocument();
    expect(useBeforeRouteDetailPhoto.getState().beforeRoute).toBe("/explore/photo-map");
    expect(usePhotoMapStore.getState().isFromPhotoDetailPage).toBe(false);
  });

  it("loads the next page when moving past the second-to-last selected photo", async () => {
    setGeolocation((success) =>
      success({ coords: { latitude: 10.77, longitude: 106.69 } } as GeolocationPosition),
    );
    const requests: Array<Record<string, string>> = [];
    server.use(
      http.get("*/photo/public", ({ request }) => {
        const query = Object.fromEntries(new URL(request.url).searchParams);
        requests.push(query);
        return HttpResponse.json(
          query.page === "0"
            ? { objects: mapPhotos.slice(0, 3), totalPage: 2 }
            : { objects: [mapPhotos[3]], totalPage: 2 },
        );
      }),
      http.get("https://api.mapbox.com/search/geocode/v6/reverse", () =>
        HttpResponse.json({
          features: [{ properties: { full_address: "Ho Chi Minh City" } }],
        }),
      ),
    );

    renderWithProviders(<PhotoMap />);

    await screen.findByAltText("Second photo");
    await userEvent.click(screen.getByAltText("Second photo"));
    await userEvent.click(screen.getAllByRole("button").at(-1)!);

    expect(await screen.findByAltText("Fourth photo")).toBeInTheDocument();
    expect(requests.length).toBeGreaterThanOrEqual(2);
    expect(requests.some((request) => request.page === "1")).toBe(true);
  });

  it("moves around the map and returns to the current location", async () => {
    setGeolocation((success) =>
      success({ coords: { latitude: 10.77, longitude: 106.69 } } as GeolocationPosition),
    );
    const requests = mockEndpoint("get", "*/photo/public", {
      objects: [],
      totalPage: 1,
    });

    renderWithProviders(<PhotoMap />);

    expect(await screen.findByText("Vị trí của bạn")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "map move" }));
    expect(screen.getByTestId("map-view")).toHaveTextContent("11,107,9");

    await userEvent.click(screen.getByRole("button", { name: "map move end" }));
    await waitFor(() => expect(requests.length).toBeGreaterThan(1));

    await userEvent.click(screen.getByText("Trở về Vị trí hiện tại"));
    expect(screen.getByTestId("map-view")).toHaveTextContent("10.77,106.69,13");
  });
});
