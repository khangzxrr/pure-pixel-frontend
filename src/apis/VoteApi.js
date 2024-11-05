import http from "../configs/Http";

const getVoteByPhotoId = async (photoId) => {
  const response = await http.get(`photo/${photoId}/vote`);
  return response.data;
};

const VoteApi = { getVoteByPhotoId };
export default VoteApi;
