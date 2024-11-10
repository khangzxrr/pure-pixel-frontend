import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { number, object, string } from "yup";
import { PhotographerBookingApi } from "../../../apis/PhotographerBookingApi";
import formatPrice from "../../../utils/FormatPriceUtils";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { set } from "react-hook-form";
import BookingDetailWarningModel from "./BookingDetailWarningModel";
const BookingDetailBill = ({ bookingDetail }) => {
  const [billItemCreateTitle, setBillItemCreateTitle] = useState("");
  const [billItemCreatePrice, setBillItemCreatePrice] = useState(1);
  const [isShowModal, setIsShowModal] = useState(false);

  const addBillItemMutation = useMutation({
    mutationFn: ({ title, description, price, type }) =>
      PhotographerBookingApi.addBillItem(bookingDetail.id, {
        title,
        description,
        price,
        type,
      }),
  });

  const [isDropdownTitle, setIsDropdownTitle] = useState("+");
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
    const value = parseInt(event.target.value, 10);
    if (value > 0) {
      setBillItemCreatePrice(value);
    }
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

  const handleOnClose = () => {
    setIsShowModal(false);
  };

  return (
    <>
      {isShowModal && <BookingDetailWarningModel onClose={handleOnClose} />}

      <div className="flex flex-col gap-2 mx-2 p-4 bg-[#2d2f34] rounded-lg">
        <div className="flex flex-col">
          <ul className="border-b pb-2">
            {bookingDetail.billItems.map((bill) => {
              return (
                <li className="flex items-center justify-between font-normal text-sm">
                  {bill.title}{" "}
                  <div className="flex items-center gap-2">
                    <span>{formatPrice(bill.price)}</span>
                    <div className="flex items-center gap-2">
                      <Pencil className="w-4 h-4 text-blue-500 hover:cursor-pointer" />
                      <Trash2 className="w-4 h-4 text-red-500 hover:cursor-pointer" />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center justify-end font-normal text-sm py-1">
            Tổng cộng: <span>{formatPrice(bookingDetail.totalBillItem)}</span>
          </div>
          <div className="flex flex-col  mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-1">
              <div className="col-span-1">
                <Menu as="div" className="relative inline-block text-left">
                  <div>
                    <MenuButton className="inline-flex w-full items-center  justify-between gap-x-1.5 rounded-md bg-white px-3 py-1 text-lg font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                      {isDropdownTitle}
                      <ChevronDown className="h-3 w-3" />
                    </MenuButton>
                  </div>

                  <MenuItems
                    transition
                    className="absolute right-0 z-10 mt-2 w-full origin-top rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                  >
                    <div className="py-1">
                      <MenuItem>
                        <div
                          onClick={() => setIsDropdownTitle("+")}
                          className="flex items-center hover:cursor-pointer justify-center px-4 py-1 text-lg text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                        >
                          +
                        </div>
                      </MenuItem>
                      <MenuItem>
                        <div
                          onClick={() => setIsDropdownTitle("-")}
                          className="flex items-center hover:cursor-pointer justify-center px-4 py-1 text-lg text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                        >
                          -
                        </div>
                      </MenuItem>
                    </div>
                  </MenuItems>
                </Menu>
              </div>
              <input
                type="text"
                className="col-span-3 text-sm font-normal px-1 py-1 rounded-md text-[#202225]"
                placeholder="Nhập dịch vụ thêm"
                onChange={handleBillItemCreateTypeOnChange}
              />

              <input
                type="number"
                className="col-span-2 text-sm font-normal px-1 py-1 rounded-md text-[#202225]"
                placeholder="Nhập giá"
                onChange={handleBillItemCreatePriceOnChange}
                min="1"
                onKeyDown={(e) => {
                  if (e.key === "0" || e.key === "-") {
                    e.preventDefault();
                  }
                }}
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
        <button
          onClick={() => setIsShowModal(true)}
          className="flex items-center bg-[#eee] text-[#202225] rounded-lg hover:bg-[#b3b3b3] justify-center py-2 transition duration-200"
        >
          Khách đã thanh toán
        </button>
      </div>
    </>
  );
};

export default BookingDetailBill;
