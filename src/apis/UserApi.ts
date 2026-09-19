import http from "../configs/Http";
import UserService from "../services/Keycloak";
import type { BodyOf, ResponseOf } from "./types";

const getKeycloakProfile = async () => {
  const profile = await UserService.keycloakService.loadUserProfile();

  return profile;
};

const getApplicationProfile = async () => {
  const response =
    await http.get<ResponseOf<"MeController_getMeInfo">>("/me");
  return response.data;
};
const reportByUser = async (
  data: BodyOf<"UserReportController_createReport">,
) => {
  const response = await http.post<
    ResponseOf<"UserReportController_createReport">
  >("/user/report", data);
  return response.data;
};

const UserApi = {
  getKeycloakProfile,
  getApplicationProfile,
  reportByUser,
};

export default UserApi;
