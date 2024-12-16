import http from "../configs/Http";
import UserService from "../services/Keycloak";

const getKeycloakProfile = async () => {
  const profile = await UserService.keycloakService.loadUserProfile();

  return profile;
};

const getApplicationProfile = async () => {
  const response = await http.get("/me");
  return response.data;
};
const reportByUser = async (data) => {
  const response = await http.post("/user/report", data);
  return response.data;
};

const UserApi = {
  getKeycloakProfile,
  getApplicationProfile,
  reportByUser,
};

export default UserApi;
