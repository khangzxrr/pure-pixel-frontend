import http from "../configs/Http";

const getDashboard = async (fromDate, toDate) => {
  const response = await http.get(
    `/admin/dashboard?fromDate=${encodeURIComponent(
      fromDate
    )}&toDate=${encodeURIComponent(toDate)}`
  );
  return response.data;
};

const getUserManager = async (limit, page) => {
  const params = {
    limit,
    page,
  };
  const queryString = new URLSearchParams(params).toString();
  const url = `/user?${queryString}`;
  const response = await http.get(url);
  return response.data;
};

const getUserById = async (id) => {
  const response = await http.get(`/user/${id}`);
  return response.data;
};

const AdminApi = { getDashboard, getUserManager, getUserById };

export default AdminApi;
