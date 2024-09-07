import create from "zustand";
import { ImageList } from "../fakejson/ImageList";

const initialPhotoList = ImageList.map((image) => ({
  ...image,
  currentStep: 1, // Add currentStep to each photo
}));

const useUploadPhotoStore = create((set) => ({
  photoList: initialPhotoList,
  selectedPhoto: initialPhotoList[0] || {}, // Initialize with the first element
  photoDetails: {},
  photoExtraOption: {},
  deleteImageById: (id) =>
    set((state) => {
      const updatedPhotoList = state.photoList.filter(
        (image) => image.id !== id
      );
      const isDeletedSelected = state.selectedPhoto.id === id;
      return {
        photoList: updatedPhotoList,
        selectedPhoto: isDeletedSelected
          ? updatedPhotoList[0] || {}
          : state.selectedPhoto,
      };
    }),
  addSingleImage: () =>
    set((state) => ({
      photoList: [
        ...state.photoList,
        {
          id: state.photoList.length + 1,
          image: "https://picsum.photos/200/300",
          imageDetails: "",
          additionalDetails: "",
          type: "",
          tag: [],
          location: "",
          private: "",
          addWatermark: true,
          includeEXIF: true,
          currentStep: 1, // Add currentStep to the new image
        },
      ],
    })),
  setSelectedPhoto: (photo) => set({ selectedPhoto: photo }),
  updatePhotoList: (photo) =>
    set((state) => {
      const updatedPhotoList = state.photoList.map((image) => {
        if (image.id === photo.id) {
          console.log("photo", photo, image);
          return {
            ...image,
            imageDetails:
              photo.imageDetails !== image.imageDetails
                ? photo.imageDetails
                : image.imageDetails,
            additionalDetails:
              photo.additionalDetails !== image.additionalDetails
                ? photo.additionalDetails
                : image.additionalDetails,
            type: photo.type !== image.type ? photo.type : image.type,
            tag: photo.tag !== image.tag ? photo.tag : image.tag,
            location:
              photo.location !== image.location
                ? photo.location
                : image.location,
            private:
              photo.private !== image.private ? photo.private : image.private,
            addWatermark:
              photo.addWatermark !== image.addWatermark
                ? photo.addWatermark
                : image.addWatermark,
            includeEXIF:
              photo.includeEXIF !== image.includeEXIF
                ? photo.includeEXIF
                : image.includeEXIF,
            currentStep:
              photo.currentStep !== image.currentStep
                ? photo.currentStep
                : image.currentStep,
          };
        }
        return image;
      });

      return { photoList: updatedPhotoList, selectedPhoto: photo };
    }),
  setCurrentStep: (id, step) =>
    set((state) => ({
      photoList: state.photoList.map((image) =>
        image.id === id ? { ...image, currentStep: step } : image
      ),
      selectedPhoto:
        state.selectedPhoto.id === id
          ? { ...state.selectedPhoto, currentStep: step }
          : state.selectedPhoto,
    })),
}));

export default useUploadPhotoStore;
