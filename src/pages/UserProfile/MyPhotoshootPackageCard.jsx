import React from "react";
import formatPrice from "../../utils/FormatPriceUtils";
import calculateDateDifference from "../../utils/calculateDateDifference";
import {
  EditOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Tooltip } from "antd";
import PhotoshootPackageApi from "../../apis/PhotoshootPackageApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useModalStore from "../../states/UseModalStore";
const MyPhotoshootPackageCard = ({ packageDetail, page }) => {
  const {
    setIsUpdatePhotoshootPackageModal,
    setSelectedUpdatePhotoshootPackage,
  } = useModalStore();
  console.log("packageDetail", packageDetail);
  const queryClient = useQueryClient();
  const deletePhotoshootPackage = useMutation({
    mutationFn: async (data) => {
      // Await inside mutation function
      return await PhotoshootPackageApi.deletePhotoshootPackage(
        packageDetail.id
      );
    },
    onSuccess: () => {
      console.log("deletePhotoshootPackage success", page);

      queryClient.invalidateQueries({
        queryKey: ["findAllPhotoshootPackages", page],
      });
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
      <div className="h-[150px] overflow-hidden rounded-t-lg">
        <img
          src={packageDetail.thumbnail}
          alt="demo"
          className="size-full object-cover  group-hover:scale-125 transition-all duration-300 ease-in-out"
        />
      </div>
      <div className="flex flex-col gap-1 px-2">
        <div className=" text-2xl flex flex-row justify-between">
          <p>{packageDetail.title}</p>
          <div className="flex items-center gap-1">
            <Tooltip title="Xóa gói" color="red" placement="top">
              <div
                className="text-lg hover:opacity-80 px-2 py-1 rounded-lg"
                disable={isPending}
                onClick={(e) => {
                  e.preventDefault(); // Prevent default behavior (if applicable)
                  e.stopPropagation(); // Prevent event from propagating to parent elements
                  // Your onClick logic for the Pencil icon here
                  console.log("delete  clicked");
                  deletePhotoshootPackageMutate();
                }}
              >
                {isPending ? (
                  <LoadingOutlined className="text-red-500 hover:text-red-600" />
                ) : (
                  <DeleteOutlined className="text-red-500 hover:text-red-600" />
                )}
              </div>
            </Tooltip>

            <Tooltip title="Cập nhật gói" color="blue" placement="top">
              <div
                className="text-lg hover:opacity-80 px-2 py-1 rounded-lg"
                onClick={(e) => {
                  e.preventDefault(); // Prevent default behavior (if applicable)
                  e.stopPropagation(); // Prevent event from propagating to parent elements
                  // Your onClick logic for the Pencil icon here
                  console.log("Pencil clicked");
                  setIsUpdatePhotoshootPackageModal(true);
                  setSelectedUpdatePhotoshootPackage(packageDetail.id);
                }}
              >
                <EditOutlined className="text-blue-500 hover:text-blue-600" />
              </div>
            </Tooltip>
          </div>
        </div>
        <div className="font-normal underline underline-offset-2">
          {formatPrice(packageDetail.price)}
        </div>
        <div className="flex flex-col mt-2">
          <div className="font-semibold">Mô tả chung</div>
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
