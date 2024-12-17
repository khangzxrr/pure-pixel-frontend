import React from "react";
import ComDateConverter from "../../../components/ComDateConverter/ComDateConverter";
import { Image } from "antd";
import { FaLock, FaLockOpen } from "react-icons/fa";
import { useMutation } from "@tanstack/react-query";
import { PhotoshootPackageManager } from "../../../apis/PhotoshootPackageManager";
import { notificationApi } from "../../../Notification/Notification";

export default function DetailServicePackage({ selected, reload }) {
  const [status, setStatus] = React.useState(selected?.status);

  const banPhoto = useMutation({
    mutationFn: () =>
      PhotoshootPackageManager.disablePhotoshootPackage(selected?.id),
    onSuccess: () => {
      notificationApi("success", "Đã khóa", "Đã khóa gói dịch vụ");
      setStatus("DISABLED");
    },
    onError: (error) => {
      notificationApi("error", "Khóa thất bạt", error?.response?.data?.message);
    },
  });

  const unBanPhotoshoot = useMutation({
    mutationFn: () =>
      PhotoshootPackageManager.enablePhotoshootPackage(selected?.id),
    onSuccess: () => {
      notificationApi("success", "Đã mở khóa", "Đã mở khóa gói dịch vụ");
      setStatus("ENABLED");
    },
    onError: (error) => {
      notificationApi("error", "Khóa thất bại", error?.response?.data?.message);
    },
  });
  function formatCurrency(number) {
    // Sử dụng hàm toLocaleString() để định dạng số thành chuỗi với ngăn cách hàng nghìn và mặc định là USD.
    if (typeof number === "number") {
      return number.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      });
    }
  }

  const handleBanPhotoshootPackage = () => {
    banPhoto.mutate();
    reload();
  };

  const handleUnBanPhotoshootPackage = () => {
    unBanPhotoshoot.mutate();
    reload();
  };
  return (
    <div>
      <div className="bg-white">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Chi tiết gói Nâng cấp
        </h2>
        <table className="w-full">
          <tbody>
            {/* Tên gói */}
            <tr className="border-b h-20">
              <td className="px-4 py-2 text-gray-600 font-medium">Tên gói:</td>
              <td className="px-4 py-2">{selected?.title}</td>
            </tr>

            {/* Số tiền */}
            <tr className="border-b h-20 ">
              <td className="px-4 py-2 text-gray-600 font-medium">Số tiền:</td>
              <td className="px-4 py-2">{formatCurrency(selected?.price)}</td>
            </tr>

            {/* Số lượng gói dịch vụ tối đa */}
            <tr className="border-b h-20">
              <td className="px-4 py-2 text-gray-600 font-medium">Hình ảnh:</td>
              <td className="px-4 py-2">
                <div className="w-20 h-20 flex items-center justify-center overflow-hidden">
                  <Image
                    wrapperClassName=" w-full h-full object-cover object-center flex items-center justify-center "
                    src={selected?.thumbnail}
                    alt={selected?.thumbnail}
                    preview={{ mask: "Xem ảnh" }}
                  />
                </div>
              </td>
            </tr>

            {/* Max photo quota */}
            <tr className="border-b h-20">
              <td className="px-4 py-2 text-gray-600 font-medium">Nội dung:</td>
              <td className="px-4 py-2">{selected?.description}</td>
            </tr>

            {/* Tóm tắt về gói */}
            <tr className="border-b h-20">
              <td className="px-4 py-2 text-gray-600 font-medium">
                Người sở hữu:
              </td>
              <td className="px-4 py-2">
                <div className="flex gap-2 items-center ">
                  {selected?.user?.avatar && (
                    <div className="size-10 flex items-center justify-center rounded-full overflow-hidden">
                      <img
                        className=" w-full h-full object-cover  "
                        src={selected?.user?.avatar}
                        alt={selected?.user?.avatar}
                      />
                    </div>
                  )}
                  <p>{selected?.user?.name}</p>
                </div>
              </td>
            </tr>
            <tr className="border-b h-20">
              <td className="px-4 py-2 text-gray-600 font-medium">Ngày tạo:</td>
              <td className="px-4 py-2">
                <ComDateConverter time>{selected?.createdAt}</ComDateConverter>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="flex justify-center my-2">
          {status === "ENABLED" ? (
            <button
              onClick={() => handleBanPhotoshootPackage()}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
            >
              <FaLockOpen /> Khóa gói dịch vụ
            </button>
          ) : (
            <button
              onClick={() => handleUnBanPhotoshootPackage()}
              className="bg-gray-500 flex items-center gap-2 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              <FaLock /> Đã khóa gói dịch vụ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
