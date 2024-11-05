import http from "../configs/Http";

const getUserProfileById = async (id) => {
  const response = await http.get(`/me`);

  return response.data;
};

const UserProfileApi = {
  getUserProfileById,
};

export default UserProfileApi;
