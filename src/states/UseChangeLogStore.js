import { create } from "zustand";

const LAST_SEEN_KEY = "changelogLastSeenAt";

const readLastSeenAt = () => {
  try {
    return window.localStorage.getItem(LAST_SEEN_KEY);
  } catch (error) {
    return null;
  }
};

// publishedAt of the newest change log entry this browser has opened
const UseChangeLogStore = create((set) => ({
  lastSeenAt: readLastSeenAt(),
  markSeen: (publishedAt) => {
    try {
      window.localStorage.setItem(LAST_SEEN_KEY, publishedAt);
    } catch (error) {
      console.log(error);
    }
    set({ lastSeenAt: publishedAt });
  },
}));

export default UseChangeLogStore;
