import React from "react";

const MyPhotoshootPackageDetailShowcase = () => {
  return (
    <div className="rounded-lg bg-[#292b2f] flex flex-col gap-2 p-2">
      Bộ sưu tập
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        <div className="h-[200px] overflow-hidden rounded-lg">
          <img
            src="https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png"
            alt=""
            className="size-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default MyPhotoshootPackageDetailShowcase;
