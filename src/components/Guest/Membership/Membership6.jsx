import React from "react";

export default function Membership6() {
  return (
    <div className="bg-black ">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 justify-between xl:px-10">
        <div className="pt-10 flex flex-col gap-5 p-6  justify-center">
          <p className="font-inter text-[25px] md:text-[30px] lg:text-[34px] xl:text-[34px]  font-extrabold leading-[66.56px]  text-shadow  text-white">
            Share your Resume with potential clients
          </p>
          <p className="font-inter text-[16px] font-light leading-[19.36px]   text-white">
            Let everyone know why they should hire you. List your services,
            skills and specialties. Add your Resume on your Profile and on the
            Directory for potential clients to see.
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

        <div className="flex flex-wrap  p-6 gap-6 justify-center items-center ">
          <img
            className="object-cover h-auto w-auto"
            src="https://firebasestorage.googleapis.com/v0/b/careconnect-2d494.appspot.com/o/fima%2Fimage%202%20(2).png?alt=media&token=732595f9-fce3-4968-b609-60a033fd2368"
          />
        </div>
      </div>
    </div>
  );
}
