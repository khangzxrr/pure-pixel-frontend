import React from "react";
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
          src="https://s3-alpha-sig.figma.com/img/73be/8be9/44d9c01accde0c8f1279e2da2e8d7d64?Expires=1725840000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=qHR~0SJpcmMBRSKxGIhjtup~IcxU3UXaeKab8lq2CexBNVuzhzn9oCOki1X-twpTQ6ompf~kEGxipnSI3K3kGg89JQt8hXBuakRklFA4eYeakuRSguUWTHMA95VeR8mV0MkywpA9--sj91SUbfh6c6e-Zxmwdeq92OhPSJ192zVjIf4-mj8RgD3qrsd9ZkUC6DK2aJiSS8pWCbfvvOUgp0PxTxDjY8~677Yt15qV6cW0i3q70ZmrsLRpGfVAKtiMRO2BjCp5k35AU3uEMi1zUpSrffSKGr3R1UwsnWCjYK6laHRF3KViI-CZrRisG7Kj0EZACipMGdMOM83lkfHRUg__"
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
