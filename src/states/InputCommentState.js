import create from "zustand";

const useCommentStore = create((set) => ({
  inputComment: "",
  setInputComment: (comment) => set({ inputComment: comment }),
}));

export default useCommentStore;
