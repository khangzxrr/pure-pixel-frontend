import React from "react";
import ComText from "../../ComText/ComText";

export default function Home3() {
  return (
    <div className="  bg-black">
      <div className="pt-10 flex flex-col gap-5">
        <p className="font-inter text-[25px] md:text-[30px] lg:text-[34px] xl:text-[34px] text-center font-extrabold leading-[66.56px]  text-shadow  text-white">
          The best of the best.
        </p>
        <p className="font-inter text-[16px] font-light leading-[19.36px]  text-center text-white">
          Get started by customizing your content feed and uncover endless
          inspiration.
        </p>
        <div className="   flex justify-center items-center p-6 ">
          <div className=" bg-[#fff]  rounded-[29px] p-4 font-inter text-[32px] font-semibold flex items-center justify-center text-black text-center">
            View Editors' Choice
          </div>
        </div>
      </div>

      <div className="flex flex-wrap  p-6 gap-6 justify-center items-center ">
        <div className="flex flex-wrap gap-6  justify-center items-center  ">
          <img
            className="object-cover h-44 "
            src="https://random.imagecdn.app/300/300"
          />
          <img
            className="object-cover h-44 w-auto"
            src="https://random.imagecdn.app/300/150"
          />
        </div>
        <div className="flex flex-wrap gap-6  justify-center items-center ">
          <img
            className="object-cover h-44 w-auto"
            src="https://random.imagecdn.app/300/150"
          />
          <img
            className="object-cover h-44 w-auto"
            src="https://random.imagecdn.app/300/300"
          />
        </div>
      </div>

      <div className="flex flex-wrap  p-6 gap-6 justify-center items-center ">
        <div className="flex flex-wrap gap-6  justify-center items-center ">
          <img
            className="object-cover h-44 w-auto"
            src="https://random.imagecdn.app/300/150"
          />
          <img
            className="object-cover h-44 w-auto"
            src="https://random.imagecdn.app/300/300"
          />
        </div>
        <div className="flex flex-wrap gap-6  justify-center items-center  ">
          <img
            className="object-cover h-44 w-auto"
            src="https://random.imagecdn.app/300/300"
          />
          <img
            className="object-cover h-44 w-auto"
            src="https://random.imagecdn.app/300/150"
          />
        </div>
      </div>
      <div className="relative">
        <img
          className="w-full h-64 md:h-72 lg:h-80 xl:h-96 object-cover "
          src="https://s3-alpha-sig.figma.com/img/a9e9/e7b3/2523be5689822aa362048686b085d7c3?Expires=1725840000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=PU52IyzinYUXyZwVe5Rc7hsXqqcoihILWsD3mKxvUxEKEqCUTxshQHTzYJWbvr0Ys0qXwKgwjZ9VUBh3OGQhpTxnQbOEuvTPjLQCkbXeE4f4~846s~r~jEaHuonRP7OUkN67mxUHnny-WLYtJi5fkW4lvLXojRPDNlWAo7a6tLAvQSJ9LuSwXiaQ5C8UTN5otc~PGbb4r5N0m8mi6jEKfaNMxv79lbqYTD-bqqymSXzczrKZPRaPsOTB-bx1csudYSYElU3hLClhwqMcKBEi0p-8ZmQIoHzyO2oYFTsoNaDDA8Ueywlcev2-iok8L~T8RM2q8PfQD3V7MKX9JJZ10Q__"
        />
        <div className="absolute bottom-0 left-0 w-full">
          <p className="text-center font-inter text-[25px] md:text-[30px] lg:text-[34px] xl:text-[34px]  font-extrabold leading-[66.56px]  text-shadow  text-white">
            Portfolio
          </p>
        </div>
      </div>
    </div>
  );
}
