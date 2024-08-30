import React from "react";

export default function Membership7() {
  return (
    <div className="bg-black ">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 justify-between xl:px-10">
        <div className="flex flex-wrap  p-6 gap-6 justify-center items-center ">
          <img
            className="object-cover h-auto w-auto"
            src="https://s3-alpha-sig.figma.com/img/f9cd/ef3f/b9356dfcf8debb6b044043183ea0ab23?Expires=1725840000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=h1S1G97BjJnetbD7BiuAjbCOfrKalOOv7zX9fXdEgPqeH0ElUXrOTIgyIipXrAfLULCTPdq2Ua5K~PGhg4~6JnUGEaICOfu5ChU~sK4DoOzLe-NiSXUl7ZzHlYm~SUsNTZ-sxAY049-j~yE4VP3-XEf9UyTDmjy4zBE9Icc5760VTbCO6~YoMWQXXU0-jnmFKMefXxp80U959SsE8G8wQoYwneuYiNeJUKvXsoW3J0Jwcn5u5wSVbI3AJkuN5RrI98Ex-wLWZ86rg2XPo6UhvsUbRsMfRfVfXZi-vVFqQs30AXGxRptbvEV1YZBAiCsaWmblGcvou74hW3OjqtT3mg__"
          />
        </div>
        <div className="pt-10 flex flex-col gap-5 p-6  justify-center">
          <p className="font-inter text-[25px] md:text-[30px] lg:text-[34px] xl:text-[34px]  font-extrabold leading-[66.56px]  text-shadow  text-white">
            Get discovered and hired
          </p>
          <p className="font-inter text-[16px] font-light leading-[19.36px]   text-white">
            List yourself as available for hire and show in search results when
            you create a Resume. Get discovered by clients looking to hire for
            photography projects in your area and kickstart your career.
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
