// keycloak-js compatible subset over oidc-client-ts, for Authentik OIDC.
import {
  OidcClient,
  UserManager,
  WebStorageStateStore,
  type User,
} from "oidc-client-ts";
import type { KeycloakTokenParsed } from "./authTypes";

// the subset of OidcClient used to build the registration authorize request
export interface OidcClientLike {
  createSigninRequest(args: { state?: unknown }): Promise<{ url: string }>;
}

// the subset of UserManager methods AuthentikClient uses (tests supply a fake)
export interface UserManagerLike {
  getUser(): Promise<User | null>;
  signinRedirect(args?: { state?: unknown }): Promise<void>;
  signinRedirectCallback(url?: string): Promise<User>;
  signinSilent(): Promise<User | null>;
  signoutRedirect(args?: {
    post_logout_redirect_uri?: string;
    id_token_hint?: string;
  }): Promise<void>;
  removeUser(): Promise<void>;
  metadataService: {
    getUserInfoEndpoint(): Promise<string>;
  };
}

export interface AuthentikClientConfig {
  authority: string;
  clientId: string;
  registerUrl: string;
  userManager?: UserManagerLike;
  oidcClient?: OidcClientLike;
}

interface UserProfile {
  id?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
}

const base64UrlDecode = (input: string): string => {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return atob(padded + pad);
};

const decodeJwt = (token?: string): KeycloakTokenParsed | undefined => {
  if (!token) return undefined;
  const parts = token.split(".");
  if (parts.length < 2) return undefined;
  try {
    return JSON.parse(base64UrlDecode(parts[1]));
  } catch {
    return undefined;
  }
};

export class AuthentikClient {
  private userManager: UserManagerLike;
  private oidcClient?: OidcClientLike;
  private registerUrl: string;
  private authority: string;
  private initPromise?: Promise<boolean>;
  private refreshPromise?: Promise<boolean>;
  private expiryTimer?: ReturnType<typeof setTimeout>;

  authenticated = false;
  token?: string;
  tokenParsed?: KeycloakTokenParsed;
  idToken?: string;
  idTokenParsed?: KeycloakTokenParsed;
  refreshToken?: string;
  subject?: string;
  resourceAccess?: Record<string, { roles: string[] }>;
  realmAccess?: { roles: string[] };
  clientId: string;
  profile?: UserProfile;

  onReady?: (authenticated: boolean) => void;
  onAuthSuccess?: () => void;
  onAuthError?: (err: unknown) => void;
  onAuthRefreshSuccess?: () => void;
  onAuthRefreshError?: () => void;
  onAuthLogout?: () => void;
  onTokenExpired?: () => void;

  constructor(config: AuthentikClientConfig) {
    this.authority = config.authority;
    this.clientId = config.clientId;
    this.registerUrl = config.registerUrl;
    this.userManager =
      config.userManager ??
      new UserManager({
        authority: config.authority,
        client_id: config.clientId,
        redirect_uri: window.location.origin + "/",
        silent_redirect_uri:
          window.location.origin + "/silent-check-sso.html",
        post_logout_redirect_uri: window.location.origin + "/",
        response_type: "code",
        scope: "openid profile email offline_access",
        automaticSilentRenew: false,
        loadUserInfo: false,
        userStore: new WebStorageStateStore({ store: window.localStorage }),
      });
    this.oidcClient = config.oidcClient;
  }

  private getOidcClient(): OidcClientLike {
    if (!this.oidcClient) {
      const settings = (
        this.userManager as unknown as { settings: ConstructorParameters<
          typeof OidcClient
        >[0] }
      ).settings;
      this.oidcClient = new OidcClient(settings);
    }
    return this.oidcClient;
  }

  private setUser(user: User | null) {
    if (this.expiryTimer) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = undefined;
    }

    if (!user) {
      this.authenticated = false;
      this.token = undefined;
      this.tokenParsed = undefined;
      this.idToken = undefined;
      this.idTokenParsed = undefined;
      this.refreshToken = undefined;
      this.subject = undefined;
      this.resourceAccess = undefined;
      this.realmAccess = undefined;
      return;
    }

    this.authenticated = true;
    this.token = user.access_token;
    this.tokenParsed = decodeJwt(user.access_token);
    this.idToken = user.id_token;
    this.idTokenParsed = decodeJwt(user.id_token);
    this.refreshToken = user.refresh_token;
    this.subject = this.tokenParsed?.sub;
    this.resourceAccess = this.tokenParsed?.resource_access;
    this.realmAccess = this.tokenParsed?.realm_access;

    const exp = this.tokenParsed?.exp;
    if (exp !== undefined) {
      const delay = exp * 1000 - Date.now();
      this.expiryTimer = setTimeout(() => {
        this.onTokenExpired?.();
      }, delay);
    }
  }

  private isCallbackUrl(): boolean {
    const params = new URLSearchParams(window.location.search);
    return params.has("code") && params.has("state");
  }

  private stripCallbackParams() {
    const url = new URL(window.location.href);
    ["code", "state", "session_state", "iss"].forEach((key) =>
      url.searchParams.delete(key),
    );
    window.history.replaceState({}, document.title, url.toString());
  }

  init(options?: {
    onLoad?: "check-sso" | "login-required";
    silentCheckSsoRedirectUri?: string;
  }): Promise<boolean> {
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.doInit(options);
    return this.initPromise;
  }

  private async doInit(options?: {
    onLoad?: "check-sso" | "login-required";
    silentCheckSsoRedirectUri?: string;
  }): Promise<boolean> {
    if (this.isCallbackUrl()) {
      try {
        const user = await this.userManager.signinRedirectCallback();
        this.setUser(user);
        const returnTo = (user.state as { returnTo?: unknown } | undefined)
          ?.returnTo;
        if (typeof returnTo === "string" && returnTo !== window.location.href) {
          window.location.replace(returnTo);
        } else {
          this.stripCallbackParams();
        }
      } catch (err) {
        this.onAuthError?.(err);
        this.setUser(null);
      }
    } else {
      const user = await this.userManager.getUser();
      if (user && !user.expired) {
        this.setUser(user);
      } else if (options?.onLoad === "check-sso") {
        try {
          const refreshed = await this.userManager.signinSilent();
          this.setUser(refreshed);
        } catch {
          await this.userManager.removeUser();
          this.setUser(null);
        }
      } else {
        this.setUser(null);
      }
    }

    if (options?.onLoad === "login-required" && !this.authenticated) {
      await this.login();
    }

    this.onReady?.(this.authenticated);
    if (this.authenticated) {
      this.onAuthSuccess?.();
    }

    return this.authenticated;
  }

  async login(options?: { redirectUri?: string }): Promise<void> {
    await this.userManager.signinRedirect({
      state: { returnTo: options?.redirectUri ?? window.location.href },
    });
  }

  async logout(options?: { redirectUri?: string }): Promise<void> {
    const idTokenHint = this.idToken;
    await this.userManager.removeUser();
    this.setUser(null);
    this.onAuthLogout?.();
    await this.userManager.signoutRedirect({
      post_logout_redirect_uri:
        options?.redirectUri ?? window.location.origin + "/",
      id_token_hint: idTokenHint,
    });
  }

  async register(options?: { redirectUri?: string }): Promise<void> {
    const oidcClient = this.getOidcClient();
    const req = await oidcClient.createSigninRequest({
      state: { returnTo: options?.redirectUri ?? window.location.href },
    });
    const url = new URL(req.url);
    const next = url.pathname + url.search;
    window.location.assign(
      this.registerUrl + "?next=" + encodeURIComponent(next),
    );
  }

  updateToken(minValidity = 5): Promise<boolean> {
    if (!this.authenticated) {
      return Promise.reject(new Error("Not authenticated"));
    }

    if (minValidity >= 0 && !this.isTokenExpired(minValidity)) {
      return Promise.resolve(false);
    }

    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      try {
        const user = await this.userManager.signinSilent();
        this.setUser(user);
        this.onAuthRefreshSuccess?.();
        return true;
      } catch (err) {
        this.onAuthRefreshError?.();
        throw err;
      } finally {
        this.refreshPromise = undefined;
      }
    })();

    return this.refreshPromise;
  }

  isTokenExpired(minValidity = 0): boolean {
    const exp = this.tokenParsed?.exp;
    if (exp === undefined) return true;
    return exp - minValidity <= Math.floor(Date.now() / 1000);
  }

  hasResourceRole(role: string, resource: string = this.clientId): boolean {
    return (
      this.resourceAccess?.[resource]?.roles?.includes(role) ?? false
    );
  }

  hasRealmRole(role: string): boolean {
    return this.realmAccess?.roles?.includes(role) ?? false;
  }

  async loadUserProfile(): Promise<UserProfile> {
    const endpoint = await this.userManager.metadataService.getUserInfoEndpoint();
    const response = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    const claims = await response.json();
    const profile: UserProfile = {
      id: claims.sub,
      username: claims.preferred_username,
      email: claims.email,
      firstName: claims.given_name,
      lastName: claims.family_name,
      emailVerified: claims.email_verified,
    };
    this.profile = profile;
    return profile;
  }

  accountManagement(): void {
    window.location.assign(new URL(this.authority).origin + "/if/user/");
  }

  clearToken(): void {
    this.setUser(null);
    this.onAuthLogout?.();
  }
}
