import React from "react";
import ComButton from "../../ComButton/ComButton";
import ComText from "../../ComText/ComText";

export default function Home2() {
  return (
    <div className="  bg-black">
      <div>
        <div className="flex gap-5 flex-col md:flex-row justify-around items-center">
          <div className=" py-14 flex flex-col gap-6 ">
            <p className="font-inter text-[25px] md:text-[30px] lg:text-[34px] xl:text-[34px]  font-extrabold leading-[66.56px]  text-shadow  text-white">
              Looking for inspiration?
            </p>
            <p className="font-inter text-[16px] font-light leading-[19.36px]  D text-white">
              Get started by customizing your content feed and uncover endless
              inspiration.
            </p>
          </div>
          <div className="pb-8">
            <div className="bg-[#fff] rounded-[29px] h-[39px] min-w-[230px] flex justify-center items-center p-6">
              <div className="font-inter text-[14px] font-semibold flex items-center justify-center text-black">
                Get your recommendations
              </div>
            </div>
          </div>
        </div>
        <div className="border border-solid border-white mx-[10%]"></div>
      </div>
      <div className="">
        <p className="font-inter text-[25px] md:text-[30px] lg:text-[34px] xl:text-[34px] text-center font-extrabold leading-[66.56px]  text-shadow  text-white">
          Looking for inspiration?
        </p>
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 p-6">
          <ComText
            tile={"Grow as a photographer"}
            className={"font-inter  text-white"}
            context={
              "Get immediate exposure with your first upload. Our Pulse algorithm surfaces new photographs and photographers, ensuring your photos are seen by the community so you receive valuable feedback on day one."
            }
          />
          <ComText
            tile={"Grow as a photographer"}
            className={"font-inter  text-white"}
            context={
              "Get immediate exposure with your first upload. Our Pulse algorithm surfaces new photographs and photographers, ensuring your photos are seen by the community so you receive valuable feedback on day one."
            }
          />
          <ComText
            tile={"Grow as a photographer"}
            className={"font-inter  text-white"}
            context={
              "Get immediate exposure with your first upload. Our Pulse algorithm surfaces new photographs and photographers, ensuring your photos are seen by the community so you receive valuable feedback on day one."
            }
          />
          <ComText
            tile={"Grow as a photographer"}
            className={"font-inter  text-white"}
            context={
              "Get immediate exposure with your first upload. Our Pulse algorithm surfaces new photographs and photographers, ensuring your photos are seen by the community so you receive valuable feedback on day one."
            }
          />
        </div>
      </div>
      <div className="relative">
        <img
          className="w-full h-64 md:h-72 lg:h-80 xl:h-96 object-cover "
          src="https://firebasestorage.googleapis.com/v0/b/careconnect-2d494.appspot.com/o/fima%2FRectangle%20705.png?alt=media&token=52698054-2927-4802-a1ae-d204f7337f6b"
        />
        <div className="absolute bottom-0 left-0 w-full">
          <p className="text-center font-inter text-[25px] md:text-[30px] lg:text-[34px] xl:text-[34px]  font-extrabold leading-[66.56px]  text-shadow  text-white">
            Editor's Choice
          </p>
        </div>
      </div>
    </div>
  );
}
