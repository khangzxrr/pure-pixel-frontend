import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { number, object, string } from "yup";
import { PhotographerBookingApi } from "../../../apis/PhotographerBookingApi";
import formatPrice from "../../../utils/FormatPriceUtils";

const BookingDetailBill = ({ bookingDetail }) => {
  const [billItemCreateTitle, setBillItemCreateTitle] = useState("");
  const [billItemCreatePrice, setBillItemCreatePrice] = useState(0);

  const addBillItemMutation = useMutation({
    mutationFn: ({ title, description, price, type }) =>
      PhotographerBookingApi.addBillItem(bookingDetail.id, {
        title,
        description,
        price,
        type,
      }),
  });

  const billItemSchema = object({
    title: string().required().trim(),
    description: string().required().trim(),
    price: number().required().positive().integer(),
    type: string().required().trim(),
  });

  const handleBillItemCreateTypeOnChange = (event) => {
    setBillItemCreateTitle(event.target.value);
  };

  const handleBillItemCreatePriceOnChange = (event) => {
    setBillItemCreatePrice(event.target.value);
  };

  const handleAddBillItemOnClick = async () => {
    console.log(billItemCreateTitle, billItemCreatePrice);

    const billItemCreate = {
      title: billItemCreateTitle,
      price: billItemCreatePrice,
      description: "qwidjiw",
      type: "INCREASE",
    };

    const billItem = await billItemSchema.validate(billItemCreate);

    console.log(billItem);
    // addBillItemMutation.mutate({});
  };

  return (
    <div className="flex flex-col gap-2 mx-2 p-4 bg-[#2d2f34] rounded-lg">
      <div className="flex flex-col">
        <ul className="border-b pb-2">
          {bookingDetail.billItems.map((bill) => {
            return (
              <li className="flex items-center justify-between font-normal text-sm">
                {bill.title} <span>{formatPrice(bill.price)}</span>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center justify-end font-normal text-sm py-1">
          Tổng cộng: <span>{formatPrice(bookingDetail.totalBillItem)}</span>
        </div>
        <div className="flex flex-col  mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              type="text"
              className="col-span-2 text-sm font-normal px-1 py-1 rounded-md"
              placeholder="Nhập dịch vụ thêm"
              onChange={handleBillItemCreateTypeOnChange}
            />

            <input
              type="number"
              className="col-span-1 text-sm font-normal px-1 py-1 rounded-md"
              placeholder="Nhập giá"
              onChange={handleBillItemCreatePriceOnChange}
            />
          </div>
          <div className="flex justify-end items-center mt-4 ">
            <button
              onClick={() => handleAddBillItemOnClick()}
              className="text-sm bg-[#eee] text-[#202225] px-2 py-1 rounded-md hover:bg-[#b3b3b3]"
            >
              Thêm vào hóa đơn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailBill;
