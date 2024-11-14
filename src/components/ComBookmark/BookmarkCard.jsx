import React from "react";

const BookmarkCard = () => {
  return (
    <div>
      <div className="relative group h-[300px] bg-[#202225] rounded-lg overflow-hidden">
        <img
          src="https://picsum.photos/1920/1080"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 w-full p-2 bg-black/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition duration-200 ease-in">
          hello
        </div>
      </div>
    </div>
  );
};

export default BookmarkCard;
