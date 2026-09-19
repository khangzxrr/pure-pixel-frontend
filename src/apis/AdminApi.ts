import http from "../configs/Http";
import type { BodyOf, ResponseOf } from "./types";

const getDashboard = async (fromDate: string, toDate: string) => {
  const response = await http.get<
    ResponseOf<"AdminController_getDashboardReportData">
  >(
    `/admin/dashboard?fromDate=${encodeURIComponent(
      fromDate,
    )}&toDate=${encodeURIComponent(toDate)}`,
  );
  return response.data;
};

const getTopSellerDashboard = async (fromDate: string, toDate: string) => {
  const response = await http.get<
    ResponseOf<"AdminController_getTopSellers">
  >(
    `/admin/dashboard/top-seller?fromDate=${encodeURIComponent(
      fromDate,
    )}&toDate=${encodeURIComponent(toDate)}`,
  );
  return response.data;
};

const getSellerByIdDashboard = async (
  id: string,
  fromDate: string,
  toDate: string,
) => {
  const response = await http.get<
    ResponseOf<"AdminController_getDetailOfATopSeller">
  >(
    `/admin/dashboard/top-seller/${id}?fromDate=${encodeURIComponent(
      fromDate,
    )}&toDate=${encodeURIComponent(toDate)}`,
  );
  return response.data;
};

const getUserManager = async (limit: number | string, page: number | string) => {
  const params = {
    limit: String(limit),
    page: String(page),
  };
  const queryString = new URLSearchParams(params).toString();
  const url = `/user?${queryString}`;
  const response =
    await http.get<ResponseOf<"UserController_getAllUsers">>(url);
  return response.data;
};

const getUserById = async (id: string) => {
  const response = await http.get<ResponseOf<"UserController_getUserById">>(
    `/user/${id}`,
  );
  return response.data;
};

const updateUser = async (
  id: string,
  updateBody: BodyOf<"UserController_patchUpdateUsers">,
) => {
  const url = `user/${id}`;
  const response = await http.patch<
    ResponseOf<"UserController_patchUpdateUsers">
  >(url, updateBody);
  return response.data;
};

const AdminApi = {
  getDashboard,
  getUserManager,
  getUserById,
  updateUser,
  getTopSellerDashboard,
  getSellerByIdDashboard,
};

export default AdminApi;
