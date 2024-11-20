import { useMutation } from "@tanstack/react-query";
import { ConfigProvider, Input, Rate, Button } from "antd";
import React, { useState } from "react";
import { CustomerBookingApi } from "../../../apis/CustomerBookingApi";

const desc = ["Tệ hại", "Chưa hài lòng", "Bình thường", "Tốt", "Tuyệt vời"];

export default function ReviewBooking({ bookingId }) {
  const [star, setStar] = useState(null);
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({ star: "", description: "" });

  const addReviewForBooking = useMutation({
    mutationFn: ({ star, description }) =>
      CustomerBookingApi.reviewBookingByCustomer(bookingId, {
        star,
        description,
      }),
    onSuccess: () => {
      // Reset the form
      setStar(null);
      setDescription("");
      setErrors({ star: "", description: "" });
    },
  });
  const validateFields = () => {
    const newErrors = { star: "", description: "" };

    if (!star) {
      newErrors.star = "Vui lòng đánh giá bằng cách chọn số sao.";
    }

    if (!description.trim()) {
      newErrors.description = "Vui lòng nhập mô tả chi tiết.";
    }

    setErrors(newErrors);
    return !newErrors.star && !newErrors.description;
  };

  const handleSubmit = () => {
    if (validateFields()) {
      // Submit logic here
      console.log("Star:", star, "Description:", description);

      addReviewForBooking.mutate({ star, description });
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorText: "black", // Default text color
          fontSize: 18, // Font size for tooltips
          colorFillSecondary: "gray", // Customize unselected star color
        },
      }}
    >
      <div className="flex flex-col gap-2 m-2 p-4 bg-[#2d2f34] rounded-lg">
        <p className="text-[#e0e0e0] font-semibold">Đánh giá</p>
        <div>
          <Rate
            tooltips={desc}
            onChange={(value) => {
              setStar(value);
              if (value) {
                setErrors((prev) => ({ ...prev, star: "" })); // Clear star error
              }
            }}
            value={star}
          />
          {errors.star && (
            <p className="text-red-500 text-sm mt-1">{errors.star}</p>
          )}
          {star ? (
            <span className="mx-4 font-normal text-[#e0e0e0]">
              {desc[star - 1]}
            </span>
          ) : null}
        </div>
        <Input.TextArea
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (e.target.value.trim()) {
              setErrors((prev) => ({ ...prev, description: "" })); // Clear description error
            }
          }}
          className="w-full custom-scrollbar text-[#d7d7d8] bg-[#292b2f] hover:bg-[#292b2f] focus:bg-[#292b2f] p-2 m-2 mb-4 border-[1px] lg:text-base text-xs focus:outline-none focus:border-[#e0e0e0] hover:border-[#e0e0e0] placeholder:text-[#d7d7d8] placeholder:text-sm"
          placeholder="Mô tả chi tiết"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
        <Button
          type="primary"
          className="bg-blue-500 text-white hover:bg-blue-600"
          onClick={handleSubmit}
        >
          Gửi đánh giá
        </Button>
      </div>
    </ConfigProvider>
  );
}
