import http from "../configs/Http";

const getAllNotifactions = async (limit, page) => {
  const params = {
    limit,
    page,
  };

  const queryString = new URLSearchParams(params).toString();
  const url = `/notification?${queryString}`;
  const response = await http.get(url);
  return response.data;
};

const NotificationApi = {
  getAllNotifactions,
};
export default NotificationApi;
