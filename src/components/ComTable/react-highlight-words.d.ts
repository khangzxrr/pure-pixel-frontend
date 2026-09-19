// react-highlight-words ships no types; only the props used by ComTable/utils are declared
declare module "react-highlight-words" {
  import type { ComponentType, CSSProperties } from "react";

  export type HighlighterProps = {
    searchWords: Array<string | RegExp>;
    textToHighlight: string;
    autoEscape?: boolean;
    caseSensitive?: boolean;
    className?: string;
    highlightClassName?: string;
    highlightStyle?: CSSProperties;
  };

  const Highlighter: ComponentType<HighlighterProps>;
  export default Highlighter;
}
