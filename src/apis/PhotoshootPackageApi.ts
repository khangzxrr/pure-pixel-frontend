import http, { timeoutHttpClient } from "../configs/Http";
import PhotoService from "../services/PhotoService";
import type { QueryOf, ResponseOf } from "./types";
const customHttp = timeoutHttpClient(300000);

// form values of the create/update package pages; price may still be the formatted input
export type PhotoshootPackageInput = {
  title?: string;
  subtitle?: string;
  price?: number | string;
  description?: string;
  thumbnail?: Blob;
};

export type CreatePhotoshootPackageInput = PhotoshootPackageInput & {
  // antd upload entries
  showcases?: { originFileObj: Blob }[];
};

const getPackagesByPhotographerId = async (
  photographerId: string,
  limit: number,
  page: number,
) => {
  const response = await http.get<
    ResponseOf<"PhotoShootPackageController_findAllWithPhotographerId">
  >(
    `photoshoot-package/photographer/${photographerId}?limit=${limit}&page=${page}`,
  );
  return response.data;
};

const findAll = async (
  limit: number,
  page: number,
  orderByCreateAt?: QueryOf<"PhotoShootPackageController_findAll">["orderByCreateAt"],
) => {
  const params: Record<string, string> = {
    limit: String(limit),
    page: String(page),
  };

  if (orderByCreateAt) {
    params.orderByCreateAt = orderByCreateAt;
  }

  const queryString = new URLSearchParams(params).toString();
  const url = `/photoshoot-package?${queryString}`;
  const response =
    await http.get<ResponseOf<"PhotoShootPackageController_findAll">>(url);

  return response.data;
};

const findById = async (id: string) => {
  const response = await http.get<
    ResponseOf<"PhotoShootPackageController_findPhotoshootPackageById">
  >(`/photoshoot-package/${id}`);

  return response.data;
};
const deletePhotoshootPackage = async (packageId: string) => {
  const response = await http.delete<
    ResponseOf<"PhotographerPhotoShootPackageController_deletePhotoshootPackage">
  >(`/photographer/photoshoot-package/${packageId}`);
  return response.data;
};
const photographerFindById = async (id: string) => {
  const response = await http.get<
    ResponseOf<"PhotographerPhotoShootPackageController_findPhotoshootPackageById">
  >(`/photographer/photoshoot-package/${id}`);

  return response.data;
};
const createPhotoshootPackage = async (
  data?: CreatePhotoshootPackageInput | null,
) => {
  const formData = new FormData();

  if (data?.title) {
    formData.append("title", data.title);
  }

  if (data?.subtitle) {
    formData.append("subtitle", data.subtitle);
  }

  if (data?.price) {
    formData.append("price", String(data.price));
  }

  if (data?.description) {
    formData.append("description", data.description);
  }

  if (data?.thumbnail) {
    formData.append("thumbnail", data.thumbnail);
  }

  if (data?.showcases && data.showcases.length > 0) {
    data.showcases.forEach((showcase, index) => {
      formData.append(`showcases[${index}]`, showcase.originFileObj);
    });
  }

  // Create a timeout-specific Axios instance

  // Send the POST request to create the photoshoot package
  const response = await customHttp.post<
    ResponseOf<"PhotographerPhotoShootPackageController_createWithFileSystemUpload">
  >(`/photographer/photoshoot-package/v2`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    // Uncomment this if you want to track upload progress
    // onUploadProgress,
  });

  // Return the response data from the server
  return response.data;
};
const updatePhotoshootPackage = async ({
  packageId,
  data,
}: {
  packageId: string;
  data?: PhotoshootPackageInput | null;
}) => {
  const formData = new FormData();

  if (data?.title) {
    formData.append("title", data.title);
  }

  if (data?.subtitle) {
    formData.append("subtitle", data.subtitle);
  }

  if (data?.price) {
    formData.append("price", String(data.price));
  }

  if (data?.description) {
    formData.append("description", data.description);
  }

  if (data?.thumbnail) {
    // the preview URL is not used, but reading the file still rejects invalid thumbnails
    await PhotoService.convertArrayBufferToObjectUrl(data.thumbnail);
    if (data.thumbnail instanceof File || data.thumbnail instanceof Blob) {
      formData.append("thumbnail", data.thumbnail);
    } else {
      console.error(
        "Thumbnail is neither a valid file, blob, nor base64 string",
      );
    }
  }

  // Debugging FormData

  // Send the PATCH request to update the user's profile
  const response = await customHttp.patch<
    ResponseOf<"PhotographerPhotoShootPackageController_updatePhotoshoot">
  >(`/photographer/photoshoot-package/${packageId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  // Return the response data from the server
  return response.data;
};
//get current showcase photos
const getPhotoshootPackageShowcase = async (photoshootPackageId: string) => {
  const response = await http.get<
    ResponseOf<"PhotographerPhotoshootPackageShowCaseController_findAll">
  >(
    `/photographer/photoshoot-package-showcase/photoshoot-package/${photoshootPackageId}?limit=20&page=0`,
  );
  return response.data;
};
// Add showcase photo
const addPhotoshootPackageShowcase = async (
  photoshootPackageId: string,
  data: { newShowcasePhoto?: Blob | null },
) => {
  try {
    const newShowcasePhoto = data.newShowcasePhoto;

    // Check if newShowcasePhoto is valid and has originFileObj
    if (!newShowcasePhoto || !data) {
      throw new Error(
        "Invalid file object. Ensure the file is properly selected.",
      );
    }

    const formData = new FormData();
    formData.append("showcase", newShowcasePhoto);

    const response = await customHttp.post<
      ResponseOf<"PhotographerPhotoshootPackageShowCaseController_createShowcase">
    >(
      `/photographer/photoshoot-package-showcase/photoshoot-package/${photoshootPackageId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error adding showcase photo:", error);
    throw error; // Re-throw to handle in the caller
  }
};

//delete showcase photo
const deletePhotoshootPackageShowcase = async (
  showcaseId: string,
  photoshootPackageId: string,
) => {
  const response = await http.delete<
    ResponseOf<"PhotographerPhotoshootPackageShowCaseController_deleteShowcaseById">
  >(
    `/photographer/photoshoot-package-showcase/${showcaseId}/photoshoot-package/${photoshootPackageId}`,
  );
  return response.data;
};
const getAllPhotoshootPackages = async (
  limit: number,
  page: number,
  orderByCreateAt: QueryOf<"PhotographerPhotoShootPackageController_findAllByPhotographer">["orderByCreateAt"],
) => {
  const response = await http.get<
    ResponseOf<"PhotographerPhotoShootPackageController_findAllByPhotographer">
  >(
    `/photographer/photoshoot-package?limit=${limit}&page=${page}&orderByCreateAt=${orderByCreateAt}`,
  );
  return response.data;
};

const PhotoshootPackageApi = {
  getPackagesByPhotographerId,
  findAll,
  findById,
  deletePhotoshootPackage,
  photographerFindById,
  createPhotoshootPackage,
  getPhotoshootPackageShowcase,
  addPhotoshootPackageShowcase,
  deletePhotoshootPackageShowcase,
  updatePhotoshootPackage,
  getAllPhotoshootPackages,
};

export default PhotoshootPackageApi;
