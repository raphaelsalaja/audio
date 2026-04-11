import { SoundProvider } from "@web-kits/audio/react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import { DrawerShell } from "@/components/drawer-shell";
import { SidebarSlotProvider } from "@/components/sidebar-slot";
import { ThemeProvider } from "@/components/theme-provider";
import { TopNav } from "@/components/top-nav";
import "@/styles/index.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    template: "@web-kits/audio › %s",
    default: "@web-kits/audio",
  },
  description: "Declarative audio synthesis for the web.",
  metadataBase: new URL("https://audio.raphaelsalaja.com"),
  openGraph: {
    type: "website",
    siteName: "@web-kits/audio",
    title: "@web-kits/audio",
    description: "Declarative audio synthesis for the web.",
    url: "https://audio.raphaelsalaja.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "@web-kits/audio",
    description: "Declarative audio synthesis for the web.",
    creator: "@raphaelsalaja",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        <NuqsAdapter>
          <Analytics />
          <SpeedInsights />
          <SoundProvider>
            <ThemeProvider>
              <SidebarSlotProvider>
                <DrawerShell>
                  <TopNav />
                  {children}
                </DrawerShell>
              </SidebarSlotProvider>
            </ThemeProvider>
          </SoundProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
