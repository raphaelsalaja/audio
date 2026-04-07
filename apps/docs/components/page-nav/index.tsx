import ChevronLeft from "@audio-kit/icons/fill/chevron-left";
import ChevronRight from "@audio-kit/icons/fill/chevron-right";
import type { Item } from "fumadocs-core/page-tree";
import Link from "next/link";
import styles from "./styles.module.css";

interface PageNavProps {
  previous?: Item;
  next?: Item;
}

export function PageNav({ previous, next }: PageNavProps) {
  if (!previous && !next) return null;

  return (
    <nav className={styles.nav}>
      {previous ? (
        <Link href={previous.url} className={styles.card}>
          <span className={styles.direction}>
            <ChevronLeft width={12} height={12} />
            Previous
          </span>
          <span className={styles.title}>{previous.name}</span>
        </Link>
      ) : null}
      {next ? (
        <Link href={next.url} className={`${styles.card} ${styles.next}`}>
          <span className={styles.direction}>
            Next
            <ChevronRight width={12} height={12} />
          </span>
          <span className={styles.title}>{next.name}</span>
        </Link>
      ) : null}
    </nav>
  );
}
