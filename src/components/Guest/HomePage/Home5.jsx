import React from "react";

export default function Home5() {
  return (
    <div className="bg-black ">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 justify-between">
        <div className="pt-10 flex flex-col gap-5 p-6  justify-center">
          <p className="font-inter text-[25px] md:text-[30px] lg:text-[34px] xl:text-[34px]  font-extrabold leading-[66.56px]  text-shadow  text-white">
            Take photos. Win prizes.
          </p>
          <p className="font-inter text-[16px] font-light leading-[19.36px]   text-white">
            Quests are creative photo challenges that encourage you to test your
            skills and submit your best work for a chance to win exciting
            prizes. We launch new Quests with unique themes every week so there
            is always something for everyone!
          </p>
          <div className="   flex  items-center p-6 ">
            <div className=" bg-[#fff]  rounded-[29px] p-4 px-6 font-inter text-[32px] font-semibold flex  justify-center text-black text-center">
              View Quests
            </div>
          </div>
        </div>

        <div className="flex flex-wrap  p-6 gap-6 justify-center items-center ">
          <img
            className="object-cover h-auto w-auto"
            src="https://firebasestorage.googleapis.com/v0/b/careconnect-2d494.appspot.com/o/fima%2FRectangle%20721.png?alt=media&token=0f1b9d62-6677-444f-bdb2-dd7043c33881"
          />
        </div>
      </div>
      <div className="relative">
        <img
          className="w-full h-64 md:h-72 lg:h-80 xl:h-96 object-cover "
          src="https://firebasestorage.googleapis.com/v0/b/careconnect-2d494.appspot.com/o/fima%2FRectangle%20715.png?alt=media&token=d3a15adf-6cee-4395-a45f-d79ee2afad1c"
        />
        <div className="absolute bottom-0 left-0 w-full">
          <p className="text-center font-inter text-[25px] md:text-[30px] lg:text-[34px] xl:text-[34px]  font-extrabold leading-[66.56px]  text-shadow  text-white">
            Licensing
          </p>
        </div>
      </div>
    </div>
  );
}
