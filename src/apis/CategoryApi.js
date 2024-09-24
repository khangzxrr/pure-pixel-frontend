import http from "../configs/Http";

const getAllCategories = async () => {
  const response = await http.get("category");

  return response.data;
};

export const CategoryApi = {
  getAllCategories,
};
