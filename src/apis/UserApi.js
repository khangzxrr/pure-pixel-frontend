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

const UserApi = {
  getKeycloakProfile,
  getApplicationProfile,
};

export default UserApi;
