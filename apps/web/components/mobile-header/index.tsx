"use client";

import type { Root } from "fumadocs-core/page-tree";
import Link from "next/link";
import { useState } from "react";
import {
  SidebarDrawer,
  SidebarHeader,
  SidebarNav,
  SidebarRoot,
  SidebarTree,
} from "@/components/sidebar";
import styles from "./styles.module.css";

export function MobileHeader({ tree }: { tree: Root }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          audio-kit
        </Link>
        <button
          type="button"
          className={styles.toggle}
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            {open ? (
              <>
                <line x1="4" y1="4" x2="14" y2="14" />
                <line x1="14" y1="4" x2="4" y2="14" />
              </>
            ) : (
              <>
                <line x1="3" y1="5" x2="15" y2="5" />
                <line x1="3" y1="9" x2="15" y2="9" />
                <line x1="3" y1="13" x2="15" y2="13" />
              </>
            )}
          </svg>
        </button>
      </header>
      {open && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop dismiss is mouse-only by convention
        // biome-ignore lint/a11y/noStaticElementInteractions: modal backdrop
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          {/* biome-ignore lint/a11y/noStaticElementInteractions: stops backdrop click propagation */}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: not interactive */}
          <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
            <SidebarRoot onNavigate={() => setOpen(false)}>
              <SidebarDrawer>
                <SidebarHeader>audio-kit</SidebarHeader>
                <SidebarNav>
                  <SidebarTree tree={tree} />
                </SidebarNav>
              </SidebarDrawer>
            </SidebarRoot>
          </div>
        </div>
      )}
    </>
  );
}
