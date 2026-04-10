import layoutStyles from "./layout.module.css";
import styles from "./loading.module.css";

const ROWS = ["a", "b", "c", "d", "e", "f", "g", "h"];
const NAME_WIDTHS = ["55%", "40%", "62%", "48%", "58%", "44%", "52%", "36%"];

export default function Loading() {
  return (
    <div className={layoutStyles.content}>
      <div className={styles.toolbar}>
        <div className={styles.search} />
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>
              <div className={styles.thSkeleton} />
            </th>
            <th className={styles.th}>
              <div className={styles.thSkeleton} data-align="right" />
            </th>
            <th className={styles.th}>
              <div className={styles.thSkeleton} data-align="right" />
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((id, i) => (
            <tr key={id} className={styles.row}>
              <td className={styles.td}>
                <div
                  className={styles.nameSkeleton}
                  style={{ width: NAME_WIDTHS[i] }}
                />
              </td>
              <td className={styles.td}>
                <div className={styles.numSkeleton} />
              </td>
              <td className={styles.td}>
                <div className={styles.numSkeleton} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
