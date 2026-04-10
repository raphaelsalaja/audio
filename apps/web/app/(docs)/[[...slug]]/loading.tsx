import styles from "./loading.module.css";
import pageStyles from "./styles.module.css";

export default function Loading() {
  return (
    <article className={pageStyles.content}>
      <div className={pageStyles.header}>
        <div className={styles.title} />
      </div>
      <div className={styles.lines}>
        <div className={styles.line} style={{ width: "92%" }} />
        <div className={styles.line} style={{ width: "85%" }} />
        <div className={styles.line} style={{ width: "78%" }} />
        <div className={styles.line} style={{ width: "60%" }} />
      </div>
      <div className={styles.block} />
      <div className={styles.lines}>
        <div className={styles.line} style={{ width: "88%" }} />
        <div className={styles.line} style={{ width: "94%" }} />
        <div className={styles.line} style={{ width: "42%" }} />
      </div>
    </article>
  );
}
