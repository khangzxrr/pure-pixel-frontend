import React from "react";
import ComButton from "./../../components/ComButton/ComButton";
import ComText from "../../components/ComText/ComText";

export default function Home6() {
  return (
    <div className="  bg-black ">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 justify-between">
        <div className="flex flex-wrap  p-6 gap-6 justify-center items-center ">
          <img
            className="object-cover h-auto w-auto"
            src="https://s3-alpha-sig.figma.com/img/4958/c1bb/9e94e4e7b46972c3fa25f504a0c44e8f?Expires=1725840000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=SkZFZBnsLDQOAYvfwVytYoVKRuUWrbvh5q85sa6PKtdMhFsFZDMIqFzjBPSZPa0QG5y9y-7i23cZm62vt5JirD0qDtVOwvgEWrXa4wY5Xr2C8kpBOMWu0YlRDQG59-ekB22-ngZTPpeumk1SkMThUfwYdPw-Asqh-HAxVowtiFqCmQT9AT4ZJ6omlR1KL-bAt7srzX5FW0yVdp~8hbsceo13xGs5m8ls~cMKE~~Y~aQP9CWhxwv7dJCaZ90EX3jQiSAXNa-S7UhWqBXHusxOgp3rAd42h8XsYicpYWFoMlfKU7qIVdiXrPKlEw7MJuLrkSlQBBu66Hz9ss1dMwvhlw__"
          />
        </div>
        <div className="pt-10 flex flex-col gap-5 p-6  justify-center">
          <p className="font-inter text-[25px] md:text-[30px] lg:text-[34px] xl:text-[34px]  font-extrabold leading-[66.56px]  text-shadow  text-white">
            Get paid for your photos
          </p>
          <p className="font-inter text-[16px] font-light leading-[19.36px]   text-white">
            Don’t let your photos sit there gathering dust, like on other
            platforms. Gain exposure and get paid for your work with 500px
            Licensing. Paid members earn up to 100% royalties and free members
            earn up to 60% when you license your photos exclusively with 500px.
          </p>
          <div className="   flex  items-center p-6 ">
            <div className=" bg-[#fff]  rounded-[29px] p-4 px-6 font-inter text-[32px] font-semibold flex  justify-center text-black text-center">
              Tell me more
            </div>
          </div>
        </div>
      </div>

      <div className="pt-10 flex flex-col gap-5 bg-white">
        <p className="font-inter text-[25px] md:text-[30px] lg:text-[34px] xl:text-[34px] text-center font-extrabold leading-[66.56px]  text-shadow  text-black">
          Join our community today
        </p>
        <p className="font-inter text-[16px] font-light leading-[19.36px]  text-center text-black">
          Today and get rewarded for your love of photography.
        </p>
        <div className="   flex justify-center items-center p-6 ">
          <div className=" bg-[#000]  rounded-[29px] p-4 px-8 font-inter text-[32px] font-semibold flex items-center justify-center text-white text-center">
            Sign up
          </div>
        </div>
      </div>
    </div>
  );
}
