import Keycloak from "keycloak-js";

const keycloakService = new Keycloak({
  // eslint-disable-next-line no-undef
  url: process.env.REACT_APP_KEYCLOAK_URL,
  // eslint-disable-next-line no-undef
  realm: process.env.REACT_APP_KEYCLOAK_REALM,
  // eslint-disable-next-line no-undef
  clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID,
});

const doLogin = keycloakService.login;

const getToken = () => keycloakService.token;

const getTokenParsed = () => keycloakService.tokenParsed;

const getUserId = () => keycloakService.tokenParsed.sub;

const isLoggedIn = () => !!keycloakService.token;

const updateToken = async () => {
  try {
    return await keycloakService.updateToken(5);
  } catch (e) {
    doLogin();
  }
};

const hasRole = (roles) =>
  roles?.some((role) => keycloakService.hasResourceRole(role));

const getUserRoles = () => {
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
