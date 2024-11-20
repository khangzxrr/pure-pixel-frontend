import React from "react";
import { useKeycloak } from "@react-keycloak/web";

export default function Home6() {
  const { keycloak } = useKeycloak();

  return (
    <div className="  bg-black ">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 justify-between">
        <div className="flex flex-wrap  p-6 gap-6 justify-center items-center ">
          <img
            className="object-cover h-auto w-auto"
            src="https://firebasestorage.googleapis.com/v0/b/careconnect-2d494.appspot.com/o/fima%2FRectangle%20722.png?alt=media&token=28ddc790-c781-402d-81a1-a153b4c361fb"
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
          {keycloak.authenticated || (
            <div
              onClick={() => keycloak.login()}
              className="bg-[#000000] z-50 rounded-[29px] h-[69px] w-[190px] flex justify-center items-center p-6 cursor-pointer hover:bg-[#333333] transition-all duration-300"
            >
              <div className="font-inter text-[32px] font-semibold flex items-center justify-center text-white">
                Sign up
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
