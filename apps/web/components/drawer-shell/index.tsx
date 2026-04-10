"use client";

import { DrawerPreview as Drawer } from "@base-ui/react/drawer";
import { createContext, type ReactNode, use, useState } from "react";
import styles from "./styles.module.css";

const DrawerPortalContainerContext = createContext<HTMLDivElement | null>(null);

export function useDrawerPortalContainer() {
  return use(DrawerPortalContainerContext);
}

export function DrawerShell({ children }: { children: ReactNode }) {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(
    null,
  );

  return (
    <Drawer.Provider>
      <DrawerPortalContainerContext value={portalContainer}>
        <div className={styles.root} ref={setPortalContainer}>
          <Drawer.IndentBackground className={styles.indentBackground} />
          <Drawer.Indent className={styles.indent}>{children}</Drawer.Indent>
        </div>
      </DrawerPortalContainerContext>
    </Drawer.Provider>
  );
}
