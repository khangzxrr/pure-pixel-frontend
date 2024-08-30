import React from "react";
import ComButton from "./../../components/ComButton/ComButton";
import ComText from "../../components/ComText/ComText";

export default function Home4() {
  return (
    <div className="  bg-black">
      <div className="pt-10 flex flex-col gap-5">
        <p className="font-inter text-[25px] md:text-[30px] lg:text-[34px] xl:text-[34px] text-center font-extrabold leading-[66.56px]  text-shadow  text-white">
          Designed and built for photographers
        </p>
        <p className="font-inter text-[16px] font-light leading-[19.36px]  text-center text-white">
          Create your own high-quality website in minutes. Portfolios allows you
          to share your work externally so you can build your own brand and
          market yourself as a professional photographer.
        </p>
        <div className="   flex justify-center items-center p-6 ">
          <div className=" bg-[#fff]  rounded-[29px] p-4 px-6 font-inter text-[32px] font-semibold flex items-center justify-center text-black text-center">
            Get Started
          </div>
        </div>
      </div>

      <div className="flex flex-wrap  p-6 gap-6 justify-center items-center ">
        <div className="flex flex-wrap gap-6  justify-center items-center ">
          <img
            className="object-cover h-44 w-auto"
            src="https://s3-alpha-sig.figma.com/img/5f2d/ea50/53d1be9d29bd63b7a430e322f01c67c9?Expires=1725840000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=c8dm8FAeMt2z2XwSxRjM-DFuKF44Zrd1wJSdODmeUwz23pWL-1lPE8EKeTLnAGmfPWC4Qv7Dohx7iuifvUXABALLoDIVfLQPAPeKYDWV7MfemB5k4QNvW-FSFhJkaJEB~sfzaXDp7ZxTuAvEzHNl3l7wil3qPOPci~QO2BVQbg8TV5kBYRDdD9Ha6ADfCqobZ7mg1MIqwUVb8Hl2AXbZCTlVcVIhsuMKtQieLI03RiAIg-LC3SoJ7zgtnONJkLpplqtYuIFRHIEJpTIiTC6cTV3k20u9NlGOP27Wd5uLaHD5wv-bTKkZO1NFs4gF9joex0aYZRMUm14SWzjL93sYfg__"
          />
        </div>
      </div>
      <div className="relative">
        <img
          className="w-full h-64 md:h-72 lg:h-80 xl:h-96 object-cover "
          src="https://s3-alpha-sig.figma.com/img/256f/4c45/6fad802949421bd0325ab5d2829f3dc0?Expires=1725840000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=mw0oSxQNV1zweNO43VGj5tirEdn2KZqKQM1aXOvKZEQG2~m15VLGblBehYpNL1JVQNDhXJVz-j01vNj7UMp1FH3V0N4bzOFGDdTHpE30D0SN1c10WgXsLkYR5zrfj8Lc-gl05a5eoUOvyUoyTczAnZmSiqUc3rlWtIzvUDWrGgivbwNuJSIMltqL7gQydUdOIhnpzYzHNs9qpXUpj6hwR2c5l4pwG4C5FLcTiuxdWN~N7HlMWay5FFT8fpdlXfIK1CtJHwpcNaWFf6Iixyzs6tTZfIMnzFmYbGknZW8vbFykGeNlO5sRYHFGOHkh1ZwvhZ9wOpFfutjnzxn4gWwKIA__"
        />
        <div className="absolute bottom-0 left-0 w-full">
          <p className="text-center font-inter text-[25px] md:text-[30px] lg:text-[34px] xl:text-[34px]  font-extrabold leading-[66.56px]  text-shadow  text-white">
            Quests
          </p>
        </div>
      </div>
    </div>
  );
}
