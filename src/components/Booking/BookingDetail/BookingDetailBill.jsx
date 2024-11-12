import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Pencil, Trash2, Check, X } from "lucide-react";
import BillItemApi from "../../../apis/BillItemApi";
import billItemSchema from "../../../yup/BillItemInput";
import formatPrice from "../../../utils/FormatPriceUtils";
import { Select, Tooltip } from "antd";
import AddBillForm from "./AddBillForm";
import DiscountForm from "./DiscountForm";
import EditBillForm from "./EditBillForm";

const BookingDetailBill = ({ bookingDetail, enableUpdate }) => {
  const [isShowModal, setIsShowModal] = useState(false);
  const [editItemId, setEditItemId] = useState(null); // Track the item being edited
  const queryClient = useQueryClient();

  const { data: billItems } = useQuery({
    queryKey: ["booking-bill-items", bookingDetail.id],
    queryFn: () => BillItemApi.getBillItems(bookingDetail.id),
  });

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
                  <EditBillForm
                    bookingId={bookingDetail.id}
                    bill={bill}
                    onCancel={() => toggleEditMode(bill.id)}
                    setEditItemId={setEditItemId}
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
                      {enableUpdate ? (
                        <div className="flex flex-row gap-2">
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
                      ) : (
                        <div className="w-8"></div>
                      )}
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
          <div className="grid grid-cols-10 font-normal text-sm py-1">
            <p className="col-span-6">Tổng cộng:</p>
            <p className="col-span-3 text-end text-base mx-2">
              <span>{formatPrice(bookingDetail.totalBillItem)}</span>
            </p>
            <p className="col-span-1"></p>
          </div>
          {enableUpdate && (
            <>
              <AddBillForm bookingId={bookingDetail.id} />
              <DiscountForm bookingId={bookingDetail.id} />
            </>
          )}
          <div className="h-12"></div>
        </div>
      </div>
    </>
  );
};
// Component for editing a single bill item

export default BookingDetailBill;
