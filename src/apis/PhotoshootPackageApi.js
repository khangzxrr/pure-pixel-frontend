import http, { timeoutHttpClient } from "../configs/Http";
const customHttp = timeoutHttpClient(300000);

const getPackagesByPhotographerId = async (photographerId, limit, page) => {
  const response = await http.get(
    `photoshoot-package/photographer/${photographerId}?limit=${limit}&page=${page}`
  );
  return response.data;
};

const findAll = async (limit, page) => {
  const params = {
    limit,
    page,
  };
  const queryString = new URLSearchParams(params).toString();
  const url = `/photoshoot-package?${queryString}`;
  const response = await http.get(url);

  return response.data;
};

const findById = async (id) => {
  const response = await http.get(`/photoshoot-package/${id}`);

  return response.data;
};
const deletePhotoshootPackage = async (packageId) => {
  const response = await http.delete(
    `/photographer/photoshoot-package/${packageId}`
  );
  return response.data;
};
const photographerFindById = async (id) => {
  const response = await http.get(`/photographer/photoshoot-package/${id}`);

  return response.data;
};
const createPhotoshootPackage = async (data) => {
  const formData = new FormData();

  if (data?.title) {
    formData.append("title", data.title);
  }

  if (data?.subtitle) {
    formData.append("subtitle", data.subtitle);
  }

  if (data?.price) {
    formData.append("price", data.price);
  }

  if (data?.description) {
    formData.append("description", data.description);
  }

  if (data?.thumbnail) {
    formData.append("thumbnail", data.thumbnail);
  }

  if (data?.showcases?.length > 0) {
    data.showcases.forEach((showcase, index) => {
      formData.append(`showcases[${index}]`, showcase.originFileObj);
    });
  }

  // Create a timeout-specific Axios instance

  // Send the POST request to create the photoshoot package
  const response = await customHttp.post(
    `/photographer/photoshoot-package`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      // Uncomment this if you want to track upload progress
      // onUploadProgress,
    }
  );

  // Return the response data from the server
  return response.data;
};
const updatePhotoshootPackage = async ({ packageId, data }) => {
  const formData = new FormData();

  if (data?.title) {
    formData.append("title", data.title);
  }

  if (data?.subtitle) {
    formData.append("subtitle", data.subtitle);
  }

  if (data?.price) {
    formData.append("price", data.price);
  }

  if (data?.description) {
    formData.append("description", data.description);
  }

  if (data?.thumbnail) {
    formData.append("thumbnail", data.thumbnail);
  }

  // if (data?.showcases?.length > 0) {
  //   data.showcases.forEach((showcase, index) => {
  //     formData.append(`showcases[${index}]`, showcase.originFileObj);
  //   });
  // }

  // Send the PATCH request to update the user's profile
  const response = await customHttp.patch(
    `/photographer/photoshoot-package/${packageId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      // onUploadProgress,
    }
  );

  // Return the response data from the server
  return response.data;
};

// Add showcase photo
const addPhotoshootPackageShowcase = async (photoshootPackageId, data) => {
  try {
    const newShowcasePhoto = data.newShowcasePhoto;

    // Check if newShowcasePhoto is valid and has originFileObj
    if (!newShowcasePhoto || !data) {
      throw new Error(
        "Invalid file object. Ensure the file is properly selected."
      );
    }

    const formData = new FormData();
    formData.append("showcase", newShowcasePhoto);

    const response = await customHttp.post(
      `/photographer/photoshoot-package-showcase/photoshoot-package/${photoshootPackageId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error adding showcase photo:", error);
    throw error; // Re-throw to handle in the caller
  }
};

//delete showcase photo
const deletePhotoshootPackageShowcase = async (
  showcaseId,
  photoshootPackageId
) => {
  const response = await http.delete(
    `/photographer/photoshoot-package-showcase/${showcaseId}/photoshoot-package/${photoshootPackageId}`
  );
  return response.data;
};
const getAllPhotoshootPackages = async (limit, page) => {
  const params = {
    limit,
    page,
  };
  const queryString = new URLSearchParams(params).toString();
  const url = `photographer/photoshoot-package?${queryString}`;
  const response = await http.get(url);

  return response.data;
};
const PhotoshootPackageApi = {
  getPackagesByPhotographerId,
  findAll,
  findById,
  deletePhotoshootPackage,
  photographerFindById,
  createPhotoshootPackage,
  addPhotoshootPackageShowcase,
  deletePhotoshootPackageShowcase,
  updatePhotoshootPackage,
  getAllPhotoshootPackages,
};

export default PhotoshootPackageApi;
