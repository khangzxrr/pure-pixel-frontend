import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import checkFile from "eslint-plugin-check-file";

export default [
  {
    files: ["src/**/*"],
    plugins: {
      "check-file": checkFile,
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      camelcase: "warn",
      "check-file/folder-naming-convention": [
        "error",
        { "src/**/": "CAMEL_CASE" },
      ],
      "check-file/filename-naming-convention": [
        "error",
        { "src/**/**": "PASCAL_CASE" },
      ],
    },
  },

  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
];
