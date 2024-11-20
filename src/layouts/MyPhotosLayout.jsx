import React from "react";
import PhotoProfile from "../components/PhotoProfile/PhotoProfile";
import MyPhotoP from "../components/PhotoProfile/MyPhotoP";
import UserService from "../services/Keycloak";
import { useKeycloak } from "@react-keycloak/web";
import UpgradeToPtg from "../components/PhotoProfile/UpgradeToPtg";
import { MdNoPhotography } from "react-icons/md";
import UpdatePhotoModal from "../components/PhotoProfile/UpdatePhotoModal";
import useModalStore from "../states/UseModalStore";
import UpdateMapModal from "../components/PhotoProfile/UpdateMapModal";
const MyPhotosLayout = () => {
  const { isUpdatePhotoModal, isUpdateOpenMapModal } = useModalStore();
  const { keycloak } = useKeycloak();
  const userData = UserService.getTokenParsed();

  return (
    <div className="flex flex-col gap-1 p-1">
      {isUpdatePhotoModal && !isUpdateOpenMapModal && <UpdatePhotoModal />}{" "}
      {!isUpdatePhotoModal && isUpdateOpenMapModal && <UpdateMapModal />}{" "}
      {/* Render Modal conditionally */}
      <div className="p-[24px]  bg-[#292b2f]">
        <PhotoProfile userData={userData} />
      </div>
      <div>
        {userData?.resource_access?.purepixel?.roles.includes(
          "photographer"
        ) ? (
          <MyPhotoP />
        ) : (
          <div className="flex flex-col items-center justify-center h-[500px] ">
            <MdNoPhotography className="text-[100px] text-[#8b8d91]" />
            <div className="font-normal text-[#8b8d91]">
              Hãy{" "}
              <span className="font-bold text-[#eee] hover:underline underline-offset-2 hover: cursor-pointer">
                nâng cấp
              </span>{" "}
              trở thành
              <span className="font-bold"> Nhiếp ảnh gia</span> để được tải ảnh
              lên !
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPhotosLayout;
