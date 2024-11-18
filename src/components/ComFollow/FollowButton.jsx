import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import FollowApi from "../../apis/FollowApi";

const FollowButton = ({ userId, photographer }) => {
  const queryClient = useQueryClient();

  const checkIsfollowed = () => {
    const isFollowed = photographer.followers.some(
      (follower) => follower.followerId === userId
    );

    return isFollowed;
  };

  const followMutation = useMutation({
    mutationFn: (followingId) => FollowApi.followPhotographer(followingId),
  });

  const unFollowMutation = useMutation({
    mutationFn: (followingId) => FollowApi.unFollow(followingId),
  });

  const handleFollow = () => {
    console.log("follow!");
    followMutation.mutate(photographer.id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["followings-me"] });
        // queryClient.invalidateQueries({ queryKey: ["photographers"] });
        queryClient.invalidateQueries({ queryKey: ["me"] });
        photographer.followers = [
          {
            followerId: userId,
          },
        ];
      },
      onError: (error) => {
        console.error("Follow error:", error);
      },
    });
  };

  const handleUnFollow = () => {
    console.log("unfolloW!");
    unFollowMutation.mutate(photographer.id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["followings-me"] });
        queryClient.invalidateQueries({ queryKey: ["me"] });

        photographer.followers = [];
      },
      onError: (error) => {
        console.error("Unfollow error:", error);
      },
    });
  };

  return (
    <div
      className={`px-5 py-2 rounded-sm  transition-color duration-200 ${
        checkIsfollowed()
          ? "bg-[#4e78cb] hover:bg-[#5b72a1]"
          : "bg-[#6b7280] hover:bg-[#4d525c]"
      }`}
    >
      <button onClick={checkIsfollowed() ? handleUnFollow : handleFollow}>
        {checkIsfollowed() ? "Đang theo dõi" : "Theo dõi"}
      </button>
    </div>
  );
};

export default FollowButton;
