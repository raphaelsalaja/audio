import Link from "next/link";
import type { ReactNode } from "react";
import { getIconEntry } from "@/components/sidebar/icons";
import styles from "./styles.module.css";

interface CardProps {
  href: string;
  title: string;
  description: string;
  icon?: ReactNode;
  external?: boolean;
  tag?: string;
}

export function CardGrid({ children }: { children: ReactNode }) {
  return <div className={styles.grid}>{children}</div>;
}

export function Card({
  href,
  title,
  description,
  icon,
  external,
  tag,
}: CardProps) {
  const entry = getIconEntry(href);
  const IconComponent = entry?.icon;
  const iconColor = entry?.color;

  const resolvedIcon = icon ?? (IconComponent ? <IconComponent /> : null);

  const content = (
    <>
      {resolvedIcon && (
        <span
          className={styles.icon}
          style={iconColor ? { color: iconColor } : undefined}
        >
          {resolvedIcon}
        </span>
      )}
      <span className={styles.text}>
        <span className={styles.titleRow}>
          <span className={styles.title}>{title}</span>
          {tag && <span className={styles.tag}>{tag}</span>}
        </span>
        <span className={styles.description}>{description}</span>
      </span>
      {external && (
        <svg
          className={styles.external}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3.5 2.5h6v6M9.5 2.5L2.5 9.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        className={styles.card}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={styles.card}>
      {content}
    </Link>
  );
}
