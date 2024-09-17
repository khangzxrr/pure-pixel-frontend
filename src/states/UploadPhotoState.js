import { create } from "zustand";

const initialPhotoList = [];

const useUploadPhotoStore = create((set) => ({
  photoList: initialPhotoList,
  selectedPhoto: initialPhotoList[0] || {}, // Initialize with the first photo if it exists
  photoExtraOption: {},
  isUpdatingPhotos: false,

  // Clear all state (reset photoList and selectedPhoto)
  clearState: () => {
    set({
      photoList: [],
      selectedPhoto: {},
    });
  },

  // Set the isUpdatingPhotos flag
  setIsUpdating: (isUpdating) => {
    set({ isUpdatingPhotos: isUpdating });
  },


  setIsUpdating: (isUpdating) => {
    set({ isUpdatingPhotos: isUpdating });
  },
  
    // Add a single photo to the photoList with currentStep default set to 1
  addSingleImage: (photo) =>
    set((state) => ({
      photoList: [
        ...(Array.isArray(state.photoList) ? state.photoList : []),
        {
          ...photo,

          currentStep: 1, // Assign currentStep to the new image
        },
      ],
    })),

  // Check if a photo with the given UID exists in the list

  isPhotoExistByUid: (uid) => {
    const state = useUploadPhotoStore.getState();
    return state.photoList.some((photo) => photo.uid === uid);
  },

  // Update photo data by UID
  updatePhotoByUid: (uid, newPhoto) =>
    set((state) => {
      console.log("Updating photo by UID:", uid);
      return {
        photoList: state.photoList.map((photo) => {
          if (photo.uid === uid) {
            console.log("Updating photo name:", photo.name); // Log the photo name
            return {
              ...photo,
              ...newPhoto,
              title: photo.name, // Set title to the name of the existing photo
              currentStep: photo.currentStep, // Keep the current step
            };
          }
          return photo;
        }),
      };
    }),

  // Delete photo by ID

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
  // Remove photo by UID
  removePhotoByUid: (uid) =>
    set((state) => {
      const updatedPhotoList = state.photoList.filter(
        (photo) => photo.uid !== uid
      );

      // Check if the removed photo was the selected one
      const isDeletedSelected = state.selectedPhoto.uid === uid;

      // If the deleted photo was selected, set the selectedPhoto to the first one in the updated list
      const newSelectedPhoto = isDeletedSelected
        ? updatedPhotoList[0] || {}
        : state.selectedPhoto;

      return {
        photoList: updatedPhotoList,
        selectedPhoto: newSelectedPhoto, // Update selectedPhoto here
      };
    }),
  // Set the currently selected photo
  setSelectedPhoto: (photo) =>
    set(() => {
      console.log("Setting selected photo:", photo);
      return { selectedPhoto: photo };
    }),

  // Update the current step of a photo by ID

  setCurrentStep: (id, step) =>
    set((state) => {
      const photoList = [...state.photoList]; // Shallow copy of photoList
      const photoIndex = photoList.findIndex((image) => image.id === id);

      if (photoIndex !== -1) {
        photoList[photoIndex] = { ...photoList[photoIndex], currentStep: step };
      }

      const selectedPhoto =
        state.selectedPhoto.id === id
          ? { ...state.selectedPhoto, currentStep: step }
          : state.selectedPhoto;

      return { photoList, selectedPhoto };
    }),

  // Update a specific field of a photo by ID
  updateField: (id, field, value) =>
    set((state) => {
      const photoList = [...state.photoList]; // Shallow copy of photoList
      const photoIndex = photoList.findIndex((image) => image.id === id);

      if (photoIndex !== -1) {
        const updatedPhoto = {
          ...photoList[photoIndex],
          [field]: value,
        };

        photoList[photoIndex] = updatedPhoto;

        const selectedPhoto =
          state.selectedPhoto.id === id ? updatedPhoto : state.selectedPhoto;

        return { photoList, selectedPhoto };
      }
    }),
}));

export default useUploadPhotoStore;
