import React, { useEffect, useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa6";
import { deleteData, getData, postData } from "../../apis/api";
import { notificationApi } from "../../Notification/Notification";

const LikeButton = ({ photoId, size = "size-7", reloadData }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [blockActions, setBlockActions] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (photoId) {
      getData(`/photo/${photoId}/vote`)
        .then((data) => {
          setIsLiked(data?.data ? true : false);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, [photoId]);

  // Reset click count after 1 minute
  useEffect(() => {
    if (clickCount > 0) {
      const timer = setTimeout(() => setClickCount(0), 60 * 1000); // Reset sau 1 phút
      return () => clearTimeout(timer);
    }
  }, [clickCount]);

  const handleClick = (action) => {
    if (blockActions) {
      setErrorMessage(
        "Bạn đã thao tác quá nhiều lần. Vui lòng thử lại sau 1 phút."
      );
      return;
    }

    if (clickCount >= 5) {
      setBlockActions(true);
      setErrorMessage(
        "Bạn đã nhấn nút quá nhiều lần liên tiếp. Hãy chờ 1 phút."
      );
      setTimeout(() => {
        setBlockActions(false);
        setErrorMessage("");
      }, 60 * 1000); // Bỏ chặn sau 1 phút
      return;
    }

    setClickCount(clickCount + 1);
    setErrorMessage("");

    action();
  };

  const onLike = () => {
    if (!isLiked) {
      postData(`/photo/${photoId}/vote`, { isUpvote: true })
        .then((data) => {
          // console.log(data);
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
      deleteData(`/photo`, `${photoId}/vote`, { isUpvote: true })
        .then((data) => {
          setIsLiked(false);
          reloadData();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  if (errorMessage) {
    notificationApi(
      "error",
      "Thao tác thất bại",
      "Vui lòng thử lại sau 5 phút"
    );
  }

  return (
    <div>
      <div className="flex gap-1">
        {isLiked ? (
          <FaHeart
            onClick={() => handleClick(onUnLike)}
            className={`text-red-500 ${size}`}
          />
        ) : (
          <FaRegHeart
            onClick={() => handleClick(onLike)}
            className={`${size}`}
          />
        )}
      </div>
      {/* {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>} */}
    </div>
  );
};

export default LikeButton;
