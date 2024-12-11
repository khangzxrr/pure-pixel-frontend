import React, { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import ComButton from "../../../components/ComButton/ComButton";
import { yupResolver } from "@hookform/resolvers/yup";
import ComNumber from "./../../../components/ComInput/ComNumber";
import ComInput from "./../../../components/ComInput/ComInput";
import ComSelect from "../../../components/ComInput/ComSelect";
import { MonyNumber } from "./../../../components/MonyNumber/MonyNumber";
import { useNotification } from "../../../Notification/Notification";
import { putData } from "../../../apis/api";
import { Upgrade } from "../../../yup/Upgrade";
import ComTextArea from "../../../components/ComInput/ComTextArea";
function formatCurrency(number) {
  // Sử dụng hàm toLocaleString() để định dạng số thành chuỗi với ngăn cách hàng nghìn và mặc định là USD.
  if (typeof number === "number") {
    return number.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  }
}
export default function DetailUpgrede({ selectedUpgrede, onClose, tableRef }) {
  const [disabled, setDisabled] = useState(false);
  const { notificationApi } = useNotification();
  console.log("====================================");
  console.log(selectedUpgrede);
  console.log("====================================");

  useEffect(() => {
    setValue("minOrderMonth", selectedUpgrede.minOrderMonth);
    // setValue("maxPhotoQuota", 123123123);
  }, [selectedUpgrede]);

  const methods = useForm({
    resolver: yupResolver(Upgrade),
    values: {
      ...selectedUpgrede,
      maxPhotoQuota: selectedUpgrede.maxPhotoQuota / 1073741824,
    },
  });
  const {
    handleSubmit,
    register,
    setFocus,
    watch,
    setValue,
    setError,
    trigger,
    formState: { errors },
    control,
  } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "descriptions",
  });
  const onSubmit = (data) => {
    console.log(data);
    setDisabled(true);
    const change = MonyNumber(
      data.price,
      (message) => setError("price", { message }), // Đặt lỗi nếu có
      () => setFocus("price"), // Đặt focus vào trường price nếu có lỗi
      (value) => (data.price = value)
    );
    if (change !== null) {
      putData("/manager/upgrade-package", selectedUpgrede.id, {
        ...data,
        status: "ENABLED",
        maxPhotoQuota: selectedUpgrede.maxPhotoQuota * 1073741824,
      })
        .then((e) => {
          notificationApi("success", "Thành công", "Đã cập nhật thành công");
          setDisabled(false);
          setTimeout(() => {
            tableRef();
          }, 100);
          onClose();
        })
        .catch((error) => {
          console.log(error);
          setDisabled(false);
          if (error?.data?.statusCode === 400) {
            setError("name", { message: "Tên gói này đã tồn tại" });
            setFocus("name");
          }
          notificationApi("error", "Không thành công", "Vui lòng thử lại");
        });
    } else {
      setDisabled(true);
    }
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
            <tr className="border-b">
              <td className="px-4 py-2 text-gray-600 font-medium">Tên gói:</td>
              <td className="px-4 py-2">{selectedUpgrede?.name}</td>
            </tr>

            {/* Thời hạn */}
            <tr className="border-b">
              <td className="px-4 py-2 text-gray-600 font-medium">Thời hạn:</td>
              <td className="px-4 py-2">
                {selectedUpgrede?.minOrderMonth === 3
                  ? "3 tháng"
                  : selectedUpgrede?.minOrderMonth === 6
                  ? "6 tháng"
                  : "1 năm"}
              </td>
            </tr>

            {/* Số tiền */}
            <tr className="border-b">
              <td className="px-4 py-2 text-gray-600 font-medium">Số tiền:</td>
              <td className="px-4 py-2">
                {formatCurrency(selectedUpgrede?.price)}
              </td>
            </tr>

            {/* Số lượng gói dịch vụ tối đa */}
            <tr className="border-b">
              <td className="px-4 py-2 text-gray-600 font-medium">
                Số lượng gói dịch vụ tối đa:
              </td>
              <td className="px-4 py-2">{selectedUpgrede?.maxPackageCount}</td>
            </tr>

            {/* Max photo quota */}
            <tr className="border-b">
              <td className="px-4 py-2 text-gray-600 font-medium">
                Max Photo Quota:
              </td>
              <td className="px-4 py-2">{selectedUpgrede?.maxPhotoQuota}</td>
            </tr>

            {/* Tóm tắt về gói */}
            <tr className="border-b">
              <td className="px-4 py-2 text-gray-600 font-medium">
                Tóm tắt về gói:
              </td>
              <td className="px-4 py-2">{selectedUpgrede?.summary}</td>
            </tr>

            {/* Mô tả chi tiết các gói (mỗi dòng là một mô tả) */}
            {selectedUpgrede?.descriptions?.map((description, index) => (
              <tr key={index} className="border-b">
                <td className="px-4 py-2 text-gray-600 font-medium">
                  Chi tiết {index + 1} của gói:
                </td>
                <td className="px-4 py-2">{description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
