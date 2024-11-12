import React from "react";
import billItemSchema from "../../../yup/BillItemInput";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import BillItemApi from "../../../apis/BillItemApi";
import { yupResolver } from "@hookform/resolvers/yup";
import { NumericFormat } from "react-number-format";

export default function AddBillForm({ bookingId }) {
  const queryClient = useQueryClient();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    resolver: yupResolver(billItemSchema),
    defaultValues: {
      type: "INCREASE",
      title: "",
      price: "",
    },
    // mode: "onChange", // Enable onChange validation
  });

  const addBillItemMutation = useMutation({
    mutationFn: ({ title, description, price, type }) =>
      BillItemApi.addBillItem(bookingId, {
        title,
        description,
        price,
        type,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["booking-bill-items", bookingId]);
      reset();
    },
  });

  const handleAddBillItem = (data) => {
    console.log(data);
    // const unformattedPrice = parseInt(data.price.replace(/\./g, ""), 10);
    addBillItemMutation.mutate({
      title: data.title,
      price: data.price,
      description: "mô tả thêm",
      type: "INCREASE",
    });
  };

  return (
    <div className="flex flex-col mt-4">
      <form onSubmit={handleSubmit(handleAddBillItem)}>
        <p className="font-normal mb-1 text-green-500">Thêm dịch vụ</p>
        <div className="grid grid-cols-1 md:grid-cols-10 gap-1">
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
          <div className="col-span-1 flex">
            <button
              type="submit"
              className="text-xs text-white hover:bg-opacity-80 px-2 py-1 rounded-md transition duration-100 bg-green-500"
            >
              Thêm
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
