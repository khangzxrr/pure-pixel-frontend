import http from "./../configs/Http";

// Fetch bill items with pagination
const getBillItems = async (bookingId) => {
  const response = await http.get(
    `/photographer/booking/${bookingId}/bill-item`,
    {
      params: { limit: 10, page: 0 },
    }
  );
  return response.data;
};

const addBillItem = async (bookingId, { title, description, price, type }) => {
  const response = await http.post(
    `/photographer/booking/${bookingId}/bill-item`,
    {
      title,
      description,
      price,
      type,
    }
  );

  return response;
};

// Update an existing bill item
const updateBillItem = async (
  bookingId,
  billItemId,
  { title, description, price, type }
) => {
  const response = await http.patch(
    `/photographer/booking/${bookingId}/bill-item/${billItemId}`,
    {
      title,
      description,
      price,
      type,
    }
  );

  return response;
};
// New API handler for deleting a specific bill item
const deleteBillItem = async (bookingId, billItemId) => {
  const response = await http.delete(
    `/photographer/booking/${bookingId}/bill-item/${billItemId}`
  );
  return response.data;
};

const BillItemApi = {
  getBillItems, // Added function for fetching bill items
  addBillItem, // Added function for creating a new bill item
  updateBillItem, // Added function for updating an existing bill item
  deleteBillItem, // Added function for deleting a specific bill item
};

export default BillItemApi;
