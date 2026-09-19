import http from "./../configs/Http";
import type { BodyOf, ResponseOf } from "./types";

type BillItemCreateInput =
  BodyOf<"PhotographerBookingBillItemController_createBillItem">;
type BillItemUpdateInput =
  BodyOf<"PhotographerBookingBillItemController_updateBillItem">;

// Fetch bill items with pagination
const getBillItems = async (bookingId: string) => {
  const response = await http.get<
    ResponseOf<"PhotographerBookingBillItemController_findAllBookingBillItems">
  >(`/photographer/booking/${bookingId}/bill-item`, {
    params: { limit: 10, page: 0 },
  });
  return response.data;
};

const addBillItem = async (
  bookingId: string,
  { title, description, price, type }: BillItemCreateInput,
) => {
  const response = await http.post<
    ResponseOf<"PhotographerBookingBillItemController_createBillItem">
  >(`/photographer/booking/${bookingId}/bill-item`, {
    title,
    description,
    price,
    type,
  });

  return response;
};

// Update an existing bill item
const updateBillItem = async (
  bookingId: string,
  billItemId: string,
  { title, description, price, type }: BillItemUpdateInput,
) => {
  const response = await http.patch<
    ResponseOf<"PhotographerBookingBillItemController_updateBillItem">
  >(`/photographer/booking/${bookingId}/bill-item/${billItemId}`, {
    title,
    description,
    price,
    type,
  });

  return response;
};
// New API handler for deleting a specific bill item
const deleteBillItem = async (bookingId: string, billItemId: string) => {
  const response = await http.delete<
    ResponseOf<"PhotographerBookingBillItemController_deleteBillItem">
  >(`/photographer/booking/${bookingId}/bill-item/${billItemId}`);
  return response.data;
};

const BillItemApi = {
  getBillItems, // Added function for fetching bill items
  addBillItem, // Added function for creating a new bill item
  updateBillItem, // Added function for updating an existing bill item
  deleteBillItem, // Added function for deleting a specific bill item
};

export default BillItemApi;
