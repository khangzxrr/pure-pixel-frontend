import create from "zustand";

const useMapboxState = create((set) => ({
  selectedLocate: null,
  setSelectedLocate: (location) => set({ selectedLocate: location }),
}));

export default useMapboxState;
