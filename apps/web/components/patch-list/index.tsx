"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { PatchWithStats, SortMode } from "@/lib/patches";
import styles from "./styles.module.css";

function formatLoads(n: number): string {
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1)}K`;
  }
  return String(Math.round(n));
}

const TABS: { value: SortMode; label: string }[] = [
  { value: "alltime", label: "All Time" },
  { value: "trending", label: "Trending" },
  { value: "hot", label: "Hot" },
];

export function PatchList({
  patches,
  sort,
}: {
  patches: PatchWithStats[];
  sort: SortMode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");

  const filtered = patches.filter((p) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.author.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  function handleTabChange(value: SortMode) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    router.push(`?${params.toString()}`);
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Patches</h2>
      </div>

      <div className={styles.controls}>
        <div className={styles.tabs}>
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={styles.tab}
              data-active={sort === tab.value}
              onClick={() => handleTabChange(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          className={styles.search}
          placeholder="Search patches..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>No patches found.</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHeader}>
              <th className={styles.rankCol}>#</th>
              <th>Pack</th>
              <th>Description</th>
              <th className={styles.loadsCol}>Loads</th>
              <th className={styles.chevronCol} />
            </tr>
          </thead>
          <tbody>
            {filtered.map((patch, i) => (
              <tr key={patch.id} className={styles.row}>
                <td className={styles.rank}>{i + 1}</td>
                <td>
                  <Link href={`/${patch.name}`} className={styles.rowLink}>
                    <div className={styles.nameCell}>
                      <span className={styles.name}>{patch.name}</span>
                      <span className={styles.author}>{patch.author}</span>
                    </div>
                  </Link>
                </td>
                <td className={styles.description}>
                  <Link href={`/${patch.name}`} className={styles.rowLink}>
                    {patch.description}
                  </Link>
                </td>
                <td className={styles.loads}>{formatLoads(patch.loads)}</td>
                <td className={styles.chevron}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
