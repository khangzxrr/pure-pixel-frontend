import React from "react";
import PhotoList from "./../ForYou/PhotoList";

const TopCategories = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {PhotoList.slice(0, 8).map((item, index) => (
        <div
          key={item.id}
          className={`w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[237px] rounded-xl relative overflow-hidden group hover:cursor-pointer ${
            index === 7 ? "opacity-50" : ""
          }`}
        >
          <img
            src={item.photo}
            alt=""
            className={`w-full h-full object-cover rounded-xl transition-transform duration-300 ease-in-out group-hover:scale-110 ${
              index === 7 ? "blur" : ""
            }`}
          />
          <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-black/50 text-white font-bold text-xl sm:text-2xl transition-colors duration-300 ease-in-out group-hover:bg-black/30">
            {index === 7 ? "Khác" : item.category}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopCategories;
