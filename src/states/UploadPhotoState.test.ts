import type { RcFile } from "antd/es/upload/interface";
import type { Schema } from "../apis/types";
import useUploadPhotoStore, { type UploadPhotoItem } from "./UploadPhotoState";

const rcFile = (uid: string): RcFile =>
  Object.assign(new File(["x"], `${uid}.jpg`), {
    uid,
    lastModifiedDate: new Date(2026, 0, 1),
  });

const signedPhoto = (id: string): Schema<"SignedPhotoDto"> => ({
  id,
  blurHash: "LEHV6nWB2yk8",
  title: `Photo ${id}`,
  watermark: false,
  viewCount: 0,
  exif: {},
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

const store = () => useUploadPhotoStore.getState();

const add = (uid: string, extra: Partial<UploadPhotoItem> = {}) =>
  store().addPhoto(uid, { file: rcFile(uid), status: "uploading", ...extra });

describe("useUploadPhotoStore", () => {
  beforeEach(() => {
    // fresh containers: the actions mutate the maps and the array in place
    useUploadPhotoStore.setState({
      photoIdHashmap: {},
      uidHashmap: {},
      photoArray: [],
      selectedPhoto: null,
      isUpdatingPhotos: false,
      isOpenDraftModal: false,
      isOpenMapModal: false,
    });
  });

  it("starts with an empty queue", () => {
    const initial = useUploadPhotoStore.getInitialState();
    expect(initial.photoIdHashmap).toEqual({});
    expect(initial.uidHashmap).toEqual({});
    expect(initial.photoArray).toEqual([]);
    expect(initial.selectedPhoto).toBeNull();
    expect(initial.isUpdatingPhotos).toBe(false);
    expect(initial.isOpenDraftModal).toBe(false);
    expect(initial.isOpenMapModal).toBe(false);
  });

  it("addPhoto queues a photo that getPhotoByUid finds", () => {
    add("u1", { title: "Sea" });
    add("u2");

    expect(store().uidHashmap).toEqual({ u1: 0, u2: 1 });
    expect(store().getPhotoByUid("u1")?.title).toBe("Sea");
    expect(store().getPhotoByUid("u2")?.file.uid).toBe("u2");
    expect(store().getPhotoByUid("missing")).toBeUndefined();
  });

  it("setSelectedPhotoByUid selects a uid", () => {
    store().setSelectedPhotoByUid("u1");
    expect(store().selectedPhoto).toBe("u1");
  });

  describe("updateSelectedPhotoProperty", () => {
    it("sets the property on an object selection", () => {
      const selected = { id: "p1" };
      useUploadPhotoStore.setState({ selectedPhoto: selected });

      store().updateSelectedPhotoProperty("title", "Sky");

      expect(store().selectedPhoto).toEqual({ id: "p1", title: "Sky" });
    });

    it("leaves a uid selection unchanged", () => {
      store().setSelectedPhotoByUid("u1");
      store().updateSelectedPhotoProperty("title", "Sky");
      expect(store().selectedPhoto).toBe("u1");
    });
  });

  describe("updatePhotoPropertyByUid", () => {
    beforeEach(() => {
      add("u1", { exif: { latitude: 1, longitude: 2 } });
    });

    it("sets a top level property and returns a new array", () => {
      const before = store().photoArray;
      store().updatePhotoPropertyByUid("u1", "status", "done");
      expect(store().photoArray[0].status).toBe("done");
      expect(store().photoArray).not.toBe(before);
    });

    it("sets a nested property inside an existing object", () => {
      store().updatePhotoPropertyByUid("u1", "exif.latitude", 10.5);
      expect(store().photoArray[0].exif).toEqual({ latitude: 10.5, longitude: 2 });
    });

    it("creates missing objects along a nested key", () => {
      store().updatePhotoPropertyByUid("u1", "gps.position.latitude", 3);
      expect(store().photoArray[0].gps).toEqual({ position: { latitude: 3 } });
    });

    it("replaces a non-object value along a nested key with an object", () => {
      store().updatePhotoPropertyByUid("u1", "title", "Sea");
      store().updatePhotoPropertyByUid("u1", "title.main", "Sky");
      expect(store().photoArray[0].title).toEqual({ main: "Sky" });
    });

    it("ignores an unknown uid", () => {
      const before = store().photoArray;
      store().updatePhotoPropertyByUid("missing", "status", "done");
      expect(store().photoArray).toBe(before);
    });

    it("ignores a uid whose index has no photo", () => {
      useUploadPhotoStore.setState({ uidHashmap: { u1: 0, ghost: 5 } });
      const before = store().photoArray;
      store().updatePhotoPropertyByUid("ghost", "status", "done");
      expect(store().photoArray).toBe(before);
    });
  });

  it("setPhotoUploadResponse stores the response and maps its id", () => {
    add("u1");
    const response = signedPhoto("p1");

    store().setPhotoUploadResponse("u1", response);

    expect(store().photoIdHashmap).toEqual({ p1: 0 });
    expect(store().photoArray[0].response).toBe(response);
  });

  describe("updatePhotoPropertyById", () => {
    it("sets the property of the photo with that response id", () => {
      add("u1");
      store().setPhotoUploadResponse("u1", signedPhoto("p1"));

      store().updatePhotoPropertyById("p1", "title", "Sky");

      expect(store().photoArray[0].title).toBe("Sky");
    });

    it("ignores an unknown id", () => {
      add("u1");
      const before = store().photoArray;
      store().updatePhotoPropertyById("missing", "title", "Sky");
      expect(store().photoArray).toBe(before);
      expect(store().photoArray[0].title).toBeUndefined();
    });

    it("ignores an id whose index has no photo", () => {
      useUploadPhotoStore.setState({ photoIdHashmap: { ghost: 3 } });
      const before = store().photoArray;
      store().updatePhotoPropertyById("ghost", "title", "Sky");
      expect(store().photoArray).toBe(before);
    });
  });

  describe("removePhotoByUid", () => {
    beforeEach(() => {
      add("u1");
      add("u2");
      add("u3");
      store().setPhotoUploadResponse("u3", signedPhoto("p3"));
    });

    it("ignores an unknown uid", () => {
      const before = store().photoArray;
      store().removePhotoByUid("missing");
      expect(store().photoArray).toBe(before);
    });

    it("removes the photo, rebuilds the maps and selects the first photo when the selected one is removed", () => {
      store().setSelectedPhotoByUid("u1");

      store().removePhotoByUid("u1");

      expect(store().photoArray.map((p) => p.file.uid)).toEqual(["u2", "u3"]);
      expect(store().uidHashmap).toEqual({ u2: 0, u3: 1 });
      expect(store().photoIdHashmap).toEqual({ p3: 1 });
      expect(store().selectedPhoto).toBe("u2");
    });

    it("keeps another selection", () => {
      store().setSelectedPhotoByUid("u3");
      store().removePhotoByUid("u1");
      expect(store().selectedPhoto).toBe("u3");
    });

    it("clears the selection when the last photo is removed", () => {
      store().removePhotoByUid("u2");
      store().removePhotoByUid("u3");
      store().setSelectedPhotoByUid("u1");

      store().removePhotoByUid("u1");

      expect(store().photoArray).toEqual([]);
      expect(store().selectedPhoto).toBeNull();
    });
  });

  describe("removePhotoById", () => {
    beforeEach(() => {
      add("u1");
      add("u2");
      store().setPhotoUploadResponse("u1", signedPhoto("p1"));
      store().setPhotoUploadResponse("u2", signedPhoto("p2"));
    });

    it("removes the photo and selects the first photo when the selected one is removed", () => {
      store().setSelectedPhotoByUid("u1");

      store().removePhotoById("p1");

      expect(store().photoArray.map((p) => p.file.uid)).toEqual(["u2"]);
      expect(store().uidHashmap).toEqual({ u2: 0 });
      expect(store().photoIdHashmap).toEqual({ p2: 0 });
      expect(store().selectedPhoto).toBe("u2");
    });

    it("keeps another selection and rebuilds maps for photos without a response", () => {
      add("u3");
      store().setSelectedPhotoByUid("u3");

      store().removePhotoById("p2");

      expect(store().uidHashmap).toEqual({ u1: 0, u3: 1 });
      expect(store().photoIdHashmap).toEqual({ p1: 0 });
      expect(store().selectedPhoto).toBe("u3");
    });

    it("clears the selection when the last photo is removed", () => {
      store().removePhotoById("p2");
      store().setSelectedPhotoByUid("u1");
      store().removePhotoById("p1");
      expect(store().selectedPhoto).toBeNull();
    });

    it("ignores an id mapped to -1", () => {
      useUploadPhotoStore.setState({ photoIdHashmap: { gone: -1 } });
      const before = store().photoArray;
      store().removePhotoById("gone");
      expect(store().photoArray).toBe(before);
    });
  });

  it("clearState empties the queue but keeps the map modal flag", () => {
    add("u1");
    store().setSelectedPhotoByUid("u1");
    store().setIsOpenDraftModal(true);
    store().setIsOpenMapModal(true);
    useUploadPhotoStore.setState({ isUpdatingPhotos: true });

    store().clearState();

    const state = store();
    expect(state.photoIdHashmap).toEqual({});
    expect(state.uidHashmap).toEqual({});
    expect(state.photoArray).toEqual([]);
    expect(state.selectedPhoto).toBeNull();
    expect(state.isUpdatingPhotos).toBe(false);
    expect(state.isOpenDraftModal).toBe(false);
    expect(state.isOpenMapModal).toBe(true);
  });

  it("setIsOpenDraftModal and setIsOpenMapModal store the flags", () => {
    store().setIsOpenDraftModal(true);
    store().setIsOpenMapModal(true);
    expect(store().isOpenDraftModal).toBe(true);
    expect(store().isOpenMapModal).toBe(true);
  });

  it("isPhotoExistByUid checks the uid field of the queued photos", () => {
    add("u1", { uid: "u1" });
    add("u2");
    expect(store().isPhotoExistByUid("u1")).toBe(true);
    expect(store().isPhotoExistByUid("u2")).toBe(false);
  });

  describe("deleteImageById", () => {
    beforeEach(() => {
      add("u1", { id: "i1" });
      add("u2", { id: "i2" });
    });

    it("removes the image and selects the first remaining one when the selected image is deleted", () => {
      useUploadPhotoStore.setState({ selectedPhoto: { id: "i1" } });

      store().deleteImageById("i1");

      expect(store().photoArray.map((p) => p.id)).toEqual(["i2"]);
      expect(store().selectedPhoto).toBe(store().photoArray[0]);
    });

    it("selects an empty object when no image remains", () => {
      store().deleteImageById("i2");
      useUploadPhotoStore.setState({ selectedPhoto: { id: "i1" } });

      store().deleteImageById("i1");

      expect(store().photoArray).toEqual([]);
      expect(store().selectedPhoto).toEqual({});
    });

    it("keeps a uid or empty selection", () => {
      store().setSelectedPhotoByUid("u1");
      store().deleteImageById("i1");
      expect(store().selectedPhoto).toBe("u1");

      useUploadPhotoStore.setState({ selectedPhoto: null });
      store().deleteImageById("i2");
      expect(store().selectedPhoto).toBeNull();
      expect(store().photoArray).toEqual([]);
    });
  });

  it("toggleWatermark sets the watermark on every photo", () => {
    add("u1");
    add("u2", { watermark: true });

    store().toggleWatermark(false);
    expect(store().photoArray.map((p) => p.watermark)).toEqual([false, false]);

    store().toggleWatermark(true);
    expect(store().photoArray.map((p) => p.watermark)).toEqual([true, true]);
  });

  describe("setNextSelectedPhoto and setPreviousSelectedPhoto", () => {
    beforeEach(() => {
      add("u1");
      add("u2");
      add("u3");
    });

    it("move forward and backward with wrap-around", () => {
      store().setSelectedPhotoByUid("u3");
      store().setNextSelectedPhoto();
      expect(store().selectedPhoto).toBe("u1");
      store().setNextSelectedPhoto();
      expect(store().selectedPhoto).toBe("u2");

      store().setPreviousSelectedPhoto();
      expect(store().selectedPhoto).toBe("u1");
      store().setPreviousSelectedPhoto();
      expect(store().selectedPhoto).toBe("u3");
    });

    it("do nothing without a selection", () => {
      store().setNextSelectedPhoto();
      store().setPreviousSelectedPhoto();
      expect(store().selectedPhoto).toBeNull();
      expect(store().photoArray).toHaveLength(3);
    });

    it("do nothing when the selection is not a queued uid", () => {
      store().setSelectedPhotoByUid("missing");
      store().setNextSelectedPhoto();
      store().setPreviousSelectedPhoto();
      expect(store().selectedPhoto).toBe("missing");

      const selected = { id: "p1" };
      useUploadPhotoStore.setState({ selectedPhoto: selected });
      store().setNextSelectedPhoto();
      store().setPreviousSelectedPhoto();
      expect(store().selectedPhoto).toBe(selected);
    });
  });
});
