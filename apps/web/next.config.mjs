import { createMDX } from "fumadocs-mdx/next";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

/** @type {import('next').NextConfig} */
const config = {
  transpilePackages: ["@web-kits/audio", "@web-kits/icons", "@web-kits/ui"],
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  async redirects() {
    return [
      {
        source: "/github",
        destination: "https://github.com/raphaelsalaja/audio",
        permanent: false,
      },
      {
        source: "/twitter",
        destination: "https://twitter.com/raphaelsalaja",
        permanent: false,
      },
      {
        source: "/npm",
        destination: "https://npmjs.com/package/@web-kits/audio",
        permanent: false,
      },
      {
        source: "/buy-me-a-coffee",
        destination: "https://buymeacoffee.com/raphaelsalaja",
        permanent: false,
      },
    ];
  },
};

const withMDX = createMDX();

export default withMDX(config);
