import http from "../configs/Http";

const getDashboard = async (fromDate, toDate) => {
  const response = await http.get(
    `/admin/dashboard?fromDate=${encodeURIComponent(
      fromDate
    )}&toDate=${encodeURIComponent(toDate)}`
  );
  return response.data;
};

const AdminApi = { getDashboard };

export default AdminApi;
