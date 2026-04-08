import type { ReactNode } from "react";
import { MobileHeader } from "@/components/mobile-header";
import {
  SidebarAside,
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
