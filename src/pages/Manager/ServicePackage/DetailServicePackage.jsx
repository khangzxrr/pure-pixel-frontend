import React from 'react'
import ComDateConverter from '../../../components/ComDateConverter/ComDateConverter';
import { Image } from 'antd';

export default function DetailServicePackage({ selected }) {
  function formatCurrency(number) {
    // Sử dụng hàm toLocaleString() để định dạng số thành chuỗi với ngăn cách hàng nghìn và mặc định là USD.
    if (typeof number === "number") {
      return number.toLocaleString("vi-VN", {
        style: "currency",
        currency: "VND",
      });
    }
  }
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
                    <div className="w-20 h-20 flex items-center justify-center overflow-hidden">
                      <Image
                        wrapperClassName=" w-20 h-20 object-cover object-center flex items-center justify-center "
                        src={selected?.user?.avatar}
                        alt={selected?.user?.avatar}
                        preview={{ mask: "Xem ảnh" }}
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
      </div>
    </div>
  );
}
