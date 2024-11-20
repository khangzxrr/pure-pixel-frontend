import React from "react";
import ComText from "../../ComText/ComText";

export default function Home3() {
  return (
    <div className="  bg-black">
      <div className="pt-10 flex flex-col gap-5">
        <p className="font-inter text-[25px] md:text-[30px] lg:text-[34px] xl:text-[34px] text-center font-extrabold leading-[66.56px]  text-shadow  text-white">
          The best of the best.
        </p>
        <p className="font-inter text-[16px] font-light leading-[19.36px]  text-center text-white">
          Get started by customizing your content feed and uncover endless
          inspiration.
        </p>
        <div className="   flex justify-center items-center p-6 ">
          <div className=" bg-[#fff]  rounded-[29px] p-4 font-inter text-[32px] font-semibold flex items-center justify-center text-black text-center">
            View Editors' Choice
          </div>
        </div>
      </div>

      <div className="flex flex-wrap  p-6 gap-6 justify-center items-center ">
        <div className="flex flex-wrap gap-6  justify-center items-center  ">
          <img
            className="object-cover h-44 "
            src="https://random.imagecdn.app/300/300"
          />
          <img
            className="object-cover h-44 w-auto"
            src="https://random.imagecdn.app/300/150"
          />
        </div>
        <div className="flex flex-wrap gap-6  justify-center items-center ">
          <img
            className="object-cover h-44 w-auto"
            src="https://random.imagecdn.app/300/150"
          />
          <img
            className="object-cover h-44 w-auto"
            src="https://random.imagecdn.app/300/300"
          />
        </div>
      </div>

      <div className="flex flex-wrap  p-6 gap-6 justify-center items-center ">
        <div className="flex flex-wrap gap-6  justify-center items-center ">
          <img
            className="object-cover h-44 w-auto"
            src="https://random.imagecdn.app/300/150"
          />
          <img
            className="object-cover h-44 w-auto"
            src="https://random.imagecdn.app/300/300"
          />
        </div>
        <div className="flex flex-wrap gap-6  justify-center items-center  ">
          <img
            className="object-cover h-44 w-auto"
            src="https://random.imagecdn.app/300/300"
          />
          <img
            className="object-cover h-44 w-auto"
            src="https://random.imagecdn.app/300/150"
          />
        </div>
      </div>
      <div className="relative">
        <img
          className="w-full h-64 md:h-72 lg:h-80 xl:h-96 object-cover "
          src="https://firebasestorage.googleapis.com/v0/b/careconnect-2d494.appspot.com/o/fima%2FRectangle%20704.png?alt=media&token=2d870be2-0360-4f85-87a3-f08da70466ac"
        />
        <div className="absolute bottom-0 left-0 w-full">
          <p className="text-center font-inter text-[25px] md:text-[30px] lg:text-[34px] xl:text-[34px]  font-extrabold leading-[66.56px]  text-shadow  text-white">
            Portfolio
          </p>
        </div>
      </div>
    </div>
  );
}
