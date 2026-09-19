import useBookingPhotoStore, { type BookingPhotoItem } from "./UseBookingPhotoStore";

const store = () => useBookingPhotoStore.getState();

const add = (uid: string, extra: Partial<BookingPhotoItem> = {}) =>
  store().addPhoto(uid, { uid, status: "uploading", ...extra });

describe("useBookingPhotoStore", () => {
  beforeEach(() => {
    // fresh containers: the actions mutate the maps and the array in place
    useBookingPhotoStore.setState({
      photoIdHashmap: {},
      uidHashmap: {},
      photoArray: [],
      selectedPhoto: null,
      isUpdatingPhotos: false,
      isOpenDraftModal: false,
      isOpenMapModal: false,
    });
  });

  it("starts with no photos", () => {
    const initial = useBookingPhotoStore.getInitialState();
    expect(initial.photoIdHashmap).toEqual({});
    expect(initial.uidHashmap).toEqual({});
    expect(initial.photoArray).toEqual([]);
    expect(initial.selectedPhoto).toBeNull();
    expect(initial.isUpdatingPhotos).toBe(false);
    expect(initial.isOpenDraftModal).toBe(false);
    expect(initial.isOpenMapModal).toBe(false);
  });

  it("addPhoto queues a photo that getPhotoByUid finds", () => {
    add("u1", { reviewUrl: "blob:1" });

    expect(store().uidHashmap).toEqual({ u1: 0 });
    expect(store().getPhotoByUid("u1")?.reviewUrl).toBe("blob:1");
    expect(store().getPhotoByUid("missing")).toBeUndefined();
  });

  it("setSelectedPhotoByUid selects a uid", () => {
    store().setSelectedPhotoByUid("u1");
    expect(store().selectedPhoto).toBe("u1");
  });

  describe("addPhotoWithId", () => {
    it("adds an uploaded photo under both maps", () => {
      store().addPhotoWithId("p1", { uid: "p1", id: "p1", status: "done" });
      expect(store().uidHashmap).toEqual({ p1: 0 });
      expect(store().photoIdHashmap).toEqual({ p1: 0 });
      expect(store().photoArray).toHaveLength(1);
    });

    it("ignores a uid that is already known", () => {
      store().addPhotoWithId("p1", { uid: "p1", id: "p1" });
      const before = store().photoArray;
      store().addPhotoWithId("p1", { uid: "p1", id: "p1" });
      expect(store().photoArray).toBe(before);
      expect(store().photoArray).toHaveLength(1);
    });

    it("ignores a uid that is only known as a photo id", () => {
      useBookingPhotoStore.setState({ photoIdHashmap: { p1: 0 } });
      store().addPhotoWithId("p1", { uid: "p1", id: "p1" });
      expect(store().photoArray).toEqual([]);
    });
  });

  describe("updateSelectedPhotoProperty", () => {
    it("sets the property on an object selection", () => {
      useBookingPhotoStore.setState({ selectedPhoto: { id: "p1" } });
      store().updateSelectedPhotoProperty("status", "done");
      expect(store().selectedPhoto).toEqual({ id: "p1", status: "done" });
    });

    it("leaves a uid selection unchanged", () => {
      store().setSelectedPhotoByUid("u1");
      store().updateSelectedPhotoProperty("status", "done");
      expect(store().selectedPhoto).toBe("u1");
    });
  });

  describe("updatePhotoPropertyByUid", () => {
    beforeEach(() => {
      add("u1");
    });

    it("sets a top level property and returns a new array", () => {
      const before = store().photoArray;
      store().updatePhotoPropertyByUid("u1", "percent", 40);
      expect(store().photoArray[0].percent).toBe(40);
      expect(store().photoArray).not.toBe(before);
    });

    it("sets nested properties, creating or replacing objects on the way", () => {
      store().updatePhotoPropertyByUid("u1", "meta.size.width", 10);
      store().updatePhotoPropertyByUid("u1", "meta.size.height", 20);
      expect(store().photoArray[0].meta).toEqual({
        size: { width: 10, height: 20 },
      });

      store().updatePhotoPropertyByUid("u1", "status.code", 1);
      expect(store().photoArray[0].status).toEqual({ code: 1 });
    });

    it("ignores an unknown uid or a uid without a photo", () => {
      useBookingPhotoStore.setState({ uidHashmap: { u1: 0, ghost: 4 } });
      const before = store().photoArray;
      store().updatePhotoPropertyByUid("missing", "percent", 40);
      store().updatePhotoPropertyByUid("ghost", "percent", 40);
      expect(store().photoArray).toBe(before);
    });
  });

  describe("setPhotoUploadResponse", () => {
    it("merges the response into the photo and maps its id", () => {
      add("u1");

      store().setPhotoUploadResponse("u1", {
        id: "p1",
        reviewUrl: "https://cdn/p1.jpg",
        thumbnailUrl: "https://cdn/p1_t.jpg",
      });

      expect(store().photoIdHashmap).toEqual({ p1: 0 });
      expect(store().photoArray[0]).toEqual({
        uid: "u1",
        status: "uploading",
        id: "p1",
        reviewUrl: "https://cdn/p1.jpg",
        thumbnailUrl: "https://cdn/p1_t.jpg",
      });
    });

    it("ignores an unknown uid", () => {
      const before = store().photoArray;
      store().setPhotoUploadResponse("missing", { id: "p1" });
      expect(store().photoArray).toBe(before);
      expect(store().photoIdHashmap).toEqual({});
    });
  });

  describe("updatePhotoPropertyById", () => {
    it("sets the property of the photo with that id", () => {
      store().addPhotoWithId("p1", { uid: "p1", id: "p1" });
      store().updatePhotoPropertyById("p1", "status", "done");
      expect(store().photoArray[0].status).toBe("done");
    });

    it("ignores an unknown id or an id without a photo", () => {
      useBookingPhotoStore.setState({ photoIdHashmap: { ghost: 2 } });
      const before = store().photoArray;
      store().updatePhotoPropertyById("missing", "status", "done");
      store().updatePhotoPropertyById("ghost", "status", "done");
      expect(store().photoArray).toBe(before);
    });
  });

  describe("removePhotoByUid", () => {
    beforeEach(() => {
      add("u1");
      add("u2");
      add("u3");
    });

    it("ignores an unknown uid", () => {
      const before = store().photoArray;
      store().removePhotoByUid("missing");
      expect(store().photoArray).toBe(before);
    });

    it("removes the photo and selects the last photo when the selected one is removed", () => {
      store().setSelectedPhotoByUid("u1");

      store().removePhotoByUid("u1");

      expect(store().photoArray.map((p) => p.uid)).toEqual(["u2", "u3"]);
      expect(store().uidHashmap).toEqual({ u2: 0, u3: 1 });
      // the id map is rebuilt from `photoId`, which booking photos never have
      expect(store().photoIdHashmap).toEqual({ undefined: 1 });
      expect(store().selectedPhoto).toBe("u3");
    });

    it("keeps another selection", () => {
      store().setSelectedPhotoByUid("u2");
      store().removePhotoByUid("u1");
      expect(store().selectedPhoto).toBe("u2");
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
      store().addPhotoWithId("p1", { uid: "p1", id: "p1" });
      store().addPhotoWithId("p2", { uid: "p2", id: "p2" });
      add("u3");
    });

    it("removes the photo and selects the last photo when the selected one is removed", () => {
      store().setSelectedPhotoByUid("p1");

      store().removePhotoById("p1");

      expect(store().photoArray.map((p) => p.uid)).toEqual(["p2", "u3"]);
      expect(store().uidHashmap).toEqual({ p2: 0, u3: 1 });
      expect(store().photoIdHashmap).toEqual({ p2: 0, undefined: 1 });
      expect(store().selectedPhoto).toBe("u3");
    });

    it("keeps another selection", () => {
      store().setSelectedPhotoByUid("p2");
      store().removePhotoById("p1");
      expect(store().selectedPhoto).toBe("p2");
    });

    it("clears the selection when the last photo is removed", () => {
      useBookingPhotoStore.setState({
        photoIdHashmap: { p1: 0 },
        uidHashmap: { p1: 0 },
        photoArray: [{ uid: "p1", id: "p1" }],
        selectedPhoto: "p1",
      });
      store().removePhotoById("p1");
      expect(store().selectedPhoto).toBeNull();
    });

    it("ignores an id mapped to -1", () => {
      useBookingPhotoStore.setState({ photoIdHashmap: { gone: -1 } });
      const before = store().photoArray;
      store().removePhotoById("gone");
      expect(store().photoArray).toBe(before);
    });
  });

  it("clearState empties the photos but keeps the map modal flag", () => {
    add("u1");
    store().setSelectedPhotoByUid("u1");
    useBookingPhotoStore.setState({
      isUpdatingPhotos: true,
      isOpenDraftModal: true,
      isOpenMapModal: true,
    });

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

  it("isPhotoExistByUid checks the uid of the photos", () => {
    add("u1");
    expect(store().isPhotoExistByUid("u1")).toBe(true);
    expect(store().isPhotoExistByUid("u2")).toBe(false);
  });

  describe("deleteImageById", () => {
    beforeEach(() => {
      store().addPhotoWithId("p1", { uid: "p1", id: "p1" });
      store().addPhotoWithId("p2", { uid: "p2", id: "p2" });
    });

    it("selects the first remaining image when the selected image is deleted", () => {
      useBookingPhotoStore.setState({ selectedPhoto: { id: "p1" } });
      store().deleteImageById("p1");
      expect(store().photoArray.map((p) => p.id)).toEqual(["p2"]);
      expect(store().selectedPhoto).toBe(store().photoArray[0]);
    });

    it("selects an empty object when no image remains", () => {
      store().deleteImageById("p2");
      useBookingPhotoStore.setState({ selectedPhoto: { id: "p1" } });
      store().deleteImageById("p1");
      expect(store().selectedPhoto).toEqual({});
    });

    it("keeps a uid or empty selection", () => {
      store().setSelectedPhotoByUid("p1");
      store().deleteImageById("p1");
      expect(store().selectedPhoto).toBe("p1");

      useBookingPhotoStore.setState({ selectedPhoto: null });
      store().deleteImageById("p2");
      expect(store().selectedPhoto).toBeNull();
    });
  });

  describe("setNextSelectedPhoto and setPreviousSelectedPhoto", () => {
    beforeEach(() => {
      add("u1");
      add("u2");
      add("u3");
    });

    it("setNextSelectedPhoto moves backward and setPreviousSelectedPhoto moves forward, with wrap-around", () => {
      store().setSelectedPhotoByUid("u1");
      store().setNextSelectedPhoto();
      expect(store().selectedPhoto).toBe("u3");

      store().setPreviousSelectedPhoto();
      expect(store().selectedPhoto).toBe("u1");
      store().setPreviousSelectedPhoto();
      expect(store().selectedPhoto).toBe("u2");
    });

    it("keep the store intact without a selection", () => {
      store().setNextSelectedPhoto();
      store().setPreviousSelectedPhoto();
      const state = store();
      expect(state).toBeDefined();
      expect(state.selectedPhoto).toBeNull();
      expect(state.photoArray).toHaveLength(3);
    });

    it("keep the store intact when the selection is not a known uid", () => {
      store().setSelectedPhotoByUid("missing");
      store().setNextSelectedPhoto();
      store().setPreviousSelectedPhoto();
      expect(store().selectedPhoto).toBe("missing");
      expect(store().photoArray).toHaveLength(3);

      const selected = { id: "p1" };
      useBookingPhotoStore.setState({ selectedPhoto: selected });
      store().setNextSelectedPhoto();
      store().setPreviousSelectedPhoto();
      expect(store().selectedPhoto).toBe(selected);
    });
  });
});
