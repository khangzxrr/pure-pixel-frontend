import React from "react";

export default function Membership5() {
  return (
    <div className="bg-black ">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 justify-between xl:px-10">
        <div className="flex flex-wrap  p-6 gap-6 justify-center items-center ">
          <img
            className="object-cover h-auto w-auto"
            src="https://s3-alpha-sig.figma.com/img/29bf/8efe/73f45a6efd295fdb581caca36f8f97ad?Expires=1725840000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=XrTxEKnYkP~8SAGeTGf9y7bvOHOYPvA8Gtg2U2x5WonJCylSXhr5mv3dANc6ZnfN2q~1RwGylyE1D67i0yb-GLAHechkmd-VWmrJPWexTDgNWZ2qCv5pTn6E2GCmjdaJRjgLa2qAFvVkb~8Zjw1q0n-aFTmIhOPxkEyZqItAqkQc2KD6OW7dUDGVnz~~VAxJqIqH4BT48LPgNob5V0NzI73vD4Y3-~nK5R2wafJAbDKgdkm7nBwVoSLsDhSajt4j18yM3jXFs0Vu1xLuAr1GcAKtFzJV4K57dBYhBhM1-db2SD2EFr8DyVCvx1AbAb89HFjE1Dmgv3nSYxIMLJJzmw__"
          />
        </div>
        <div className="pt-10 flex flex-col gap-5 p-6  justify-center">
          <p className="font-inter text-[25px] md:text-[30px] lg:text-[34px] xl:text-[34px]  font-extrabold leading-[66.56px]  text-shadow  text-white">
            Customize your Profile
          </p>
          <p className="font-inter text-[16px] font-light leading-[19.36px]   text-white">
            Rearrange, hide, and add tabs to make your Profile page unique to
            you. Feature your best series, work samples, or favorite photos by
            highlighting a Gallery on a separate tab.
          </p>
          <p className="font-inter text-[16px] font-light leading-[19.36px]   text-white">
            Included with
          </p>
          <div className="flex items-center  gap-6 ">
            {/* <div className=" bg-[#20E6C3] md:px-10  p-2 px-8 font-inter text-[32px] font-semibold flex  justify-center text-white text-center">
              Awesome
            </div> */}
            <div className=" bg-[#fff]  md:px-10 p-2 px-8 font-inter text-[32px] font-semibold flex  justify-center text-black text-center">
              Pro
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
