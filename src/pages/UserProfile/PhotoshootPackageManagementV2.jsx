import React, { useState } from "react";
import PhotoshootPackageCard from "../../components/Booking/BookingPackageCard";
import PhotoshootPackageApi from "../../apis/PhotoshootPackageApi";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ConfigProvider, Modal } from "antd";
import CreatePhotoshootPackage from "./CreatePhotoshootPackage";
import { useModalState } from "../../hooks/useModalState";
import ComButton from "../../components/ComButton/ComButton";

const PhotoshootPackageManagementV2 = () => {
  const modal = useModalState();

  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["findAllPhotoshootPackages", page],
    queryFn: () =>
      PhotoshootPackageApi.getAllPhotoshootPackages(itemsPerPage, page - 1),
    keepPreviousData: true,
  });
  const totalPages = data?.totalPage || 1;
  const listPhotoshootPackages = data?.objects || [];
  console.log(listPhotoshootPackages);

  return (
    <ConfigProvider
      theme={{
        components: {
          Modal: {
            contentBg: "#292b2f",
            headerBg: "#292b2f",
            titleColor: "white",
          },
        },
      }}
    >
      <div className="min-h-screen p-4">
        <div className="flex justify-end pb-2">
          <div>
            <ComButton onClick={modal.handleOpen}>Tạo gói chụp</ComButton>
          </div>
        </div>
        <Modal
          title="Sửa thông tin ảnh"
          visible={modal?.isModalOpen} // Use state from Zustand store
          onCancel={modal?.handleClose} // Close the modal on cancel
          footer={null}
          width={1000} // Set the width of the modal
          style={{ top: 22 }} // Set the top position of the modal
        >
          <CreatePhotoshootPackage onClose={modal?.handleClose} />
        </Modal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {listPhotoshootPackages.map((photoshootPackage) => (
            <div
              onClick={() =>
                navigate(`/profile/booking-package/${photoshootPackage.id}`)
              }
            >
              <PhotoshootPackageCard photoshootPackage={photoshootPackage} />
            </div>
          ))}
        </div>
      </div>
    </ConfigProvider>
  );
};

export default PhotoshootPackageManagementV2;
