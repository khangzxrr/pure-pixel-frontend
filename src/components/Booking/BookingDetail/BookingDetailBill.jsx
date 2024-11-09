import React from "react";

const BookingDetailBill = () => {
  return (
    <div className="flex flex-col gap-2 mx-2 p-4 bg-[#2d2f34] rounded-lg">
      <div className="flex flex-col">
        <ul className="border-b pb-2">
          <li className="flex items-center justify-between font-normal text-sm">
            Giá <span>1.000.000đ</span>
          </li>
          <li className="flex items-center justify-between font-normal text-sm">
            Trang trí <span>1.000.000đ</span>
          </li>
        </ul>
        <div className="flex items-center justify-end font-normal text-sm py-1">
          Tổng cộng: <span>1.000.000đ</span>
        </div>
        <div className="flex flex-col  mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              type="text"
              className="col-span-2 text-sm font-normal px-1 py-1 rounded-md"
              placeholder="Nhập dịch vụ thêm"
            />

            <input
              type="number"
              className="col-span-1 text-sm font-normal px-1 py-1 rounded-md"
              placeholder="Nhập giá"
            />
          </div>
          <div className="flex justify-end items-center mt-4 ">
            <button className="text-sm bg-[#eee] text-[#202225] px-2 py-1 rounded-md hover:bg-[#b3b3b3]">
              Thêm vào hóa đơn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailBill;
