import Keycloak from "keycloak-js";

const keycloakService = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
});

const doLogin = keycloakService.login;

const getToken = () => keycloakService.token;

const getTokenParsed = () => keycloakService.tokenParsed;

const getUserId = () => keycloakService.tokenParsed?.sub;

const isLoggedIn = () => !!keycloakService.token;

const updateToken = async () => {
  try {
    return await keycloakService.updateToken(5);
  } catch {
    doLogin();
  }
};

// always refreshes, whatever the remaining lifetime
const forceRefreshToken = async () => {
  try {
    return await keycloakService.updateToken(-1);
  } catch {
    doLogin();
  }
};

const hasRole = (roles?: string[]) =>
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
  forceRefreshToken,
  hasRole,
  getUserRoles,
  keycloakService,
};
export default UserService;
