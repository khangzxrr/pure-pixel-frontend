import http from "./../configs/Http";

const getAllNewsfeed = async (limit, page) => {
  const params = {
    limit,
    page,
  };

  const queryString = new URLSearchParams(params).toString();
  const url = `/newsfeed?${queryString}`;

  const response = await http.get(url);
  return response.data;
};

const NewsfeedApi = {
  getAllNewsfeed,
};

export default NewsfeedApi;
