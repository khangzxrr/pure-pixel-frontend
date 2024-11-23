import http from "../configs/Http";

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

  // Send the PATCH request to update the user's profile
  const response = await http.post(
    `/photographer/photoshoot-package`,
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
const updatePhotoshootPackage = async (data) => {
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
  const response = await http.patch(
    `/photographer/photoshoot-package`,
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
  updatePhotoshootPackage,
  getAllPhotoshootPackages,
};

export default PhotoshootPackageApi;
