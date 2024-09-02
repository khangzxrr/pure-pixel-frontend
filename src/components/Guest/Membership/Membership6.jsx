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
            src="https://s3-alpha-sig.figma.com/img/168d/3742/5718ce555484844738d18757e427fa9b?Expires=1725840000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=A4JWQLqDSAuoJU7IraTrnBkBhKuw7I02qR8D4IOO16N97syoz5-beV-0N0j57ew-erq-6C88SPTcHTbXfC6cB2AfBW3C-~NOnidUMYXX8OOb1XBZwArpKJz5nF9gw58eKMZRBwcyW5CsXz3Kzs3fJ9jA2zosgCTT2MpDE7Xw5rCtYoef4X9GTzB8RgMPv60LOP5I3ec~8~-sow-1ORoS6Dxa4YQlLpvumuCjt9fvDmtfjnDsIIA1qyrDUaCDAF~wh00UFdNju4RMAGiz~XyC7gVsBrvl6VwP8xSgRjPN3XpE28CJdhe3nL7chP2EBiPjxL6Y~2YrYEsoWCJDdmCQ-w__"
          />
        </div>
      </div>
    </div>
  );
}
