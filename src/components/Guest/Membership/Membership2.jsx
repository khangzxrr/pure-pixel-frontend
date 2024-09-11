import React from "react";

export default function Membership2() {
  return (
    <div className="bg-black ">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 justify-between xl:px-10">
        <div className="pt-10 flex flex-col gap-5 p-6  justify-center">
          <p className="font-inter text-[25px] md:text-[30px] lg:text-[34px] xl:text-[34px]  font-extrabold leading-[66.56px]  text-shadow  text-white">
            Get data insight to infrom your work
          </p>
          <p className="font-inter text-[16px] font-light leading-[19.36px]   text-white">
            Learn where your photo views are coming from, which of your photos
            get the most likes and comments, how people are finding your work,
            and more.
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

        <div className="flex flex-wrap  p-6 gap-6 justify-center items-center ">
          <img
            className="object-cover h-auto w-auto"
            src="https://s3-alpha-sig.figma.com/img/4964/8d84/ac095bdd3fdac2853488211f352a03e0?Expires=1725840000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=pQOq31Dn2JHE7xVENUWCs2H3NCKXi4cFHl7uPOggaLKcfHAhCwXcIj-uzRGVAHO5YQPjF9vPI~Ih4dRazA9NsPibRxBNGxYKr8srIkvVmDJqA3JUKVGvjf~ZNuj-Q8SrhAyAvGAyB8S0pPVqcfullIpjhkqM4rMafOHd~IZCYQnLWt~Y0vR~kfK7v8cfaOHeXY-KqRBJeBM-9rnDsUISyLRvf~Nyd6bBwXuX9NvFLSmvj36BQIKDQLc55qzIYjPpUdbcq36k1B24s0Xru7QADBROJ6Y2CgtnbUCe3vEchEvhYxIATdYCSadTRnb0o1yqKwXEE3b03o2K8zoHk0GYcQ__"
          />
        </div>
      </div>
    </div>
  );
}
