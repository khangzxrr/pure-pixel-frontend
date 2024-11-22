import { MessageCircleMore } from "lucide-react";
import React from "react";
import formatPrice from "../../utils/FormatPriceUtils";
import UsePhotographerFilterStore from "../../states/UsePhotographerFilterStore";
import UseUserOtherStore from "../../states/UseUserOtherStore";
import UseUserProfileStore from "../../states/UseUserProfileStore";
import { useNavigate } from "react-router-dom";
const formatNumber = (number) => {
  return new Intl.NumberFormat("de-DE").format(number);
};
const PhotoshootPackageCard = ({ key, photoshootPackage, onClick }) => {
  const navigate = useNavigate();
  const setNamePhotographer = UsePhotographerFilterStore(
    (state) => state.setNamePhotographer
  );
  const setUserOtherId = UseUserOtherStore((state) => state.setUserOtherId);
  const setActiveTitle = UseUserProfileStore((state) => state.setActiveTitle);
  const setNameUserOther = UseUserOtherStore((state) => state.setNameUserOther);
  return (
    <div className="flex flex-col group h-auto  bg-[#36393f] rounded-lg overflow-hidden">
      <div className="h-[200px] overflow-hidden rounded-t-lg relative">
        <img
          src={photoshootPackage.thumbnail}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 w-full p-2 bg-black/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition duration-200 ease-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 overflow-hidden rounded-full">
                <img
                  src={photoshootPackage.user.avatar}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                onClick={() => {
                  setNamePhotographer(photoshootPackage?.user.name);
                  setNameUserOther(photoshootPackage?.user.name);
                  setActiveTitle(null);

                  setUserOtherId(photoshootPackage?.user.id);
                  navigate(`/user/${photoshootPackage?.user.id}`);
                }}
                className="truncate max-w-[100px] hover:underline underline-offset-2 hover:cursor-pointer sm:max-w-[150px] text-sm sm:text-base"
              >
                {photoshootPackage.user.name}
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button className="px-2 py-1 text-[12px]  rounded-full border hover:bg-[#4f545c]">
                Theo dõi
              </button>
              <div className="hover:cursor-pointer">
                <MessageCircleMore className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        onClick={onClick}
        className="flex flex-col gap-2 px-4 py-2 hover:cursor-pointer"
      >
        <div className="text-lg sm:text-2xl font-semibold">
          {photoshootPackage.title}
        </div>
        <div className="font-normal text-base sm:text-lg">
          {formatPrice(photoshootPackage.price)}
        </div>
        <div>
          <div className="text-sm sm:text-base font-normal">Mô tả chung:</div>
          <div className="font-normal text-xs sm:text-sm">
            <ul className="list-disc list-inside">
              <li>{photoshootPackage.description}</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-end px-4 pb-2 ">
          <span className="text-sm  font-normal text-gray-400">
            {photoshootPackage._count.bookings
              ? formatNumber(photoshootPackage._count.bookings)
              : "Chưa có"}{" "}
            lượt thuê
          </span>
        </div>
      </div>
    </div>
  );
};

export default PhotoshootPackageCard;
