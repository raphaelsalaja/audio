"use client";

import ChevronLeft from "@web-kits/icons/fill/chevron-left";
import ChevronRight from "@web-kits/icons/fill/chevron-right";
import { useSound } from "@web-kits/audio/react";
import { click } from "@audio/core";
import type { Item } from "fumadocs-core/page-tree";
import Link from "next/link";
import styles from "./styles.module.css";

interface PageNavProps {
  previous?: Item;
  next?: Item;
}

export function PageNav({ previous, next }: PageNavProps) {
  const playClick = useSound(click);

  if (!previous && !next) return null;

  return (
    <nav className={styles.nav}>
      {previous ? (
        <Link href={previous.url} className={styles.card} onClick={playClick}>
          <span className={styles.direction}>
            <ChevronLeft width={12} height={12} />
            Previous
          </span>
          <span className={styles.title}>{previous.name}</span>
        </Link>
      ) : null}
      {next ? (
        <Link href={next.url} className={`${styles.card} ${styles.next}`} onClick={playClick}>
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
