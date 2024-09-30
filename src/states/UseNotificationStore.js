import create from "zustand";

const UseNotificationStore = create((set) => ({
  isNotificationOpen: false,
  toggleNotificationModal: () =>
    set((state) => ({ isNotificationOpen: !state.isNotificationOpen })),
}));

export default UseNotificationStore;
