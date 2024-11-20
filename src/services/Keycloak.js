import Keycloak from "keycloak-js";

const keycloakService = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
});

const doLogin = keycloakService.login;

const getToken = () => keycloakService.token;

const getTokenParsed = () => keycloakService.tokenParsed;

const getUserId = () => keycloakService.tokenParsed.sub;

const isLoggedIn = () => !!keycloakService.token;

const updateToken = async () => {
  try {
    return await keycloakService.updateToken(-1);
  } catch (e) {
    doLogin();
  }
};

const hasRole = (roles) =>
  roles?.some((role) => keycloakService.hasResourceRole(role));

const getUserRoles = () => {
  console.log(import.meta.env.REACT_APP_KEYCLOAK_URL);
  if (
    !keycloakService.tokenParsed ||
    !keycloakService.tokenParsed.realm_access
  ) {
    return [];
  }
  return keycloakService.resourceAccess;
};

const UserService = {
  getUserId,
  doLogin,
  getToken,
  getTokenParsed,
  isLoggedIn,
  updateToken,
  hasRole,
  getUserRoles,
  keycloakService,
};

export default UserService;
