import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Schema } from "../apis/types";

// the map reads GPS coordinates from the free-form exif object
export type MapPhoto = Omit<Schema<"SignedPhotoDto">, "exif"> & {
  exif: { latitude?: number; longitude?: number; [key: string]: unknown };
};

export type MapSelectedPhoto = {
  id: string;
  photo_id: string;
  photographer_id: string;
  title: string;
  photo_url: string;
  latitude: number | undefined;
  longitude: number | undefined;
  // read by the map page, never set by this store
  address?: string;
};

type PhotoMapState = {
  photoList: MapPhoto[];
  isFromPhotoDetailPage: boolean;
  setIsFromPhotoDetailPage: (value: boolean) => void;
  setPhotoList: (value: MapPhoto[]) => void;
  addMultiplePhotosToList: (newPhotos: MapPhoto[]) => void;
  removePhoto: (photo: Pick<MapPhoto, "id">) => void;
  clearPhotoList: () => void;
  selectedPhoto: MapSelectedPhoto | null;
  setSelectedPhoto: (photo: MapPhoto) => void;
  clearSelectedPhoto: () => void;
};

const usePhotoMapStore = create<PhotoMapState>()(
  devtools((set) => ({
    // Set up manage photo list
    photoList: [], // Default is empty array
    // page: 1,
    isFromPhotoDetailPage: false,
    setIsFromPhotoDetailPage: (value) => set({ isFromPhotoDetailPage: value }),
    setPhotoList: (value) => set({ photoList: value }),
    // setPage: (value) => set({ page: value }),
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
