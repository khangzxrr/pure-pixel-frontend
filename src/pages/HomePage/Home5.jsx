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
            src="https://s3-alpha-sig.figma.com/img/eb69/f8ac/a5cb0926587d387bfa0bc5ab1abd3880?Expires=1725840000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=C2m0t50K6xh55kKC~eM3BRM2OJGboClRNhVcgyBZ5sZOZ0s6i1rBtGWbgJhQat0tHxdx1deSCMO8cJ1BELQmSexkXpj1T0Pn1s8HJi-ltAdufqNDJ8eRNWgHV9APUchu-pxszWN2wENWUgj7pjHltzVSt6xpVN8ZtmsTzOcMYmGYZDKqtzU7SYujAPdS~ksDMKSVZlL7QgF0U9qN~ZuAZLdK~eL12hCcNmXIh6dyxX~mER~DR4SBfZDfojpW58XeqGBuokzNThBXTmdNuxnxtt2F-EUN61eaorKnD8tqKoT7chyVpKqMQHyVloNdBaNRmdeeahdmCg0lSyvChfYYzQ__"
          />
        </div>
      </div>
      <div className="relative">
        <img
          className="w-full h-64 md:h-72 lg:h-80 xl:h-96 object-cover "
          src="https://s3-alpha-sig.figma.com/img/d520/9e93/3483b6f5d4c60cb1182ee056605fc862?Expires=1725840000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=PV6Jf3x2Hs6Fr4r7xGP6KbwTwzrY5nEvfTdRH4tkGKDT5Ygrj4IwJUqwTUBL-cRhABDeTj5q9hGuC~bG-QRa-x443fuZE5~wqXQ0MmXrvkdgwufpFp0OhFCjJ2DJUzXhWiDzz7V4BWhW7UeArYAzmtezett2yJfVWeyfaYZHMlF4y-vuohZbEJFMtbU~zK7DdXjepzafGsq~UDVk1gAkf3SIgglEVPTRYthTUOvdf3a9HMP4ZSCM4fNiURioCROimSvfLiIosZzP7ci2pBC7ySQAlunss0zvJD0F6XKPJL~whgRHNfiB1nWVSHPal5u5wezXBONVhArnSBYsoyWXfw__"
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
