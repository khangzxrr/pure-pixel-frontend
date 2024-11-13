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

const getAllFollowingMe = async (limit, page) => {
  const response = await http.get(
    `/follow/me/following?limit=${limit}&page=${page}`
  );
  return response.data;
};

const unFollow = async (followingId) => {
  const response = await http.delete(`/follow/me/following/${followingId}`);
  return response.data;
};

const getUserFollower = async (userId) => {
  const response = await http.get(`/follow/me/follower/${userId}`);
  return response.data;
};
const getUserFollowing = async (userId) => {
  const response = await http.get(`/follow/me/following/${userId}`);
  return response.data;
};
const followUser = async (userId) => {
  const response = await http.post(`/follow/me/following/${userId}`);
  return response.data;
};
const FollowApi = {
  followPhotographer,
  getAllFolllowerMe,
  getAllFollowingMe,
  unFollow,
  getUserFollower,
  getUserFollowing,
  followUser,
};

export default FollowApi;
