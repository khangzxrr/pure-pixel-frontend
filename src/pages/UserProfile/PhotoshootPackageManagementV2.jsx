import React, { useState } from "react";
import PhotoshootPackageApi from "../../apis/PhotoshootPackageApi";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ConfigProvider, Modal, Pagination } from "antd";
import CreatePhotoshootPackage from "./CreatePhotoshootPackage";
import { useModalState } from "../../hooks/useModalState";
import ComButton from "../../components/ComButton/ComButton";
import MyPhotoshootPackageCard from "./MyPhotoshootPackageCard";
import UserProfileApi from "../../apis/UserProfile";
import useModalStore from "../../states/UseModalStore";
import UpdatePhotoshootPackage from "./UpdatePhotoshootPackage";

const PhotoshootPackageManagementV2 = () => {
  const modal = useModalState();
  const {
    isUpdatePhotoshootPackageModal,
    setIsUpdatePhotoshootPackageModal,
    setSelectedUpdatePhotoshootPackage,
    clearDeleteShowcasesList,
  } = useModalStore();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const itemsPerPage = window.innerWidth < 1024 ? 4 : 8;
  const [orderByCreateAt, setOrderByCreateAt] = useState("desc");

  // Fetch current user package details
  const { data: currentPackage } = useQuery({
    queryKey: ["me"],
    queryFn: async () => await UserProfileApi.getMyProfile(),
  });

  // Fetch photoshoot packages
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["findAllPhotoshootPackages", page, orderByCreateAt],
    queryFn: () =>
      PhotoshootPackageApi.getAllPhotoshootPackages(
        itemsPerPage,
        page - 1, // Zero-based page index for API
        orderByCreateAt
      ),
    keepPreviousData: true,
  });

  const listPhotoshootPackages = data?.objects || [];
  const numberOfRecord = data?.totalRecord || 0;
  const totalPages = data?.totalPage || 1;

  const maxPackageCount = currentPackage?.maxPackageCount ?? "Chưa rõ";
  const packageCount = currentPackage?.packageCount ?? "Chưa rõ";
  const usedPercentage = currentPackage
    ? (packageCount / maxPackageCount) * 100
    : 0;
  const handlePageClick = (pageNumber) => {
    if (pageNumber !== page) {
      setPage(pageNumber);
    }
  };
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
      <Modal
        title="Tạo gói chụp"
        visible={modal?.isModalOpen}
        onCancel={modal?.handleClose}
        footer={null}
        width={1000}
        centered
        className="custom-close-icon"
      >
        <CreatePhotoshootPackage onClose={modal?.handleClose} />
      </Modal>
      {isUpdatePhotoshootPackageModal && (
        <UpdatePhotoshootPackage
          onClose={() => {
            setIsUpdatePhotoshootPackageModal(false);
            setSelectedUpdatePhotoshootPackage("");
            clearDeleteShowcasesList();
          }}
        />
      )}

      <div className="min-h-screen p-4">
        <div className="flex justify-between pb-2">
          <div>
            <div className="flex flex-col mb-2">
              <span className="text-[#eee] mb-2">
                Số lượng gói đã sử dụng:{" "}
                <span className="font-semibold">{packageCount} gói </span> /{" "}
                {maxPackageCount} gói
              </span>
            </div>
            <div className="w-full outline outline-2 outline-[#eee] bg-[#eee] rounded-full h-3">
              <div
                className="bg-[#777777] h-3 rounded-full transition-all duration-300"
                style={{ width: `${usedPercentage}%` }}
              ></div>
            </div>
          </div>
          {parseInt(packageCount) < parseInt(maxPackageCount) ? (
            <div>
              <p className="text-sm font-normal m-2">
                Số gói chụp có thể tạo thêm:{" "}
                {Math.floor(maxPackageCount - packageCount)} gói
              </p>
              <ComButton onClick={modal.handleOpen}>Tạo gói chụp</ComButton>
            </div>
          ) : (
            <div className="w-1/4" onClick={() => navigate("/upgrade")}>
              <p className="text-sm font-normal m-2 text-red-500 cursor-pointer">
                Không thể tạo thêm gói chụp vì hết dung lượng, vui lòng nâng cấp
                dung lượng
              </p>
            </div>
          )}
        </div>
        {totalPages > 1 && (
          <ConfigProvider
            theme={{
              token: {
                colorBgContainer: "#1e1e1e",
                colorText: "#b3b3b3",
                colorPrimary: "white",
                colorBgTextHover: "#333333",
                colorBgTextActive: "#333333",
                colorTextDisabled: "#666666",
              },
            }}
          >
            <Pagination
              current={page}
              total={totalPages * itemsPerPage}
              onChange={handlePageClick}
              pageSize={itemsPerPage}
              showSizeChanger={false}
              className="flex justify-end my-2"
            />
          </ConfigProvider>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {listPhotoshootPackages.map((packageDetail) => (
            <div
              key={packageDetail.id}
              onClick={() =>
                navigate(`/profile/photoshoot-package/${packageDetail.id}`)
              }
            >
              <MyPhotoshootPackageCard
                packageDetail={packageDetail}
                page={page}
                setPage={setPage}
                numberOfRecord={numberOfRecord}
                itemsPerPage={itemsPerPage}
              />
            </div>
          ))}
        </div>
      </div>
    </ConfigProvider>
  );
};

export default PhotoshootPackageManagementV2;
