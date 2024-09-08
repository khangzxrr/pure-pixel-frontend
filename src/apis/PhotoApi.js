import http from "../configs/Http";

const getPublicPhotos = async () => {
  const response = await http.get("/photo/public", { crossdomain: true });

  return response.data;
};

const getPresignedUploadUrls = async ({ filenames }) => {
  console.log(filenames);

  const response = await http.post(
    `/photo/upload`,
    {
      filenames,
    },
    {
      crossdomain: true,
    },
  );

  return response.data;
};

const uploadPhotoUsingPresignedUrl = async (url, file) => {
  //FUCK AXIOS
  //waste me 2 hour just for a fucking upload feature???

  const response = await fetch(url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.typ,
    },
  });

  return response.data;
};

const PhotoApi = {
  getPublicPhotos,
  getPresignedUploadUrls,
  uploadPhotoUsingPresignedUrl,
};

export default PhotoApi;
