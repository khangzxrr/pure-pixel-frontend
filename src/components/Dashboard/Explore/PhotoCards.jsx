import React from "react";
import PhotoList from "../ForYou/PhotoList";
const PhotoCards = () => {
  const randomPhotos = [...PhotoList]
    .sort(() => Math.random() - 0.5)
    .slice(0, 7);
  return (
    <div className="w-full max-w-8xl  py-2 pb-10 mx-auto mb-10 gap-5 columns-4 space-y-5">
      {randomPhotos.map((item) => (
        <div
          key={item.id}
          className="overflow-hidden rounded-xl hover:outline  shadow-xl hover:cursor-pointer"
        >
          <img
            key={item.id}
            src={item.photo}
            alt={""}
            className=" rounded-xl transition-transform duration-300 ease-in-out transform hover:scale-110 "
          />
        </div>
      ))}
    </div>
  );
};

export default PhotoCards;
