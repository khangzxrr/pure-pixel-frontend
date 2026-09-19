import { create } from "zustand";

type ServerSideState = {
  activeLinkServer: string | null;
  setActiveLinkServer: (link: string | null) => void;
};

const UseServerSideStore = create<ServerSideState>()((set) => ({
  activeLinkServer: null,
  setActiveLinkServer: (link) => set({ activeLinkServer: link }),
}));

export default UseServerSideStore;
