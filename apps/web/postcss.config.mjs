import typography from "./lib/postcss/plugins/typography.mjs";

/** @type {import('postcss').ProcessOptions & { plugins: import('postcss').AcceptedPlugin[] }} */
const config = {
  plugins: [typography],
};

export default config;
