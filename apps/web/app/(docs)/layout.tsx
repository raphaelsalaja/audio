import type { ReactNode } from "react";
import {
  SidebarAside,
  SidebarNav,
  SidebarRoot,
  SidebarTree,
} from "@/components/sidebar";
import { SidebarSlotSetter } from "@/components/sidebar-slot";
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
      <SidebarSlotSetter>
        <SidebarNav>
          <SidebarTree tree={tree} />
        </SidebarNav>
      </SidebarSlotSetter>
      {children}
    </main>
  );
}
