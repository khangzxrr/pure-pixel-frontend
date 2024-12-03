import { create } from "zustand";
import { devtools } from "zustand/middleware";

const usePhotoMapStore = create(
  devtools((set, get) => ({
    // Set up manage photo list
    photoList: [], // Default is empty array
    setPhotoList: (value) => set({ photoList: value }),
    addMultiplePhotosToList: (newPhotos) =>
      set((state) => ({ photoList: [...state.photoList, ...newPhotos] })),

    removePhoto: (photo) =>
      set((state) => ({
        photoList: state.photoList.filter((p) => p.id !== photo.id),
      })),
    clearPhotoList: () => set({ photoList: [] }),

    // Set up manage selected photo
    selectedPhoto: null, // Default is null
    setSelectedPhoto: (photo) =>
      set({
        selectedPhoto: {
          id: photo.id,
          photo_id: photo.id,
          photographer_id: photo.photographer.id,
          title: photo.title,
          photo_url: photo.signedUrl.thumbnail,
          latitude: photo.exif.latitude,
          longitude: photo.exif.longitude,
        },
      }),

    clearSelectedPhoto: () => set({ selectedPhoto: null }),

    // Set next selected photo
    setNextSelectedPhoto: () => {
      const { photoList, selectedPhoto } = get();
      if (photoList.length > 0 && selectedPhoto) {
        const currentIndex = photoList.findIndex(
          (p) => p.id === selectedPhoto.id
        );
        const nextIndex = (currentIndex + 1) % photoList.length;

        set({
          selectedPhoto: {
            id: photoList[nextIndex].id,
            photo_id: photoList[nextIndex].id,
            photographer_id: photoList[nextIndex].photographer.id,
            title: photoList[nextIndex].title,
            photo_url: photoList[nextIndex].signedUrl.thumbnail,
            latitude: photoList[nextIndex].exif.latitude,
            longitude: photoList[nextIndex].exif.longitude,
          },
        });
      }
    },

    // Set previous selected photo
    setPreviousSelectedPhoto: () => {
      const { photoList, selectedPhoto } = get();
      if (photoList.length > 0 && selectedPhoto) {
        const currentIndex = photoList.findIndex(
          (p) => p.id === selectedPhoto.id
        );
        const prevIndex =
          (currentIndex - 1 + photoList.length) % photoList.length;
        set({
          selectedPhoto: {
            id: photoList[prevIndex].id,
            photo_id: photoList[prevIndex].id,
            photographer_id: photoList[prevIndex].photographer.id,
            title: photoList[prevIndex].title,
            photo_url: photoList[prevIndex].signedUrl.thumbnail,
            latitude: photoList[prevIndex].exif.latitude,
            longitude: photoList[prevIndex].exif.longitude,
          },
        });
      }
    },
  }))
);

export default usePhotoMapStore;
