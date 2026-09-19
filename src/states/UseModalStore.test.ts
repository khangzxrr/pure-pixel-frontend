import useModalStore from "./UseModalStore";

const initialState = useModalStore.getState();

describe("useModalStore", () => {
  beforeEach(() => {
    // fresh objects, since updateSelectedUpdatePhotoField mutates nested objects
    useModalStore.setState(
      {
        ...initialState,
        selectedUpdatePhoto: {},
        selectedUpgradePackage: {},
        selectedUpdatePhotoshootPackage: {},
        deleteShowcasesList: [],
      },
      true
    );
  });

  it("starts with every modal closed", () => {
    const state = useModalStore.getState();
    expect(state.isUpdatePhotoModal).toBe(false);
    expect(state.isUpdateOpenMapModal).toBe(false);
    expect(state.isDeletePhotoConfirmModal).toBe(false);
    expect(state.deletePhotoId).toBe("");
    expect(state.numberOfRecord).toBe(0);
    expect(state.isUpgradePackageQRModal).toBe(false);
    expect(state.isUpgradePaymentModal).toBe(false);
    expect(state.selectedUpdatePhoto).toEqual({});
    expect(state.selectedUpgradePackage).toEqual({});
    expect(state.isUpdateProfileModalVisible).toBe(false);
    expect(state.isUpdatePhotoshootPackageModal).toBe(false);
    expect(state.selectedUpdatePhotoshootPackage).toEqual({});
    expect(state.deleteShowcasesList).toEqual([]);
  });

  it("stores the modal flags", () => {
    const store = useModalStore.getState();
    store.setIsUpdatePhotoModal(true);
    store.setIsUpdateOpenMapModal(true);
    store.setIsDeletePhotoConfirmModal(true);
    store.setIsUpgradePackageQRModal(true);
    store.setIsUpgradePaymentModal(true);
    store.setIsUpdateProfileModalVisible(true);
    store.setIsUpdatePhotoshootPackageModal(true);
    const state = useModalStore.getState();
    expect(state.isUpdatePhotoModal).toBe(true);
    expect(state.isUpdateOpenMapModal).toBe(true);
    expect(state.isDeletePhotoConfirmModal).toBe(true);
    expect(state.isUpgradePackageQRModal).toBe(true);
    expect(state.isUpgradePaymentModal).toBe(true);
    expect(state.isUpdateProfileModalVisible).toBe(true);
    expect(state.isUpdatePhotoshootPackageModal).toBe(true);
  });

  it("stores the photo to delete and the record count", () => {
    useModalStore.getState().setDeletePhotoId("p1");
    useModalStore.getState().setNumberOfRecord(7);
    expect(useModalStore.getState().deletePhotoId).toBe("p1");
    expect(useModalStore.getState().numberOfRecord).toBe(7);
  });

  it("stores the selected upgrade package and photoshoot package", () => {
    const packageItem = {
      id: "pkg-1",
      name: "Gold",
      migratePrice: 0,
      minOrderMonth: 1,
      maxPackageCount: "5",
      maxPhotoQuota: "1000",
    };
    useModalStore.getState().setSelectedUpgradePackage(packageItem);
    useModalStore.getState().setSelectedUpdatePhotoshootPackage("shoot-1");
    expect(useModalStore.getState().selectedUpgradePackage).toBe(packageItem);
    expect(useModalStore.getState().selectedUpdatePhotoshootPackage).toBe(
      "shoot-1"
    );
  });

  it("setSelectedPhoto stores the photo being edited", () => {
    const photo = { id: "p1", title: "Sea", isChangeGPS: false };
    useModalStore.getState().setSelectedPhoto(photo);
    expect(useModalStore.getState().selectedUpdatePhoto).toBe(photo);
  });

  describe("updateSelectedUpdatePhotoField", () => {
    it("sets a top level field on a copy of the photo", () => {
      const photo = { id: "p1", title: "Sea" };
      useModalStore.getState().setSelectedPhoto(photo);

      useModalStore.getState().updateSelectedUpdatePhotoField("title", "Sky");

      const selected = useModalStore.getState().selectedUpdatePhoto;
      expect(selected).toEqual({ id: "p1", title: "Sky" });
      expect(selected).not.toBe(photo);
      expect(photo.title).toBe("Sea");
    });

    it("sets a nested field inside an existing object", () => {
      useModalStore
        .getState()
        .setSelectedPhoto({ id: "p1", exif: { latitude: 1, longitude: 2 } });

      useModalStore
        .getState()
        .updateSelectedUpdatePhotoField("exif.latitude", 10.5);

      expect(useModalStore.getState().selectedUpdatePhoto.exif).toEqual({
        latitude: 10.5,
        longitude: 2,
      });
    });

    it("creates the missing objects along a nested key", () => {
      useModalStore.getState().setSelectedPhoto({ id: "p1" });

      useModalStore
        .getState()
        .updateSelectedUpdatePhotoField("gps.position.latitude", 3);

      expect(useModalStore.getState().selectedUpdatePhoto).toEqual({
        id: "p1",
        gps: { position: { latitude: 3 } },
      });
    });

    it("replaces a non-object value along a nested key with an object", () => {
      useModalStore.getState().setSelectedPhoto({ id: "p1", gps: "none" });

      useModalStore.getState().updateSelectedUpdatePhotoField("gps.latitude", 3);

      expect(useModalStore.getState().selectedUpdatePhoto.gps).toEqual({
        latitude: 3,
      });
    });

    it("keeps the rest of the state", () => {
      useModalStore.getState().setIsUpdatePhotoModal(true);
      useModalStore.getState().updateSelectedUpdatePhotoField("title", "Sky");
      expect(useModalStore.getState().isUpdatePhotoModal).toBe(true);
    });
  });

  it("setDeleteShowcasesList appends ids and clearDeleteShowcasesList empties the list", () => {
    useModalStore.getState().setDeleteShowcasesList("s1");
    useModalStore.getState().setDeleteShowcasesList("s2");
    expect(useModalStore.getState().deleteShowcasesList).toEqual(["s1", "s2"]);

    useModalStore.getState().clearDeleteShowcasesList();
    expect(useModalStore.getState().deleteShowcasesList).toEqual([]);
  });
});
