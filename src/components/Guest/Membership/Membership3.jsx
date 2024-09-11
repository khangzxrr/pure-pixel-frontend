import React from "react";

export default function Membership3() {
  return (
    <div className="bg-black ">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 justify-between xl:px-10">
        <div className="flex flex-wrap  p-6 gap-6 justify-center items-center ">
          <img
            className="object-cover h-auto w-auto"
            src="https://s3-alpha-sig.figma.com/img/1826/8aeb/97d0f34601b0f5aff7d741d62e790f02?Expires=1725840000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=Czchd~tF5byOi8uiLbMyNWBlWVhv0DiDqOEJ8QnAKSegiu-Kz7xrn7-iQpNuEoCEQmeZ9GRpowfACcgdFzHUlBaAtl7DSbYu0VCDglVJ1o42WlasisBkqjguOv0H7ZA0Q4EDfgslm50mjy1Qs19XEExn13AvvBgnrfyT5ur~4oyX8nxGNaP2xeiPpND6iK1O~DUEdfTUcuh33KL1qwcKdHTyW3eXGTiipqzJ~aruozRFvg1FWyRMk~YTChHZTeLVm15-0UZi0Ek8t9fW~YDslPeFbpcc6GiJkRUGG4wZRPy5FJIiqWTvemB-2hNyq3zEdcN5GipYkbYe-XmvQrZ2Tg__"
          />
        </div>
        <div className="pt-10 flex flex-col gap-5 p-6  justify-center">
          <p className="font-inter text-[25px] md:text-[30px] lg:text-[34px] xl:text-[34px]  font-extrabold leading-[66.56px]  text-shadow  text-white">
            Upload as many photos as you want
          </p>
          <p className="font-inter text-[16px] font-light leading-[19.36px]   text-white">
            Want to share a large series or test multiple versions of your
            photos? With unlimited uploads, you can add many images as you’d
            like—the only limit is your creativity.
          </p>
          <p className="font-inter text-[16px] font-light leading-[19.36px]   text-white">
            Included with
          </p>
          <div className="flex items-center  gap-6 ">
            <div className=" bg-[#20E6C3] md:px-10  p-2 px-8 font-inter text-[32px] font-semibold flex  justify-center text-white text-center">
              Awesome
            </div>
            <div className=" bg-[#fff]  md:px-10 p-2 px-8 font-inter text-[32px] font-semibold flex  justify-center text-black text-center">
              Pro
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
