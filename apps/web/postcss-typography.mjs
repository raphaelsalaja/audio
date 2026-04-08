const A = -0.0223;
const B = 0.185;
const C = -0.1745;

function dynamicMetrics(size) {
  return (A + B * Math.exp(C * size)) * size;
}

function round(value, decimals = 4) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * @type {import('postcss').PluginCreator}
 *
 * Expands `@typography <size>[, <weight>[, <leading>[, <tracking>]]];`
 * into font-size, line-height, letter-spacing, and font-variation-settings.
 */
const plugin = () => ({
  postcssPlugin: "postcss-typography",
  AtRule: {
    typography(atRule) {
      const raw = atRule.params.replace(/;$/, "").trim();
      const parts = raw.split(/\s*,\s*/);

      const size = Number(parts[0]);
      const weight = parts[1] ? Number(parts[1]) : null;
      const leading = parts[2] ? Number(parts[2]) : 1.5;
      const tracking = parts[3] ? Number(parts[3]) : null;

      if (Number.isNaN(size)) {
        throw atRule.error(`Invalid size: ${parts[0]}`);
      }

      const ls = tracking ?? round(dynamicMetrics(size));

      atRule.before({ prop: "font-size", value: `${size}px` });
      atRule.before({ prop: "line-height", value: String(leading) });
      atRule.before({ prop: "letter-spacing", value: `${ls}px` });

      if (weight) {
        atRule.before({
          prop: "font-variation-settings",
          value: `"wght" ${weight}`,
        });
      }

      atRule.remove();
    },
  },
});

plugin.postcss = true;
export default plugin;
