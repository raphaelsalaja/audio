"use client";

import { click, drawerClose, drawerOpen } from "@audio/core";
import { DrawerPreview as Drawer } from "@base-ui/react/drawer";
import { useSound } from "@web-kits/audio/react";
import HotDrink from "@web-kits/icons/fill/hot-drink";
import Github from "@web-kits/icons/social-media/github";
import XTwitter from "@web-kits/icons/social-media/x-twitter";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { useDrawerPortalContainer } from "@/components/drawer-shell";
import { SidebarRoot } from "@/components/sidebar";
import { useSidebarSlot } from "@/components/sidebar-slot";
import { ThemeToggle } from "@/components/theme-toggle";
import styles from "./styles.module.css";

const LINKS = [
  {
    href: "/",
    label: "Docs",
    match: (p: string) => !p.startsWith("/library") && !p.startsWith("/editor"),
  },
  {
    href: "/library",
    label: "Library",
    match: (p: string) => p.startsWith("/library"),
  },
  {
    href: "/editor",
    label: "Editor",
    match: (p: string) => p.startsWith("/editor"),
  },
];

export function TopNav() {
  const pathname = usePathname();
  const sidebarContent = useSidebarSlot();
  const portalContainer = useDrawerPortalContainer();
  const [open, setOpen] = useState(false);
  const closeDrawer = useCallback(() => setOpen(false), []);

  const playClick = useSound(click);
  const playDrawerOpen = useSound(drawerOpen);
  const playDrawerClose = useSound(drawerClose);
  const wasOpenRef = useRef(open);

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <MusicNote className={styles.logoIcon} />
          <span className={styles.logoText}>web-kits/audio</span>
        </Link>
        <div className={styles.links}>
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.link} ${link.match(pathname) ? styles.active : ""}`}
              onClick={playClick}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className={styles.actions}>
          {sidebarContent && (
            <Drawer.Root
              open={open}
              onOpenChange={(next) => {
                setOpen(next);
                if (next && !wasOpenRef.current) playDrawerOpen();
                if (!next && wasOpenRef.current) playDrawerClose();
                wasOpenRef.current = next;
              }}
              modal={false}
            >
              <Drawer.Trigger className={styles.menuButton} aria-label="Menu">
                <MenuIcon open={open} />
              </Drawer.Trigger>
              <Drawer.Portal container={portalContainer}>
                <Drawer.Backdrop className={styles.backdrop} />
                <Drawer.Viewport className={styles.viewport}>
                  <Drawer.Popup className={styles.popup}>
                    <div className={styles.handle} />
                    <Drawer.Content className={styles.content}>
                      <SidebarRoot onNavigate={closeDrawer}>
                        {sidebarContent}
                      </SidebarRoot>
                    </Drawer.Content>
                  </Drawer.Popup>
                </Drawer.Viewport>
              </Drawer.Portal>
            </Drawer.Root>
          )}
          <a
            href="https://twitter.com/raphaelsalaja"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.iconLink}
            aria-label="Twitter"
            onClick={playClick}
          >
            <XTwitter width={15} height={15} />
          </a>
          <a
            href="https://github.com/raphaelsalaja/audio"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.iconLink}
            aria-label="GitHub"
            onClick={playClick}
          >
            <Github width={15} height={15} />
          </a>
          <a
            href="https://buymeacoffee.com/raphaelsalaja"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.iconLink}
            aria-label="Buy Me a Coffee"
            onClick={playClick}
          >
            <HotDrink width={15} height={15} />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      {open ? (
        <>
          <line x1="4" y1="4" x2="12" y2="12" />
          <line x1="12" y1="4" x2="4" y2="12" />
        </>
      ) : (
        <>
          <line x1="2" y1="4.5" x2="14" y2="4.5" />
          <line x1="2" y1="8" x2="14" y2="8" />
          <line x1="2" y1="11.5" x2="14" y2="11.5" />
        </>
      )}
    </svg>
  );
}

function MusicNote({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M13.014,1.162l-3.5,.477h0c-.862,.118-1.513,.864-1.513,1.734v7.262c-.568-.398-1.256-.635-2-.635-1.93,0-3.5,1.57-3.5,3.5s1.57,3.5,3.5,3.5,3.5-1.57,3.5-3.5V6.405l3.987-.543c.862-.118,1.513-.864,1.513-1.734v-1.231c0-.505-.218-.986-.599-1.318-.381-.333-.894-.484-1.387-.416Z"
        fill="currentColor"
      />
    </svg>
  );
}
