import http from "./../configs/Http";
import type { ResponseOf } from "./types";

const getAllNewsfeed = async (limit: number, page: number) => {
  const params = {
    limit: String(limit),
    page: String(page),
  };

  const queryString = new URLSearchParams(params).toString();
  const url = `/newsfeed?${queryString}`;

  const response =
    await http.get<ResponseOf<"NewsfeedController_findAll">>(url);
  return response.data;
};

const NewsfeedApi = {
  getAllNewsfeed,
};

export default NewsfeedApi;
