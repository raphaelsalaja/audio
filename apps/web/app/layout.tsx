import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

import { ThemeProvider } from "@/components/theme-provider";
import "@/styles/index.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s - Audio Kit",
    default: "Audio Kit - Declarative audio synthesis for the web",
  },
  description:
    "Describe sounds as plain objects and play them with a single function call. Browse and discover sound packs for your UI.",
  metadataBase: new URL("https://audio-kit.dev"),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
