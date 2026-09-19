import usePhotoMapStore, { type MapPhoto } from "./UsePhotoMapStore";

const initialState = usePhotoMapStore.getState();

const mapPhoto = (id: string): MapPhoto => ({
  id,
  blurHash: "LEHV6nWB2yk8",
  title: `Photo ${id}`,
  watermark: false,
  viewCount: 0,
  exif: { latitude: 10.8, longitude: 106.7 },
  description: "",
  width: 100,
  height: 80,
  photoType: "RAW",
  visibility: "PUBLIC",
  status: "PARSED",
  createdAt: "2026-09-01T00:00:00.000Z",
  updatedAt: "2026-09-01T00:00:00.000Z",
  photographer: {
    deletedAt: null,
    photoCount: 1,
    voteCount: 0,
    normalizedName: "an",
    mail: "an@example.com",
    phonenumber: "",
    socialLinks: [],
    expertises: [],
    id: "user-1",
    name: "An",
    avatar: "",
    cover: "",
    quote: "",
    location: "",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  signedUrl: { url: `https://cdn/${id}.jpg`, thumbnail: `https://cdn/${id}_t.jpg` },
});

describe("usePhotoMapStore", () => {
  beforeEach(() => {
    usePhotoMapStore.setState({ ...initialState, photoList: [] }, true);
  });

  it("starts with no photos and no selection", () => {
    const state = usePhotoMapStore.getState();
    expect(state.photoList).toEqual([]);
    expect(state.isFromPhotoDetailPage).toBe(false);
    expect(state.selectedPhoto).toBeNull();
  });

  it("setIsFromPhotoDetailPage stores the flag", () => {
    usePhotoMapStore.getState().setIsFromPhotoDetailPage(true);
    expect(usePhotoMapStore.getState().isFromPhotoDetailPage).toBe(true);
  });

  it("setPhotoList replaces and addMultiplePhotosToList appends photos", () => {
    usePhotoMapStore.getState().setPhotoList([mapPhoto("p1")]);
    usePhotoMapStore
      .getState()
      .addMultiplePhotosToList([mapPhoto("p2"), mapPhoto("p3")]);
    expect(usePhotoMapStore.getState().photoList.map((p) => p.id)).toEqual([
      "p1",
      "p2",
      "p3",
    ]);
  });

  it("removePhoto removes the matching photo only", () => {
    usePhotoMapStore.getState().setPhotoList([mapPhoto("p1"), mapPhoto("p2")]);

    usePhotoMapStore.getState().removePhoto({ id: "p1" });
    expect(usePhotoMapStore.getState().photoList.map((p) => p.id)).toEqual([
      "p2",
    ]);

    usePhotoMapStore.getState().removePhoto({ id: "missing" });
    expect(usePhotoMapStore.getState().photoList.map((p) => p.id)).toEqual([
      "p2",
    ]);
  });

  it("clearPhotoList empties the list", () => {
    usePhotoMapStore.getState().setPhotoList([mapPhoto("p1")]);
    usePhotoMapStore.getState().clearPhotoList();
    expect(usePhotoMapStore.getState().photoList).toEqual([]);
  });

  it("setSelectedPhoto keeps the fields the map needs and clearSelectedPhoto resets it", () => {
    usePhotoMapStore.getState().setSelectedPhoto(mapPhoto("p1"));
    expect(usePhotoMapStore.getState().selectedPhoto).toEqual({
      id: "p1",
      photo_id: "p1",
      photographer_id: "user-1",
      title: "Photo p1",
      photo_url: "https://cdn/p1_t.jpg",
      latitude: 10.8,
      longitude: 106.7,
    });

    usePhotoMapStore.getState().clearSelectedPhoto();
    expect(usePhotoMapStore.getState().selectedPhoto).toBeNull();
  });
});
