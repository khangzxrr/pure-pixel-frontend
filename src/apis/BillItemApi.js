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

// Create a new bill item
const createBillItem = async (bookingId, body) => {
  const response = await http.post(
    `/photographer/booking/${bookingId}/bill-item`,
    body
  );
  return response.data;
};

// Update an existing bill item
const updateBillItem = async (bookingId, billItemId, body) => {
  const response = await http.patch(
    `/photographer/booking/${bookingId}/bill-item/${billItemId}`,
    body
  );
  return response.data;
};

const BillItemApi = {
  getBillItems, // Added function for fetching bill items
  createBillItem, // Added function for creating a new bill item
  updateBillItem, // Added function for updating an existing bill item
};

export default BillItemApi;
