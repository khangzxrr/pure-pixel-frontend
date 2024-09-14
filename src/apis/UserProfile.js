import { useQuery } from "react-query";
import { testHttp } from "../configs/Http";

const getUserProfileById = async (id) => {
  const { data } = await testHttp.get(id);
  return data;
};

export const useGetUserProfileById = (id) => {
  const { data, isLoading, error } = useQuery(["userProfile", id], () =>
    getUserProfileById(id)
  );
  return { data, isLoading, error };
};
