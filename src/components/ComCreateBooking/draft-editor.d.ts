// draft-js and react-draft-wysiwyg ship no types; only what CreatePackageDetail uses is declared
declare module "draft-js" {
  export class EditorState {
    static createEmpty(): EditorState;
  }
}

declare module "react-draft-wysiwyg" {
  import type { ComponentType, CSSProperties } from "react";
  import type { EditorState } from "draft-js";

  export type EditorProps = {
    editorState?: EditorState;
    onEditorStateChange?: (editorState: EditorState) => void;
    wrapperClassName?: string;
    editorClassName?: string;
    editorStyle?: CSSProperties;
    placeholder?: string;
  };

  export const Editor: ComponentType<EditorProps>;
}
