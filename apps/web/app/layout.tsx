import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { ThemeProvider } from "@/components/theme-provider";
import { TopNav } from "@/components/top-nav";
import "@/styles/index.css";

export const metadata: Metadata = {
  title: {
    template: "Audio Kit › %s",
    default: "Audio Kit",
  },
  description: "Declarative audio synthesis for the web.",
  metadataBase: new URL("https://audio-kit.dev"),
  openGraph: {
    type: "website",
    siteName: "Audio Kit",
    title: "Audio Kit",
    description: "Declarative audio synthesis for the web.",
    url: "https://audio-kit.dev",
  },
  twitter: {
    card: "summary_large_image",
    title: "Audio Kit",
    description: "Declarative audio synthesis for the web.",
    creator: "@raphaelsalaja",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://rsms.me/" />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </head>
      <body>
        <NuqsAdapter>
          <ThemeProvider>
            <TopNav />
            {children}
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
