import type { ReactNode } from "react";
import styles from "./styles.module.css";

export function Steps({ children }: { children: ReactNode }) {
  return <div className={styles.steps}>{children}</div>;
}

export function Step({ children }: { children: ReactNode }) {
  return (
    <div className={styles.step}>
      <div className={styles.indicator}>
        <span className={styles.number} />
        <span className={styles.line} />
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
