import React, { useEffect, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa6";
import VoteApi from "../../apis/VoteApi";
import { useQuery } from "@tanstack/react-query";
import { deleteData, getData, postData } from "../../apis/api";

const LikeButton = ({ photoId, size = "size-7", reloadData }) => {
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (photoId) {
      getData(`/photo/${photoId}/vote`)
        .then((data) => {
          console.log(data);

          setIsLiked(data?.data ? true : false);
        })
        .catch((error) => {
          console.log(error);
        });
      return;
    }
  }, [photoId]);
  console.log(111111111, photoId);

  const onLike = () => {
    if (!isLiked) {
      postData(`/photo/${photoId}/vote`, {
        isUpvote: true,
      })
        .then((data) => {
          console.log(data);
          reloadData();
          setIsLiked(true);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const onUnLike = () => {
    if (isLiked) {
      deleteData(`/photo`, `${photoId}/vote`, {
        isUpvote: true,
      }).then((data) => {
        console.log(data);
        setIsLiked(false);
        reloadData();
      });
    }
  };
  return (
    <div className="flex gap-1" onClick={() => setIsLiked(!isLiked)}>
      {isLiked ? (
        <FaHeart onClick={onUnLike} className={`text-red-500 ${size}`} />
      ) : (
        <FaRegHeart onClick={onLike} className={`${size}`} />
      )}
    </div>
  );
};

export default LikeButton;
