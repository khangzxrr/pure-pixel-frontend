import { AuthentikClient } from "./AuthentikClient";

const keycloakService = new AuthentikClient({
  authority: import.meta.env.VITE_OIDC_AUTHORITY,
  clientId: import.meta.env.VITE_OIDC_CLIENT_ID,
  registerUrl: import.meta.env.VITE_AUTH_REGISTER_URL,
});

const doLogin = () => keycloakService.login();

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
  if (!keycloakService.tokenParsed) {
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
