import React from "react";
import { useNavigate } from "react-router-dom";
import UsePhotographerFilterStore from "../../states/UsePhotographerFilterStore";
import UseUserOtherStore from "../../states/UseUserOtherStore";
import { FiShare2 } from "react-icons/fi";

const BookmarkCard = ({ photoBookmark, onClick, onShare }) => {
  const navigate = useNavigate();
  const setNamePhotographer = UsePhotographerFilterStore(
    (state) => state.setNamePhotographer
  );

  const setUserOtherId = UseUserOtherStore((state) => state.setUserOtherId);
  const setNameUserOther = UseUserOtherStore((state) => state.setNameUserOther);
  return (
    <div>
      <div className="relative group h-[300px] bg-[#202225] rounded-lg overflow-hidden">
        <img
          src={photoBookmark.signedUrl.thumbnail}
          alt=""
          className="w-full h-full object-cover"
          onClick={onClick}
        />
        <div className="absolute flex items-center justify-between  gap-1 bottom-0 left-0 w-full p-2 bg-black/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition duration-200 ease-in">
          <div className="flex items-center gap-1 ">
            <div className="size-8 overflow-hidden rounded-full bg-[#eee]">
              <img
                src={photoBookmark.photographer.avatar}
                alt=""
                className="size-full object-cover"
              />
            </div>
            <span
              onClick={() => {
                navigate(`/user/${photoBookmark.photographer.id}/photos`);
                setNamePhotographer(photoBookmark.photographer.name);
                setNameUserOther(photoBookmark.photographer.name);
                setUserOtherId(photoBookmark.photographer.id);
              }}
              className="hover:cursor-pointer hover:underline underline-offset-2"
            >
              {photoBookmark.photographer.name}
            </span>
          </div>
          <div>
            <FiShare2
              className="size-7"
              onClick={onShare}
              // onClick={() => {
              //   popupShare.handleOpen();
              //   setSelectedPhoto(photo);
              // }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookmarkCard;
