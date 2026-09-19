import type { RcFile } from "antd/es/upload/interface";
import type { Schema } from "../apis/types";
import useSellPhotoStore, { type SellPhotoItem } from "./UseSellPhotoState";

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

const store = () => useSellPhotoStore.getState();

const add = (uid: string, extra: Partial<SellPhotoItem> = {}) =>
  store().addPhoto(uid, { file: rcFile(uid), status: "uploading", ...extra });

describe("useSellPhotoStore", () => {
  beforeEach(() => {
    // fresh containers: the actions mutate the maps and the array in place
    useSellPhotoStore.setState({
      photoIdHashmap: {},
      uidHashmap: {},
      photoArray: [],
      selectedPhoto: null,
      isUpdatingPhotos: false,
      isOpenDraftModal: false,
      isOpenMapModal: false,
      disableUpload: false,
    });
  });

  it("starts with an empty queue and upload enabled", () => {
    const initial = useSellPhotoStore.getInitialState();
    expect(initial.photoIdHashmap).toEqual({});
    expect(initial.uidHashmap).toEqual({});
    expect(initial.photoArray).toEqual([]);
    expect(initial.selectedPhoto).toBeNull();
    expect(initial.isUpdatingPhotos).toBe(false);
    expect(initial.isOpenDraftModal).toBe(false);
    expect(initial.isOpenMapModal).toBe(false);
    expect(initial.disableUpload).toBe(false);
  });

  it("setDisableUpload stores the flag", () => {
    store().setDisableUpload(true);
    expect(store().disableUpload).toBe(true);
  });

  it("addPhoto queues a photo that getPhotoByUid finds", () => {
    add("u1", { title: "Sea" });
    expect(store().uidHashmap).toEqual({ u1: 0 });
    expect(store().getPhotoByUid("u1")?.title).toBe("Sea");
    expect(store().getPhotoByUid("missing")).toBeUndefined();
  });

  it("setSelectedPhotoByUid selects a uid, even an undefined one", () => {
    store().setSelectedPhotoByUid("u1");
    expect(store().selectedPhoto).toBe("u1");
    store().setSelectedPhotoByUid(undefined);
    expect(store().selectedPhoto).toBeUndefined();
  });

  describe("updatePhotoPropertyByUid", () => {
    beforeEach(() => {
      add("u1", { exif: { latitude: 1 } });
    });

    it("sets a top level property and returns a new array", () => {
      const before = store().photoArray;
      store().updatePhotoPropertyByUid("u1", "status", "done");
      expect(store().photoArray[0].status).toBe("done");
      expect(store().photoArray).not.toBe(before);
    });

    it("sets nested properties, creating or replacing objects on the way", () => {
      store().updatePhotoPropertyByUid("u1", "exif.longitude", 2);
      expect(store().photoArray[0].exif).toEqual({ latitude: 1, longitude: 2 });

      store().updatePhotoPropertyByUid("u1", "gps.position.latitude", 3);
      expect(store().photoArray[0].gps).toEqual({ position: { latitude: 3 } });

      store().updatePhotoPropertyByUid("u1", "status.code", 1);
      expect(store().photoArray[0].status).toEqual({ code: 1 });
    });

    it("ignores an unknown uid or a uid without a photo", () => {
      useSellPhotoStore.setState({ uidHashmap: { u1: 0, ghost: 4 } });
      const before = store().photoArray;
      store().updatePhotoPropertyByUid("missing", "status", "done");
      store().updatePhotoPropertyByUid("ghost", "status", "done");
      expect(store().photoArray).toBe(before);
    });
  });

  describe("updateArrayElementByUid", () => {
    const pricetags = () => [
      { width: 100, height: 80, price: 0 },
      { width: 50, height: 40, price: 0 },
    ];

    beforeEach(() => {
      add("u1", { pricetags: pricetags(), tags: ["a", "b"] });
    });

    it("updates a property of an object element in a copy of the array", () => {
      const before = store().photoArray[0].pricetags;

      store().updateArrayElementByUid("u1", "pricetags", 5000, 1, "price");

      expect(store().photoArray[0].pricetags).toEqual([
        { width: 100, height: 80, price: 0 },
        { width: 50, height: 40, price: 5000 },
      ]);
      expect(before?.[1].price).toBe(0);
    });

    it("keeps the array content for an index out of range", () => {
      store().updateArrayElementByUid("u1", "pricetags", 5000, 2, "price");
      store().updateArrayElementByUid("u1", "pricetags", 5000, -1, "price");
      expect(store().photoArray[0].pricetags).toEqual(pricetags());
    });

    it("keeps the array content when the element is not an object", () => {
      store().updateArrayElementByUid("u1", "tags", "x", 0, "name");
      expect(store().photoArray[0].tags).toEqual(["a", "b"]);
    });

    it("only replaces the array of the target photo", () => {
      add("u2", { pricetags: pricetags() });
      const other = store().photoArray[0];

      store().updateArrayElementByUid("u2", "pricetags", 1, 0, "price");

      expect(store().photoArray[0]).toBe(other);
      expect(store().photoArray[1].pricetags?.[0].price).toBe(1);
    });

    it("ignores an unknown uid, a uid without a photo and a key that is not an array", () => {
      useSellPhotoStore.setState({ uidHashmap: { u1: 0, ghost: 4 } });
      const before = store().photoArray;
      store().updateArrayElementByUid("missing", "pricetags", 1, 0, "price");
      store().updateArrayElementByUid("ghost", "pricetags", 1, 0, "price");
      store().updateArrayElementByUid("u1", "status", 1, 0, "price");
      expect(store().photoArray).toBe(before);
    });
  });

  describe("setPriceByUidAndPricetagIndex", () => {
    it("sets the price of the pricetag", () => {
      add("u1", { pricetags: [{ width: 100, height: 80, price: 0 }] });
      store().setPriceByUidAndPricetagIndex("u1", 0, 20000);
      expect(store().photoArray[0].pricetags?.[0].price).toBe(20000);
    });

    it("does nothing while the photo has no pricetags", () => {
      add("u1");
      store().setPriceByUidAndPricetagIndex("u1", 0, 20000);
      expect(store().photoArray[0].pricetags).toBeUndefined();
    });
  });

  describe("updatePhotoPropertyById", () => {
    it("sets the property of the photo with that response id", () => {
      add("u1");
      store().setPhotoUploadResponse("u1", signedPhoto("p1"));
      store().updatePhotoPropertyById("p1", "title", "Sky");
      expect(store().photoArray[0].title).toBe("Sky");
    });

    it("ignores an id mapped to -1", () => {
      add("u1");
      useSellPhotoStore.setState({ photoIdHashmap: { gone: -1 } });
      const before = store().photoArray;
      store().updatePhotoPropertyById("gone", "title", "Sky");
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

    it("removes the photo and selects the first photo when the selected one is removed", () => {
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

    it("keeps another selection and maps photos without a response by uid only", () => {
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
      useSellPhotoStore.setState({ photoIdHashmap: { gone: -1 } });
      const before = store().photoArray;
      store().removePhotoById("gone");
      expect(store().photoArray).toBe(before);
    });
  });

  it("clearState empties the queue but keeps the map modal and upload flags", () => {
    add("u1");
    store().setSelectedPhotoByUid("u1");
    store().setIsOpenDraftModal(true);
    store().setIsOpenMapModal(true);
    store().setDisableUpload(true);
    useSellPhotoStore.setState({ isUpdatingPhotos: true });

    store().clearState();

    const state = store();
    expect(state.photoIdHashmap).toEqual({});
    expect(state.uidHashmap).toEqual({});
    expect(state.photoArray).toEqual([]);
    expect(state.selectedPhoto).toBeNull();
    expect(state.isUpdatingPhotos).toBe(false);
    expect(state.isOpenDraftModal).toBe(false);
    expect(state.isOpenMapModal).toBe(true);
    expect(state.disableUpload).toBe(true);
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

    it("selects the first remaining image when the selected image is deleted", () => {
      useSellPhotoStore.setState({ selectedPhoto: { id: "i1" } });
      store().deleteImageById("i1");
      expect(store().photoArray.map((p) => p.id)).toEqual(["i2"]);
      expect(store().selectedPhoto).toBe(store().photoArray[0]);
    });

    it("selects an empty object when no image remains", () => {
      store().deleteImageById("i2");
      useSellPhotoStore.setState({ selectedPhoto: { id: "i1" } });
      store().deleteImageById("i1");
      expect(store().selectedPhoto).toEqual({});
    });

    it("keeps a uid or empty selection", () => {
      store().setSelectedPhotoByUid("u1");
      store().deleteImageById("i1");
      expect(store().selectedPhoto).toBe("u1");

      useSellPhotoStore.setState({ selectedPhoto: null });
      store().deleteImageById("i2");
      expect(store().selectedPhoto).toBeNull();
    });
  });

  it("toggleWatermark sets the watermark on every photo", () => {
    add("u1");
    add("u2", { watermark: true });
    store().toggleWatermark(false);
    expect(store().photoArray.map((p) => p.watermark)).toEqual([false, false]);
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

      store().setPreviousSelectedPhoto();
      expect(store().selectedPhoto).toBe("u3");
      store().setPreviousSelectedPhoto();
      expect(store().selectedPhoto).toBe("u2");
    });

    it("do nothing without a selection", () => {
      store().setNextSelectedPhoto();
      store().setPreviousSelectedPhoto();
      expect(store().selectedPhoto).toBeNull();
    });

    it("do nothing when the selection is not a queued uid", () => {
      store().setSelectedPhotoByUid("missing");
      store().setNextSelectedPhoto();
      store().setPreviousSelectedPhoto();
      expect(store().selectedPhoto).toBe("missing");

      const selected = { id: "p1" };
      useSellPhotoStore.setState({ selectedPhoto: selected });
      store().setNextSelectedPhoto();
      store().setPreviousSelectedPhoto();
      expect(store().selectedPhoto).toBe(selected);
    });
  });
});
