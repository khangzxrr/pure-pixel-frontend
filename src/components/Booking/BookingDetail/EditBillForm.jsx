import { yupResolver } from "@hookform/resolvers/yup";
import React from "react";
import billItemSchema from "../../../yup/BillItemInput";
import { Controller, useForm } from "react-hook-form";
import { Check, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import BillItemApi from "../../../apis/BillItemApi";
import { NumericFormat } from "react-number-format";

export default function EditBillForm({
  bill,
  setEditItemId,
  onCancel,
  bookingId,
}) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(billItemSchema),
    defaultValues: {
      title: bill.title,
      price: bill.price,
      type: bill.type,
    },
  });

  const handlePriceChange = (event) => {
    const value = event.target.value.replace(/\D/g, "");
    const formattedValue = new Intl.NumberFormat("vi-VN").format(value);
    setValue("price", formattedValue, { shouldValidate: true });
  };
  const updateBillItemMutation = useMutation({
    mutationFn: ({ title, description, price, type }) =>
      BillItemApi.updateBillItem(bookingId, bill.id, {
        title,
        description,
        price,
        type,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["booking-bill-items", bookingId]);
    },
  });
  const handleUpdateBillItem = (data) => {
    // const unformattedPrice = parseInt(data.price.replace(/\./g, ""), 10);
  };
  const handleSaveEdit = (data) => {
    // Add your update mutation call here
    // e.g., updateBillItemMutation.mutate({ ...item, price: unformattedPrice });
    updateBillItemMutation.mutate({
      title: data.title,
      price: data.price,
      description: "Mô tả thêm",
      type: data.type,
    });

    setEditItemId(null); // Exit edit mode
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-10 gap-1 items-center">
      <div
        className={`col-span-10 text-sm ${
          getValues("type") === "INCREASE" ? "text-green-500" : "text-red-500"
        }`}
      >
        {watch("type") === "INCREASE" ? "Sửa dịch vụ" : "Sửa giảm giá"}
      </div>
      <div className="col-span-6">
        <input
          {...register("title")}
          type="text"
          className={`w-full text-[#d7d7d8] bg-[#292b2f] hover:bg-[#292b2f] focus:bg-[#292b2f] px-2 py-1 border-[1px] text-sm font-normal focus:outline-none focus:border-[#e0e0e0] hover:border-[#e0e0e0] placeholder:text-[#d7d7d8] rounded-md ${
            errors.title ? "border-red-500" : "border-[#4c4e52]"
          }`}
          placeholder="Nhập dịch vụ thêm"
        />
        {errors.title && (
          <p className="text-red-500 text-xs">{errors.title.message}</p>
        )}
      </div>

      <div className="col-span-3">
        <Controller
          name="price"
          control={control}
          render={({ field }) => (
            <NumericFormat
              {...field}
              thousandSeparator="."
              decimalSeparator=","
              suffix=" ₫"
              className={`w-full text-[#d7d7d8] bg-[#292b2f] hover:bg-[#292b2f] focus:bg-[#292b2f] px-2 py-1 border-[1px] text-sm font-normal focus:outline-none focus:border-[#e0e0e0] hover:border-[#e0e0e0] placeholder:text-[#d7d7d8] rounded-md ${
                errors.price ? "border-red-500" : "border-[#4c4e52]"
              }`}
              placeholder="Nhập giá"
              onValueChange={(values) => {
                field.onChange(values.value);
              }}
            />
          )}
        />
        {errors.price && (
          <p className="text-red-500 text-xs">{errors.price.message}</p>
        )}
      </div>

      <div className="col-span-1 flex items-center gap-2 justify-end">
        <Check
          onClick={handleSubmit(handleSaveEdit)}
          className="w-4 h-4 text-green-500 hover:cursor-pointer"
        />
        <X
          onClick={onCancel}
          className="w-4 h-4 text-gray-500 hover:cursor-pointer"
        />
      </div>
    </div>
  );
}
