import http from "../configs/Http";
import type { ResponseOf } from "./types";

const getAllCategories = async () => {
  const response =
    await http.get<ResponseOf<"PhotoCategoryController_findAll">>("category");

  return response.data;
};

export const CategoryApi = {
  getAllCategories,
};
