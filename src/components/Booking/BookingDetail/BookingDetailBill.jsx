import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Pencil, Trash2, Check, X } from "lucide-react";
import BillItemApi from "../../../apis/BillItemApi";
import billItemSchema from "../../../yup/BillItemInput";
import formatPrice from "../../../utils/FormatPriceUtils";
import { Tooltip } from "antd";

const BookingDetailBill = ({ bookingDetail }) => {
  const [isShowModal, setIsShowModal] = useState(false);
  const [editItemId, setEditItemId] = useState(null); // Track the item being edited
  const queryClient = useQueryClient();

  const {
    register,
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
  });

  const { data: billItems } = useQuery({
    queryKey: ["booking-bill-items", bookingDetail.id],
    queryFn: () => BillItemApi.getBillItems(bookingDetail.id),
  });

  const addBillItemMutation = useMutation({
    mutationFn: ({ title, description, price, type }) =>
      BillItemApi.addBillItem(bookingDetail.id, {
        title,
        description,
        price,
        type,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["booking-bill-items", bookingDetail.id]);
      reset();
    },
  });

  const handleAddBillItem = (data) => {
    const unformattedPrice = parseInt(data.price.replace(/\./g, ""), 10);
    addBillItemMutation.mutate({
      title: data.title,
      price: unformattedPrice,
      description: "qwidjiw",
      type: data.type === "+" ? "INCREASE" : "DECREASE",
    });
  };

  const handlePriceChange = (event) => {
    const value = event.target.value.replace(/\D/g, "");
    const formattedValue = new Intl.NumberFormat("vi-VN").format(value);
    setValue("price", formattedValue, { shouldValidate: true });
  };

  const deleteBillItemMutation = useMutation({
    mutationFn: ({ bookingId, billItemId }) =>
      BillItemApi.deleteBillItem(bookingId, billItemId),
    onSuccess: () => {
      queryClient.invalidateQueries(["booking-bill-items", bookingDetail.id]);
    },
  });

  const handleRemoveItem = (bookingId, billItemId) => {
    deleteBillItemMutation.mutate({ bookingId, billItemId });
  };

  const toggleEditMode = (itemId) => {
    setEditItemId(editItemId === itemId ? null : itemId); // Toggle edit mode
  };
  const handleSaveEdit = (item) => {
    const unformattedPrice = parseInt(item.price.replace(/\./g, ""), 10);
    // Add your update mutation call here
    // e.g., updateBillItemMutation.mutate({ ...item, price: unformattedPrice });
    console.log("Save edit", item);

    setEditItemId(null); // Exit edit mode
  };

  return (
    <>
      <div className="flex flex-col gap-2 mx-2 p-4 bg-[#2d2f34] rounded-lg">
        <div className="flex flex-col">
          <ul className="border-b pb-2">
            {bookingDetail.billItems.map((bill) => (
              <li
                key={bill.id}
                className="flex items-center justify-between font-normal text-sm"
              >
                {editItemId === bill.id ? (
                  // Edit Mode
                  <EditForm
                    bill={bill}
                    onSave={(data) => handleSaveEdit(data, bill.id)}
                    onCancel={() => toggleEditMode(bill.id)}
                    schema={billItemSchema}
                  />
                ) : (
                  // Display Mode
                  <>
                    <span>{bill.title}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`${
                          bill.type === "INCREASE"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {bill.type === "INCREASE" ? "+" : "-"}
                        {formatPrice(bill.price)}
                      </span>
                      <Tooltip placement="top" title="Sửa" color="blue">
                        <Pencil
                          onClick={() => toggleEditMode(bill.id)}
                          className="w-4 h-4 text-blue-500 hover:cursor-pointer"
                        />
                      </Tooltip>

                      <Tooltip placement="right" title="Xóa" color="red">
                        <Trash2
                          onClick={() =>
                            handleRemoveItem(bookingDetail.id, bill.id)
                          }
                          className="w-4 h-4 text-red-500 hover:cursor-pointer"
                        />
                      </Tooltip>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-end font-normal text-sm py-1">
            Tổng cộng: <span>{formatPrice(bookingDetail.totalBillItem)}</span>
          </div>
          <div className="flex flex-col mt-4">
            <form onSubmit={handleSubmit(handleAddBillItem)}>
              <div className="grid grid-cols-1 md:grid-cols-10 gap-1">
                <div className="col-span-1">
                  <Tooltip
                    placement="top"
                    title={`${
                      getValues("type") === "INCREASE"
                        ? "Thêm dịch vụ"
                        : "Giảm giá"
                    }`}
                    color={`${
                      getValues("type") === "INCREASE" ? "green" : "red"
                    }`}
                  >
                    <div
                      onClick={() => {
                        // Toggle "+" and "-"
                        const currentType = getValues("type");
                        setValue(
                          "type",
                          currentType === "INCREASE" ? "DECREASE" : "INCREASE"
                        );
                      }}
                      className="cursor-pointer"
                    >
                      <p
                        className={`text-lg text-center ${
                          getValues("type") === "INCREASE"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {watch("type") === "INCREASE" ? "+" : "-"}
                      </p>
                    </div>
                  </Tooltip>

                  {errors.type && (
                    <p className="text-red-500 text-xs">
                      {errors.type.message}
                    </p>
                  )}
                </div>

                <input
                  {...register("title")}
                  type="text"
                  className={`col-span-6 w-full text-[#d7d7d8] bg-[#292b2f] hover:bg-[#292b2f] focus:bg-[#292b2f] px-2 py-1 border-[1px] text-sm font-normal focus:outline-none focus:border-[#e0e0e0] hover:border-[#e0e0e0] placeholder:text-[#d7d7d8] rounded-md ${
                    errors.title ? "border-red-500" : "border-[#4c4e52]"
                  }`}
                  placeholder="Nhập dịch vụ thêm"
                />
                {errors.title && (
                  <p className="text-red-500 text-xs">{errors.title.message}</p>
                )}

                <input
                  {...register("price")}
                  type="text"
                  className={`col-span-3 w-full text-[#d7d7d8] bg-[#292b2f] hover:bg-[#292b2f] focus:bg-[#292b2f] px-2 py-1 border-[1px] text-sm font-normal focus:outline-none focus:border-[#e0e0e0] hover:border-[#e0e0e0] placeholder:text-[#d7d7d8] rounded-md ${
                    errors.price ? "border-red-500" : "border-[#4c4e52]"
                  }`}
                  placeholder="Giá"
                  onChange={handlePriceChange}
                />
                {errors.price && (
                  <p className="text-red-500 text-xs">{errors.price.message}</p>
                )}
              </div>
              <div className="flex justify-end items-center mt-4">
                <button
                  type="submit"
                  className="text-sm bg-[#eee] text-[#202225] px-2 py-1 rounded-md hover:bg-[#b3b3b3]"
                >
                  Thêm vào hóa đơn
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};
// Component for editing a single bill item
const EditForm = ({ bill, onSave, onCancel, schema }) => {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
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
  console.log(errors);

  return (
    <div className="grid grid-cols-1 md:grid-cols-10 gap-1 items-center">
      <div className="col-span-1">
        <div
          onClick={() => {
            // Toggle "+" and "-"
            const currentType = getValues("type");
            setValue(
              "type",
              currentType === "INCREASE" ? "DECREASE" : "INCREASE"
            );
          }}
          className="cursor-pointer"
        >
          <p
            className={`text-lg text-center ${
              bill.type === "INCREASE" ? "text-green-500" : "text-red-500"
            }`}
          >
            {bill.type === "INCREASE" ? "+" : "-"}
          </p>
        </div>
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
        <input
          {...register("price")}
          type="text"
          className={`w-full text-[#d7d7d8] bg-[#292b2f] hover:bg-[#292b2f] focus:bg-[#292b2f] px-2 py-1 border-[1px] text-sm font-normal focus:outline-none focus:border-[#e0e0e0] hover:border-[#e0e0e0] placeholder:text-[#d7d7d8] rounded-md ${
            errors.price ? "border-red-500" : "border-[#4c4e52]"
          }`}
          placeholder="Giá"
          onChange={handlePriceChange}
        />
        {errors.price && (
          <p className="text-red-500 text-xs">{errors.price.message}</p>
        )}
      </div>

      <div className="flex items-center gap-2 col-span-10 justify-end">
        <Check
          onClick={handleSubmit(onSave)}
          className="w-4 h-4 text-green-500 hover:cursor-pointer"
        />
        <X
          onClick={onCancel}
          className="w-4 h-4 text-gray-500 hover:cursor-pointer"
        />
      </div>
    </div>
  );
};

export default BookingDetailBill;
