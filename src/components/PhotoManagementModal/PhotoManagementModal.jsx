import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { getData, postData } from "../../apis/api";
import { message } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import ExifList from "../Photographer/UploadPhoto/ExifList";
import { useNotification } from "../../Notification/Notification";

export default function PhotoManagementModal({ close, id, data }) {
  const { notificationApi } = useNotification();

  const queryClient = useQueryClient();
  const [photoInfo, setPhotoInfo] = useState({
    title: data.title || " ",
    description: data.description || " ",
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const [sizes, setSizes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSpecsExpanded, setIsSpecsExpanded] = useState(false);

  // Thêm state để lưu trữ kích thước được chọn
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);

  const handleSizeToggle = (index) => {
    const newSizes = sizes.map((size, i) => ({
      ...size,
      selected: i === index ? !size.selected : size.selected,
    }));
    setSizes(newSizes);
  };

  useEffect(() => {
    getData(`/photo/${id}/available-resolution`).then((resolutions) => {
      const sizeArray = resolutions.data || resolutions;
      const updatedSizes = sizeArray.map((item) => ({
        ...item,
        selected: false,
        price: "",
      }));
      setSizes(updatedSizes);
    });
  }, []);

  // const handlePriceChange = (index, value) => {
  //   const newSizes = sizes.map((size, i) => ({
  //     ...size,
  //     price: i === index ? value : size.price,
  //   }));
  //   setSizes(newSizes);
  // };
  const handlePriceChange = (index, value) => {
    const parsedValue = value.replace(/[^0-9]/g, ""); // Xóa tất cả ký tự không phải số
    // sizes[index].price = parsedValue;

    const newSizes = sizes.map((size, i) => ({
      ...size,
      price: i === index ? parsedValue : size.price,
    }));
    setSizes(newSizes);
    // Cập nhật lại state hoặc làm gì đó với giá trị mới
  };
  const handleSubmit = () => {
    const newErrors = {};
    // if (!photoInfo.title.trim()) {
    //   newErrors.title = "Vui lòng nhập tựa đề.";
    // }
    // if (!photoInfo.description.trim()) {
    //   newErrors.description = "Vui lòng nhập mô tả.";
    // }

    const selectedSizes = sizes.filter((size) => size.selected);
    if (selectedSizes.length === 0) {
      newErrors.sizes = "Vui lòng chọn ít nhất một kích thước ảnh.";
    }

    const invalidSizes = selectedSizes.filter(
      (size) => !size.price || parseFloat(size.price) < 1000
    );
    if (invalidSizes.length > 0) {
      newErrors.prices =
        "Vui lòng nhập giá hợp lệ cho tất cả các kích thước được chọn, Giá tiền phải lớn hơn 1.000đ";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const pricetags = selectedSizes.map((size) => ({
      width: parseInt(size.width),
      height: parseInt(size.height),
      price: parseFloat(size.price),
    }));

    postData(`/photo/${id}/sell`, {
      title: photoInfo.title,
      description: photoInfo.description,
      pricetags: pricetags,
    })
      .then((response) => {
        // console.log("Upload thành công:", response);
        notificationApi(
          "success",
          "Đăng bán ảnh thành công",
          "Đã đăng bán ảnh thành công!"
        );
        queryClient.invalidateQueries({ queryKey: ["my-photo"] });
        close();
      })
      .catch((error) => {
        console.error("Lỗi khi upload:", error.data.message);
        let errorMessage = "";
        switch (error.data.message) {
          case "PhotoBannedException":
            errorMessage = "Ảnh đã bị cấm bán.";
            break;
          default:
            errorMessage = "Có lỗi xảy ra khi lưu thông tin.";
        }
        notificationApi("error", "Đăng bán ảnh không thành công", errorMessage);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  // console.log("====================================");
  // console.log(data);
  // console.log("====================================");

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60] ">
      <div className="bg-[#2b2d31] rounded-lg max-w-6xl w-full  overflow-hidden ">
        <div className="">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl text-gray-100">Quản lý Ảnh bán</h2>
          </div>

          <div className="max-h-[70vh] overflow-y-auto  overflow-x-hidden custom-scrollbar2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 ">
              {/* Left side - Photo preview */}
              <div className="overflow-hidden">
                <img
                  src={
                    sizes && sizes[selectedSizeIndex]?.preview
                      ? sizes[selectedSizeIndex]?.preview
                      : sizes[0]?.preview
                  }
                  alt="Preview"
                  className="w-full h-auto rounded-lg "
                />
              </div>

              {/* Right side - Photo information */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg text-gray-100">Thông tin bức ảnh</h3>

                  {/* <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Tựa đề
                      </label>
                      <input
                        type="text"
                        value={photoInfo.title}
                        onChange={(e) =>
                          setPhotoInfo({ ...photoInfo, title: e.target.value })
                        }
                        className={`w-full bg-[#1e1f22] border rounded px-3 py-2 text-gray-100 ${
                          errors.title ? "border-red-500" : "border-gray-700"
                        }`}
                      />
                      {errors.title && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.title}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Mô tả
                      </label>
                      <textarea
                        type="text"
                        value={photoInfo.description}
                        onChange={(e) =>
                          setPhotoInfo({
                            ...photoInfo,
                            description: e.target.value,
                          })
                        }
                        className={`w-full bg-[#1e1f22] border rounded px-3 py-2 text-gray-100 ${
                          errors.description
                            ? "border-red-500"
                            : "border-gray-700"
                        }`}
                      />
                      {errors.description && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.description}
                        </p>
                      )}
                    </div>
                  </div> */}
                  <p>{photoInfo?.title}</p>
                  <p className="font-normal text-sm text-gray-300">
                    {photoInfo?.description}
                  </p>
                  {/* Camera Specifications */}
                  <ExifList exifData={data.exif} />
                </div>

                {/* Price Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg text-gray-100"></h3>Chỉnh giá theo kích
                  thước
                  {errors.sizes && (
                    <p className="text-red-500 text-sm mt-1">{errors.sizes}</p>
                  )}
                  {errors.prices && (
                    <p className="text-red-500 text-sm mt-1">{errors.prices}</p>
                  )}
                  <div className="space-y-3">
                    {sizes.map((size, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-4 cursor-pointer `}
                      >
                        <input
                          type="checkbox"
                          checked={size.selected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSizeToggle(index);
                          }}
                          className="w-4 h-4 rounded border-gray-700"
                        />
                        <span
                          className={`text-gray-100 w-32 p-2  rounded-sm ${
                            selectedSizeIndex === index ? "bg-gray-700" : ""
                          }`}
                          onClick={() => setSelectedSizeIndex(index)}
                        >
                          {size.height} X {size.width}
                        </span>
                        <input
                          type="text"
                          // value={size.price}
                          value={formatCurrency(size.price || 0)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handlePriceChange(index, e.target.value);
                          }}
                          placeholder="Nhập giá tiền"
                          className={`flex-1 bg-[#1e1f22] border rounded px-3 py-2 text-gray-100 ${
                            size.selected &&
                            (!size.price || parseFloat(size.price) <= 0)
                              ? "border-red-500"
                              : "border-gray-700"
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex justify-end gap-4">
          <button
            onClick={close}
            className="px-4 py-2 text-gray-100 hover:bg-gray-700 rounded transition-colors"
            disabled={isSubmitting}
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className={`px-4 py-2 rounded transition-colors ${
              isSubmitting
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}
