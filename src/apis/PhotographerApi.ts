import http from "../configs/Http";
import type { QueryOf, ResponseOf } from "./types";

type PhotographerQuery =
  QueryOf<"PhotographerController_findAllPhotographers">;
type MyPhotoQuery = QueryOf<"PhotographerController_getPhotoOfMine">;

// POST /photographer/me/upload is not part of the backend API (no generated type)
const getPresignedUploadUrls = async ({
  queryKey,
}: {
  queryKey: readonly [unknown, { filename?: string }];
}) => {
  const [_key, { filename: _filename }] = queryKey;

  const response = await http.post<unknown>(`/photographer/me/upload`, {
    crossdomain: true,
  });

  return response.data;
};

const getAllPhotographers = async (
  limit: number,
  page: number,
  search?: string | null,
  orderByPhotoCount?: PhotographerQuery["orderByPhotoCount"] | null,
  orderByVoteCount?: PhotographerQuery["orderByVoteCount"] | null,
  isFollowed?: boolean | null,
  orderByFollower?: PhotographerQuery["orderByFollower"] | null,
) => {
  const params: Record<string, string> = {
    limit: String(limit),
    page: String(page),
  };
  if (search) {
    params.search = search;
  }
  if (orderByPhotoCount) {
    params.orderByPhotoCount = orderByPhotoCount;
  }
  if (orderByVoteCount) {
    params.orderByVoteCount = orderByVoteCount;
  }
  if (isFollowed !== undefined && isFollowed !== null) {
    params.isFollowed = String(isFollowed);
  }
  if (orderByFollower) {
    params.orderByFollower = orderByFollower;
  }
  const queryString = new URLSearchParams(params).toString();
  const url = `/photographer?${queryString}`;
  const response =
    await http.get<ResponseOf<"PhotographerController_findAllPhotographers">>(
      url,
    );
  return response.data;
};

const getMyPhotos = async (
  limit: number,
  page: number,
  // categoryName,
  orderByCreatedAt?: MyPhotoQuery["orderByCreatedAt"] | null,
  orderByUpvote?: MyPhotoQuery["orderByUpvote"] | null,
  watermark?: boolean | null,
  selling?: boolean | null,
  title?: string | null,
  photoType?: MyPhotoQuery["photoType"] | null,
  statuses?: string[] | null,
  orderByUpdatedAt?: MyPhotoQuery["orderByUpdatedAt"] | null,
) => {
  const params: Record<string, string> = {
    limit: String(limit),
    page: String(page),
    photoType: "RAW",
  };
  // if (categoryName) {
  //   params.categoryName = categoryName;
  // }
  if (orderByCreatedAt) {
    params.orderByCreatedAt = orderByCreatedAt;
  }
  if (orderByUpvote) {
    params.orderByUpvote = orderByUpvote;
  }
  if (watermark) {
    params.watermark = String(watermark);
  }
  if (selling !== undefined && selling !== null) {
    params.selling = String(selling);
  }
  if (title) {
    params.title = title;
  }
  if (photoType) {
    params.photoType = photoType;
  }
  if (statuses && statuses.length > 0 && statuses[0] !== "") {
    params.statuses = statuses[0];
  }
  if (orderByUpdatedAt) {
    params.orderByUpdatedAt = orderByUpdatedAt;
  }
  const queryString = new URLSearchParams(params).toString();
  const url = `/photographer/me/photo?${queryString}`;
  const response =
    await http.get<ResponseOf<"PhotographerController_getPhotoOfMine">>(url);
  // const response = await http.get(
  //   `/photographer/me/photo?limit=${limit}&page=${page}`
  // );

  return response.data;
};

const getPhotographerById = async (id: string) => {
  const response = await http.get<
    ResponseOf<"PhotographerController_getPhotographerProfile">
  >(`/photographer/${id}/profile`);
  return response.data;
};

const PhotographerApi = {
  getPresignedUploadUrls,
  getAllPhotographers,
  getMyPhotos,
  getPhotographerById,
};

export default PhotographerApi;
