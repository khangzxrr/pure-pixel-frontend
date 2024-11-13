import http from "./../configs/Http";

const isFollowing = async (userId) => {
  const response = await http.get(`/follow/me/following/${userId}`);
  return response.data;
};
const getMyFollower = async () => {
  const response = await http.get("/follow/me/follower");
  return response.data;
};
const getMyFollowing = async () => {
  const response = await http.get("/follow/me/following");
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
const unFollowUser = async (userId) => {
  const response = await http.delete(`/follow/me/following/${userId}`);
  return response.data;
};

const FollowApi = {
  isFollowing,
  getMyFollower,
  getMyFollowing,
  getUserFollower,
  getUserFollowing,
  followUser,
  unFollowUser,
};

export default FollowApi;
