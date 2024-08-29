import React from "react";

export default function Home1() {
  return (
    <div className=" relative">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="p-4 py-14 flex flex-col gap-6 md:w-1/2">
          <p className="font-inter text-[35px] md:text-[40px] lg:text-[45px] xl:text-[55px]  font-extrabold leading-[66.56px] text-left text-shadow px-4 md:px-10 lg:px-14 xl:px-20 text-black">
            Discover and share the world’s best photos
          </p>
          <p className="font-inter text-[16px] font-light leading-[19.36px] text-left px-4 md:px-10 lg:px-14 xl:px-20 text-black">
            Get inspired with incredible photos from diverse styles and genres
            around the world. We're not guided by fads—just great photography.
          </p>
          <div className="bg-[#000000] rounded-[29px] h-[69px] w-[190px] flex justify-center items-center p-6 ml-28">
            <div className="font-inter text-[32px] font-semibold flex items-center justify-center text-white">
              Sign up
            </div>
          </div>
        </div>
        <div className="md:w-1/2 w-full">
          <img
            className="w-full h-[586px] object-cover"
            src="https://ben.com.vn/tin-tuc/wp-content/uploads/2021/12/anh-che-cho-hai-huoc-cho-dien-thoai-4.jpg"
          />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full  md:block">
        <img
          className="w-full h-24 md:h-32 lg:h-36 xl:h-40 "
          src="https://firebasestorage.googleapis.com/v0/b/careconnect-2d494.appspot.com/o/images%2F5352e529-74c9-45ef-b0df-ab1a63e16cfa.png?alt=media&token=45e952af-724c-4a5a-96bf-848261d73647"
        />
      </div>
    </div>
  );
}
