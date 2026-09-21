import { App } from "antd";

import { setAntdAppApi } from "./antdApp";

/**
 * Bridges `App.useApp()` into `src/theme/antdApp.ts` so non-component code (confirm helpers,
 * async flows) can raise themed dialogs. Renders nothing; mount inside `<AntdApp>`.
 */
export default function AntdAppBridge() {
  // assign during render so sibling effects already see the bound APIs; the value is stable
  setAntdAppApi(App.useApp());
  return null;
}
