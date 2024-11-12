import http from "../configs/Http";

const followPhotographer = async (followingId) => {
  const response = await http.post(`/follow/me/following/${followingId}`);
  return response.data;
};

const getAllFolllowerMe = async (limit, page) => {
  const response = await http.get(
    `/follow/me/follower?limit=${limit}&page=${page}`
  );
  return response.data;
};
const FollowApi = {
  followPhotographer,
  getAllFolllowerMe,
};

export default FollowApi;
