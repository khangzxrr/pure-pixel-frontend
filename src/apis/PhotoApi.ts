import type { AxiosRequestConfig } from "axios";
import http from "./../configs/Http";
import type { BodyOf, QueryOf, ResponseOf, Schema } from "./types";

type PublicPhotoQuery = QueryOf<"PhotoController_getAllPublicPhoto">;

// the upload forms also send categoryId, which PhotoUpdateRequestDto does not declare
type PhotoUpdateInput = { id: string; categoryId?: string } & BodyOf<"PhotoController_updatePhoto">;

// const getPublicPhotos = async (limit, page, categoryName) => {

//   //Nếu categoryName không tồn tại hoặc là undefined, không thêm nó vào URL
//   const url = categoryName
//     ? `/photo/public?limit=${limit}&page=${page}&categoryName=${categoryName}`
//     : `/photo/public?limit=${limit}&page=${page}`;

//   const response = await http.get(url);
//   return response.data;
// };
const getPublicPhotos = async (
  limit: number,
  page: number,
  categoryName?: string | null,
  orderByCreatedAt?: PublicPhotoQuery["orderByCreatedAt"] | null,
  orderByUpvote?: PublicPhotoQuery["orderByUpvote"] | null,
  watermark?: boolean | null,
  selling?: boolean | null,
  search?: string | null,
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
  if (search) {
    params.search = search;
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

  const url = `/photo/public?${queryString.toString()}`;

  const response =
    await http.get<ResponseOf<"PhotoController_getAllPublicPhoto">>(url);
  return response.data;
};

const getPhotoTags = async ({ top }: { top: number }) => {
  const response = await http.get<
    ResponseOf<"PhotoTagController_getTopTags">
  >(`/photo-tag?top=${top}`);
  return response.data;
};
// Send the PATCH request to update the user's profile
const uploadPhoto = async (
  file: Blob,
  onUploadProgress?: AxiosRequestConfig["onUploadProgress"],
) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await http.post<
    ResponseOf<"PhotoController_uploadPhotoV2">
  >(`photo/v2/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    // large photos over a slow uplink, several at once, easily take minutes
    timeout: 600000,
    onUploadProgress,
  });

  return response.data;
};

const updatePhotos = async (photo: PhotoUpdateInput) => {
  // Destructure the photo object to exclude the id field
  const { id, ...photoWithoutId } = photo;

  const response = await http.patch<
    ResponseOf<"PhotoController_updatePhoto">
  >(`photo/${id}`, {
    ...photoWithoutId,
  });

  return response;
};

const addWatermark = async (photo: { photoId: string; text: string }) => {
  const res = await http.post<
    ResponseOf<"PhotoController_generateWatermark">
  >(`/photo/${photo.photoId}/watermark`, {
    text: photo.text,
  });
  return res;
};
const deletePhoto = async (id: string) => {
  const response = await http.delete<
    ResponseOf<"PhotoController_deletePhoto">
  >(`photo/${id}`);

  return response;
};

const getPhotoById = async (id: string) => {
  const response = await http.get<
    ResponseOf<"PhotoController_findPhotoById">
  >(`photo/${id}`);

  return response.data;
};

const getNextPublicById = async (id: string) => {
  const response = await http.get<
    ResponseOf<"PhotoController_getNextPublicPhoto">
  >(`photo/public/next?cursor=${id}&forward=true`);

  return response.data;
};

const getPreviousPublicById = async (id: string) => {
  const response = await http.get<
    ResponseOf<"PhotoController_getNextPublicPhoto">
  >(`photo/public/next?cursor=${id}&forward=false`);

  return response.data;
};

// GET and POST /photo/{id}/comment are not part of the backend API (no generated type)
const getPhotoComments = async (id: string) => {
  const response = await http.get<unknown>(`photo/${id}/comment`);
  return response.data;
};

const commentPhoto = async (
  id: string,
  content: unknown,
  onProgress?: (uploading: boolean) => void,
) => {
  const response = await http.post<unknown>(`photo/${id}/comment`, content, {
    onUploadProgress: () => {
      if (onProgress) {
        // const percentCompleted = Math.round(
        //   (progressEvent.loaded * 100) / progressEvent.total
        // );
        onProgress(true);
      }
    },
  });

  return response.data;
};

// the operation also declares a bodiless 201, so ResponseOf cannot pick the 200 body
const getAvailableResolutionsByPhotoId = async (id: string) => {
  const response = await http.get<Schema<"PhotoSizeDto">[]>(
    `photo/${id}/available-resolution`,
  );

  return response.data;
};

const sharePhotoById = async (
  photoId: string,
  size: Schema<"PhotoSizeDto">,
) => {
  const response = await http.post<ResponseOf<"PhotoController_sharePhoto">>(
    `photo/share`,
    {
      photoId,
      size,
    },
  );

  return response.data;
};
const PhotoApi = {
  getPublicPhotos,
  uploadPhoto,
  updatePhotos,
  deletePhoto,
  getPhotoById,
  getPhotoComments,
  commentPhoto,
  addWatermark,
  getAvailableResolutionsByPhotoId,
  sharePhotoById,
  getPhotoTags,
  getNextPublicById,
  getPreviousPublicById,
};

export default PhotoApi;
