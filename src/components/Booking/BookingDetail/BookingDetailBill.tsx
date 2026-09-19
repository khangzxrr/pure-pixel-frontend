import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import BillItemApi from "../../../apis/BillItemApi";
import formatPrice from "../../../utils/FormatPriceUtils";
import { Tooltip } from "antd";
import AddBillForm from "./AddBillForm";
import DiscountForm from "./DiscountForm";
import EditBillForm from "./EditBillForm";
import type { BookingItem } from "../BookingRequestState/BookingCard";

type BookingDetailBillProps = {
  bookingDetail: BookingItem;
  enableUpdate: boolean;
};

const BookingDetailBill = ({
  bookingDetail,
  enableUpdate,
}: BookingDetailBillProps) => {
  const [editItemId, setEditItemId] = useState<string | null>(null); // Track the item being edited
  const queryClient = useQueryClient();

  // the fetched items are not rendered: the list below comes from bookingDetail
  useQuery({
    queryKey: ["booking-bill-items", bookingDetail.id],
    queryFn: () => BillItemApi.getBillItems(bookingDetail.id),
  });

  const deleteBillItemMutation = useMutation({
    mutationFn: ({
      bookingId,
      billItemId,
    }: {
      bookingId: string;
      billItemId: string;
    }) => BillItemApi.deleteBillItem(bookingId, billItemId),
    onSuccess: () => {
      // the array key ["booking-bill-items", id] was read as an empty filter,
      // which invalidates every query
      queryClient.invalidateQueries();
    },
  });

  const handleRemoveItem = (bookingId: string, billItemId: string) => {
    deleteBillItemMutation.mutate({ bookingId, billItemId });
  };

  const toggleEditMode = (itemId: string) => {
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
