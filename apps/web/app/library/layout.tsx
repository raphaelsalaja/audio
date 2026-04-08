import type { ReactNode } from "react";
import styles from "./layout.module.css";

export default function PatchesLayout({ children }: { children: ReactNode }) {
  return (
    <main className={styles.layout}>
      <div className={styles.content}>{children}</div>
    </main>
  );
}
