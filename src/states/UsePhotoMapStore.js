import { create } from "zustand";
import { devtools } from "zustand/middleware";

const usePhotoMapStore = create(
  devtools((set, get) => ({
    // Set up manage photo list
    photoList: [], // Default is empty array
    isFromPhotoDetailPage: false,
    setIsFromPhotoDetailPage: (value) => set({ isFromPhotoDetailPage: value }),
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
  }))
);

export default usePhotoMapStore;
