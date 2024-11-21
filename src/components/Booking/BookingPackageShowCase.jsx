import React from "react";

const BookingPackageShowCaseList = ({ photoshootPackage }) => {
  return (
    <div className="flex flex-col bg-[#292b2f] p-4 gap-2 rounded-lg">
      <div className="">Bộ sưu tập</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {photoshootPackage.showcases.map((showcase) => {
          return (
            <div
              key={showcase.id}
              className="h-[200px] w-full overflow-hidden rounded-lg"
            >
              <img
                src={showcase.photoUrl}
                alt=""
                className="size-full object-cover hover:scale-125 transition-all duration-300 ease-in-out"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingPackageShowCaseList;
