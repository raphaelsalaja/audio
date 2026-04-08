import typography from "./postcss-typography.mjs";

/** @type {import('postcss').ProcessOptions & { plugins: import('postcss').AcceptedPlugin[] }} */
const config = {
  plugins: [typography],
};

export default config;
