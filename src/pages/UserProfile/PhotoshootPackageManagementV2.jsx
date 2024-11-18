import React, { useState } from "react";
import PhotoshootPackageCard from "../../components/Booking/BookingPackageCard";
import PhotoshootPackageApi from "../../apis/PhotoshootPackageApi";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ConfigProvider, Modal } from "antd";
import CreatePhotoshootPackage from "./CreatePhotoshootPackage";
import { useModalState } from "../../hooks/useModalState";
import ComButton from "../../components/ComButton/ComButton";
import upgradePackageApi from "../../apis/upgradePackageApi";

const PhotoshootPackageManagementV2 = () => {
  const modal = useModalState();

  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  const { data: currentPackage } = useQuery({
    queryKey: "current-upgrade-package",
    queryFn: async () => await upgradePackageApi.getCurrentPackage(),
  });
  console.log(
    currentPackage && currentPackage.upgradePackageHistory.maxPackageCount
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["findAllPhotoshootPackages", page],
    queryFn: () =>
      PhotoshootPackageApi.getAllPhotoshootPackages(itemsPerPage, page - 1),
    keepPreviousData: true,
  });
  const usedPackage = (data && data.totalRecord) || 0;
  const listPhotoshootPackages = data?.objects || [];
  const usedPercentage =
    usedPackage &&
    currentPackage &&
    usedPackage / currentPackage.upgradePackageHistory.maxPackageCount;

  console.log("usedPercentage:", usedPercentage);
  console.log("Can create more packages:", usedPercentage < 1);
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
        <div className="flex justify-between pb-2">
          <div>
            <div className="flex flex-col mb-2">
              <span className="text-[#eee] mb-2">
                Số lượng gói đã sử dụng:{" "}
                <span className="font-semibold">{usedPackage} gói </span> /{" "}
                {currentPackage
                  ? currentPackage.upgradePackageHistory.maxPackageCount
                  : "Chưa rõ"}{" "}
                gói
              </span>
            </div>
            <div className="w-full outline outline-2 outline-[#eee] bg-[#eee] rounded-full h-3">
              <div
                className="bg-[#777777] h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${usedPercentage * 100}%`,
                }}
              ></div>
            </div>
          </div>
          {!usedPercentage < 1 ? (
            <div>
              <p className="text-sm font-normal m-2">
                Số gói chụp có thể tạo thêm:{" "}
                {Math.floor(
                  currentPackage.upgradePackageHistory.maxPackageCount -
                    usedPackage
                )}{" "}
                gói
              </p>
              <ComButton onClick={modal.handleOpen}>Tạo gói chụp</ComButton>
            </div>
          ) : (
            <div className="w-1/4" onClick={() => navigate("/upgrade")}>
              <p className="text-sm font-normal m-2 text-red-500  cursor-pointer">
                Không thể tạo thêm gói chụp vì hết dung lượng, vui lòng để nâng
                cấp dung lượng
              </p>
            </div>
          )}
        </div>
        <Modal
          title="Sửa thông tin ảnh"
          visible={modal?.isModalOpen} // Use state from Zustand store
          onCancel={modal?.handleClose} // Close the modal on cancel
          footer={null}
          width={1000} // Set the width of the modal
          centered={true}
        >
          <CreatePhotoshootPackage onClose={modal?.handleClose} />
        </Modal>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {listPhotoshootPackages.map((photoshootPackage) => (
            <div
              onClick={() =>
                navigate(`/profile/photoshoot-package/${photoshootPackage.id}`)
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
