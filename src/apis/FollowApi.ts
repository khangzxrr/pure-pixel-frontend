import http from "../configs/Http";
import type { ResponseOf } from "./types";

const followPhotographer = async (followingId: string) => {
  const response = await http.post<ResponseOf<"FollowingController_follow">>(
    `/follow/me/following/${followingId}`,
  );
  return response.data;
};

const getAllFolllowerMe = async (limit: number, page: number) => {
  const response = await http.get<
    ResponseOf<"FollowingController_findallFollower">
  >(`/follow/me/follower?limit=${limit}&page=${page}`);
  return response.data;
};

const getAllFollowingMe = async (limit: number, page: number) => {
  const response = await http.get<
    ResponseOf<"FollowingController_findAllFollowing">
  >(`/follow/me/following?limit=${limit}&page=${page}`);
  return response.data;
};

const unFollow = async (followingId: string) => {
  const response = await http.delete<
    ResponseOf<"FollowingController_unfollow">
  >(`/follow/me/following/${followingId}`);
  return response.data;
};

// GET /follow/me/follower/{userId} is not part of the backend API (no generated type)
const getUserFollower = async (userId: string) => {
  const response = await http.get<unknown>(`/follow/me/follower/${userId}`);
  return response.data;
};
const getUserFollowing = async (userId: string) => {
  const response = await http.get<
    ResponseOf<"FollowingController_checkFollow">
  >(`/follow/me/following/${userId}`);
  return response.data;
};
const followUser = async (userId: string) => {
  const response = await http.post<ResponseOf<"FollowingController_follow">>(
    `/follow/me/following/${userId}`,
  );
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
