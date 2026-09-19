import http from "../configs/Http";
import type { BodyOf, QueryOf, ResponseOf } from "./types";

type ManagerPhotoQuery = QueryOf<"ManagePhotoController_findAllPhotos">;

const getAllPhotos = async (
  limit: number,
  page: number,
  categoryName?: string | null,
  orderByCreatedAt?: ManagerPhotoQuery["orderByCreatedAt"] | null,
  orderByUpvote?: ManagerPhotoQuery["orderByUpvote"] | null,
  watermark?: boolean | null,
  selling?: boolean | null,
  photographerName?: string | null,
  title?: string | null,
  photographerId?: string | null,
  cameraId?: string | null,
  bookmarked?: boolean | null,
  tags?: string[] | null,
  isFollowed?: boolean | "" | null,
) => {
  // Tạo một đối tượng chứa các tham số cơ bản
  const params: Record<string, string> = {
    limit: String(limit),
    page: String(page),
  };

  if (categoryName) {
    params.categoryName = categoryName;
  }
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
  if (photographerName) {
    params.photographerName = photographerName;
  }
  if (title) {
    params.title = title;
  }
  if (photographerId) {
    params.photographerId = photographerId;
  }
  if (cameraId) {
    params.cameraId = cameraId;
  }
  if (bookmarked !== undefined && bookmarked !== null) {
    params.bookmarked = String(bookmarked);
  }

  if (tags && tags.length > 0 && tags[0] !== "") {
    params.tags = tags[0];
  }
  if (isFollowed !== undefined && isFollowed !== null && isFollowed !== "") {
    params.isFollowed = String(isFollowed);
  }

  // Tạo instance URLSearchParams
  const queryString = new URLSearchParams(params);

  const url = `/manager/photo?${queryString.toString()}`;

  const response =
    await http.get<ResponseOf<"ManagePhotoController_findAllPhotos">>(url);
  return response.data;
};

const deletePhoto = async (id: string) => {
  const url = `manager/photo/${id}`;
  const response =
    await http.delete<ResponseOf<"ManagePhotoController_deletePhoto">>(url);
  return response.data;
};

const updatePhoto = async (
  id: string,
  updateBody: BodyOf<"ManagePhotoController_updatePhoto">,
) => {
  const url = `manager/photo/${id}`;
  const response = await http.patch<
    ResponseOf<"ManagePhotoController_updatePhoto">
  >(url, updateBody);
  return response.data;
};

const banPhoto = async (id: string) => {
  const url = `manager/photo/${id}/ban`;
  const response =
    await http.post<ResponseOf<"ManagePhotoController_banPhoto">>(url);
  return response.data;
};

const unBanPhoto = async (id: string) => {
  const url = `manager/photo/${id}/unban`;
  const response =
    await http.post<ResponseOf<"ManagePhotoController_unbanPhoto">>(url);
  return response.data;
};

const ManagerPhotoApi = {
  getAllPhotos,
  deletePhoto,
  updatePhoto,
  banPhoto,
  unBanPhoto,
};
export default ManagerPhotoApi;
