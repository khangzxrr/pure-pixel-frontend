import { App, message as staticMessage, Modal as staticModal, notification as staticNotification } from "antd";

type AntdAppApi = ReturnType<typeof App.useApp>;

let bound: AntdAppApi | null = null;

/**
 * Registers the context-aware antd APIs (message / notification / modal) that `App.useApp()`
 * returns. Called once by `<AntdAppBridge />`, which is mounted inside the app's `ConfigProvider`.
 *
 * Static `message.*` and `Modal.confirm` cannot read the theme, so they render with the default
 * light theme and warn in development. Code outside React (api helpers, async flows) should go
 * through these accessors instead; before the bridge mounts they fall back to the static APIs.
 */
export function setAntdAppApi(api: AntdAppApi) {
  bound = api;
}

export function appMessage(): AntdAppApi["message"] {
  return bound?.message ?? staticMessage;
}

export function appNotification(): AntdAppApi["notification"] {
  return bound?.notification ?? staticNotification;
}

export function appModal(): AntdAppApi["modal"] {
  return bound?.modal ?? staticModal;
}
