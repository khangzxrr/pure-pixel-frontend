import React from "react";
import formatPrice from "../../utils/FormatPriceUtils";
import calculateDateDifference from "../../utils/calculateDateDifference";
import {
  EditOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Popconfirm, Tooltip } from "antd";
import PhotoshootPackageApi from "../../apis/PhotoshootPackageApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useModalStore from "../../states/UseModalStore";
import { PiWarningCircleFill, PiWarningOctagonFill } from "react-icons/pi";
const MyPhotoshootPackageCard = ({
  packageDetail,
  page,
  setPage,
  numberOfRecord,
  itemsPerPage,
}) => {
  const {
    setIsUpdatePhotoshootPackageModal,
    setSelectedUpdatePhotoshootPackage,
  } = useModalStore();

  const queryClient = useQueryClient();
  const deletePhotoshootPackage = useMutation({
    mutationFn: async (data) => {
      // Await inside mutation function
      return await PhotoshootPackageApi.deletePhotoshootPackage(
        packageDetail.id
      );
    },
    onSuccess: () => {
      // console.log("deletePhotoshootPackage success", page);
      const updatedNumberOfRecord = numberOfRecord - 1;
      // console.log(
      //   updatedNumberOfRecord,
      //   itemsPerPage,
      //   page,
      //   Math.ceil(updatedNumberOfRecord / itemsPerPage) < page
      // );
      if (Math.ceil(updatedNumberOfRecord / itemsPerPage) < page) {
        // console.log(`move to previous page ${page - 1}`);
        setPage(page - 1);
      }
      queryClient.invalidateQueries("findAllPhotoshootPackages");
    },
    onError: (error) => {
      notificationApi(
        "error",
        "Tạo gói chụp thất bại",
        "Không thể tạo gói của bạn. Vui lòng thử lại."
      );
    },
  });
  const { mutate: deletePhotoshootPackageMutate, isPending } =
    deletePhotoshootPackage;
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-[#36393f] group hover:cursor-pointer">
      <div className="relative h-[250px] overflow-hidden rounded-t-lg">
        <img
          src={packageDetail.thumbnail}
          alt="demo"
          className="size-full object-cover  group-hover:scale-125 transition-all duration-300 ease-in-out"
        />
        {packageDetail.status === "DISABLED" && (
          <div className="absolute gap-2 flex items-center justify-center animate-pulse bottom-0 left-0 w-full bg-red-500 p-2">
            <PiWarningOctagonFill className="text-2xl" /> Gói dịch vụ này đang
            bị vô hiệu hóa
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 px-2">
        <div className=" text-2xl flex flex-row justify-between">
          <p className="line-clamp-1  ">{packageDetail.title}</p>
          <div className="flex items-center gap-1">
            <Popconfirm
              onConfirm={(e) => {
                e.preventDefault();
                e.stopPropagation();
                deletePhotoshootPackageMutate();
              }}
              onCancel={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              disabled={isPending} // Ensure this is "disabled" not "disable"
              title="Bạn có chắc chắn muốn xóa gói này không?"
              okText={
                isPending ? (
                  <LoadingOutlined className="text-red-500 hover:text-red-600" />
                ) : (
                  "Có"
                )
              }
              cancelText="Không"
              placement="bottom"
            >
              <Tooltip title="Xóa gói" color="red" placement="top">
                <div
                  className="text-lg hover:opacity-80 px-2 py-1 rounded-lg"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <DeleteOutlined className="text-red-500 hover:text-red-600" />
                </div>
              </Tooltip>
            </Popconfirm>

            {packageDetail.status === "ENABLED" ? (
              <Tooltip title="Cập nhật gói" color="blue" placement="top">
                <div
                  className="text-lg hover:opacity-80 px-2 py-1 rounded-lg"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsUpdatePhotoshootPackageModal(true);
                    setSelectedUpdatePhotoshootPackage(packageDetail.id);
                  }}
                >
                  <EditOutlined className="text-blue-500 hover:text-blue-600" />
                </div>
              </Tooltip>
            ) : (
              <Tooltip
                title="Gói chụp bị vô hiệu hóa"
                color="gray"
                placement="top"
              >
                <div className="text-lg hover:opacity-80 px-2 py-1 rounded-lg">
                  <EditOutlined className="text-gray-500 " />
                </div>
              </Tooltip>
            )}
          </div>
        </div>
        <div className="font-normal underline underline-offset-2">
          {formatPrice(packageDetail.price)}
        </div>
        <div className="flex flex-col mt-2">
          <div className="flex items-center gap-2 font-semibold">
            Mô tả chung
          </div>
          <p className=" font-normal text-gray-200">
            {packageDetail.description}
          </p>
        </div>
      </div>
      <div className=" flex items-center justify-between p-2 text-sm font-normal text-[#9ca3af]">
        <div>Tạo {calculateDateDifference(packageDetail.createdAt)}</div>
        <div>{packageDetail._count.bookings} lượt thuê</div>
      </div>
    </div>
  );
};

export default MyPhotoshootPackageCard;
