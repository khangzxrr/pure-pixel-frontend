import { create } from "zustand";

const LAST_SEEN_KEY = "changelogLastSeenAt";

type ChangeLogState = {
  lastSeenAt: string | null;
  markSeen: (publishedAt: string) => void;
};

const readLastSeenAt = () => {
  try {
    return window.localStorage.getItem(LAST_SEEN_KEY);
  } catch {
    return null;
  }
};

// publishedAt of the newest change log entry this browser has opened
const UseChangeLogStore = create<ChangeLogState>()((set) => ({
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
