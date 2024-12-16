import React, { useState } from "react";
import PhotoProfile from "../components/PhotoProfile/PhotoProfile";
import MyPhotoP from "../components/PhotoProfile/MyPhotoP";
import UserService from "../services/Keycloak";
import { useKeycloak } from "@react-keycloak/web";
import UpgradeToPtg from "../components/PhotoProfile/UpgradeToPtg";
import { MdNoPhotography } from "react-icons/md";
import UpdatePhotoModal from "../components/PhotoProfile/UpdatePhotoModal";
import useModalStore from "../states/UseModalStore";
import UpdateMapModal from "../components/PhotoProfile/UpdateMapModal";
import { ConfigProvider, Modal } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNotification } from "../Notification/Notification";
import PhotoApi from "../apis/PhotoApi";
import UserProfileApi from "../apis/UserProfile";
const MyPhotosLayout = () => {
  const {
    isUpdatePhotoModal,
    isUpdateOpenMapModal,
    isDeletePhotoConfirmModal,
    setIsDeletePhotoConfirmModal,
    deletePhotoId,
    setDeletePhotoId,
    numberOfRecord,
  } = useModalStore();
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  const { keycloak } = useKeycloak();
  const userData = UserService.getTokenParsed();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["me"],
    queryFn: () => UserProfileApi.getMyProfile(),
  });

  const deletePhoto = useMutation({
    mutationFn: (id) => PhotoApi.deletePhoto(id),
  });
  const queryClient = useQueryClient();
  const { notificationApi } = useNotification();
  const handleDeletePhoto = async () => {
    try {
      await deletePhoto.mutateAsync(deletePhotoId, {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: ["my-photo"] });

          const updatedNumberOfRecord = numberOfRecord - 1;
          // console.log(page);
          if (
            Math.ceil(updatedNumberOfRecord / itemsPerPage) < page &&
            page > 1
          ) {
            // console.log(`move to previous page ${page - 1}`);
            setPage(page - 1);
          }
        },
        onError: () => {
          notificationApi(
            "error",
            "Chưa thể xóa ảnh",
            "Xóa ảnh thất bại, vui lòng thử lại",
            "",
            0,
            "delete-photo-error"
          );
        },
      });
      setDeletePhotoId(""); // Clear the delete photo id after successful delete
      setIsDeletePhotoConfirmModal(false); // Close the confirmation modal
    } catch (error) {
      message.error("Chưa thể xóa ảnh");
      setIsDeletePhotoConfirmModal(false); // Close the confirmation modal in case of error
    }
  };
  return (
    <div className="flex flex-col gap-1 p-1">
      <ConfigProvider
        theme={{
          components: {
            Modal: {
              contentBg: "#2f3136",
              headerBg: "#2f3136",
              titleColor: "white",
            },
          },
        }}
      >
        {isUpdatePhotoModal && !isUpdateOpenMapModal && <UpdatePhotoModal />}{" "}
        {!isUpdatePhotoModal && isUpdateOpenMapModal && <UpdateMapModal />}{" "}
        {isDeletePhotoConfirmModal && (
          <Modal
            visible={isDeletePhotoConfirmModal}
            onOk={handleDeletePhoto}
            onCancel={() => setIsDeletePhotoConfirmModal(false)}
            okText="Xóa"
            cancelText="Hủy"
            width={500}
            centered={true}
            bodyStyle={{ padding: 0 }}
            className="custom-close-icon "
          >
            <p className="text-white text-xl font-semibold">
              Bạn có chắc muốn xóa ảnh này không?
            </p>
          </Modal>
        )}
      </ConfigProvider>

      {/* Render Modal conditionally */}
      <div
        className={`relative p-[24px]  bg-cover bg-center `}
        style={{
          backgroundImage: `url('${data?.cover}')`,
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
        <div className="relative">
          <PhotoProfile userData={userData} />
        </div>
      </div>
      <div>
        {userData?.resource_access?.purepixel?.roles.includes(
          "photographer"
        ) ? (
          <MyPhotoP page={page} setPage={setPage} itemsPerPage={itemsPerPage} />
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
