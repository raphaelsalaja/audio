"use client";

import { useScrollFade } from "@/lib/use-scroll-fade";
import styles from "./styles.module.css";

export function TableWrapper({ children }: { children: React.ReactNode }) {
  const { ref, fade } = useScrollFade<HTMLDivElement>();

  return (
    <div className={styles.tableFrame}>
      <div className={styles.tableWrapper} ref={ref} data-fade={fade}>
        {children}
      </div>
    </div>
  );
}
