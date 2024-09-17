import { testHttp } from "../configs/Http";

const getUserProfileById = async (id) => {
  const response = await testHttp.get(id);

  return response.data;
};

const UserProfileApi = {
  getUserProfileById,
};

export default UserProfileApi;
