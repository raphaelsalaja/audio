"use client";

import Github from "@audio-kit/icons/social-media/github";
import XTwitter from "@audio-kit/icons/social-media/x-twitter";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import styles from "./styles.module.css";

const LINKS = [
  {
    href: "/",
    label: "Documentation",
    match: (p: string) => !p.startsWith("/library"),
  },
  {
    href: "/library",
    label: "Library",
    match: (p: string) => p.startsWith("/library"),
  },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <MusicNote className={styles.logoIcon} />
          <span className={styles.logoText}>Audio Kit</span>
        </Link>
        <div className={styles.links}>
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.link} ${link.match(pathname) ? styles.active : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className={styles.actions}>
          <a
            href="https://twitter.com/raphaelsalaja"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.iconLink}
            aria-label="Twitter"
          >
            <XTwitter width={15} height={15} />
          </a>
          <a
            href="https://github.com/raphaelsalaja/audio-kit"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.iconLink}
            aria-label="GitHub"
          >
            <Github width={15} height={15} />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

function MusicNote({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M13.014,1.162l-3.5,.477h0c-.862,.118-1.513,.864-1.513,1.734v7.262c-.568-.398-1.256-.635-2-.635-1.93,0-3.5,1.57-3.5,3.5s1.57,3.5,3.5,3.5,3.5-1.57,3.5-3.5V6.405l3.987-.543c.862-.118,1.513-.864,1.513-1.734v-1.231c0-.505-.218-.986-.599-1.318-.381-.333-.894-.484-1.387-.416Z"
        fill="currentColor"
      />
    </svg>
  );
}
