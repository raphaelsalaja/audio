import type { ReactNode } from "react";
import { MobileHeader } from "@/components/mobile-header";
import {
  SidebarAside,
  SidebarHeader,
  SidebarNav,
  SidebarRoot,
  SidebarTree,
} from "@/components/sidebar";
import { source } from "@/lib/source";
import styles from "./layout.module.css";

export default function DocsLayout({ children }: { children: ReactNode }) {
  const tree = source.getPageTree();

  return (
    <main className={styles.layout}>
      <SidebarRoot>
        <SidebarAside>
          <SidebarHeader>
            <div className={styles.logo}>
              <MusicNote className={styles.icon} />
              <span className={styles.text}>Audio Kit</span>
            </div>
          </SidebarHeader>
          <SidebarNav>
            <SidebarTree tree={tree} />
          </SidebarNav>
        </SidebarAside>
      </SidebarRoot>
      <MobileHeader tree={tree} />
      {children}
    </main>
  );
}

import React, { type SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  secondaryfill?: string;
  strokewidth?: number;
  title?: string;
};

function MusicNote({
  fill = "currentColor",
  secondaryfill,
  title = "badge 13",
  ...props
}: IconProps) {
  secondaryfill = secondaryfill || fill;

  return (
    <svg
      height="18"
      id="music-note"
      width="18"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>{title}</title>
      <g fill={fill}>
        <path
          d="M13.014,1.162l-3.5,.477h0c-.862,.118-1.513,.864-1.513,1.734v7.262c-.568-.398-1.256-.635-2-.635-1.93,0-3.5,1.57-3.5,3.5s1.57,3.5,3.5,3.5,3.5-1.57,3.5-3.5V6.405l3.987-.543c.862-.118,1.513-.864,1.513-1.734v-1.231c0-.505-.218-.986-.599-1.318-.381-.333-.894-.484-1.387-.416Z"
          fill={fill}
        />
      </g>
    </svg>
  );
}
