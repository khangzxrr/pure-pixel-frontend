import Keycloak from "keycloak-js";

const keycloakService = new Keycloak({
  url: process.env.REACT_APP_KEYCLOAK_URL,
  realm: process.env.REACT_APP_KEYCLOAK_REALM,
  clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID,
});

const doLogin = keycloakService.login;

const getToken = () => keycloakService.token;

const getTokenParsed = () => keycloakService.tokenParsed;

const isLoggedIn = () => !!keycloakService.token;

const updateToken = (successCallback) =>
  keycloakService.updateToken(5).then(successCallback).catch(doLogin);

const hasRole = (roles) =>
  roles.some((role) => keycloakService.hasRealmRole(role));

const UserService = {
  doLogin,
  getToken,
  getTokenParsed,
  isLoggedIn,
  updateToken,
  hasRole,

  keycloakService,
};
export default UserService;
