"use client";

import { Field } from "@base-ui/react";
import MagnifierSlash from "@web-kits/icons/fill/magnifier-slash";
import Magnifier from "@web-kits/icons/outline/magnifier";
import { parseAsString, useQueryState } from "nuqs";
import { useMemo } from "react";
import type { PatchWithStats } from "@/lib/patches";
import { Card } from "../card";
import styles from "./styles.module.css";

export function View({ patches }: { patches: PatchWithStats[] }) {
  const [query, setQuery] = useQueryState(
    "q",
    parseAsString
      .withDefault("")
      .withOptions({ shallow: true, throttleMs: 300 }),
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return patches;
    return patches.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.author.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term),
    );
  }, [patches, query]);

  return (
    <div className={styles.container}>
      <Field.Root className={styles.search}>
        <Magnifier className={styles.icon} strokewidth={2} aria-hidden="true" />
        <Field.Control
          autoComplete="off"
          placeholder="Search..."
          className={styles.control}
          onValueChange={(value) => setQuery(value)}
        />
      </Field.Root>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.icon}>
            <MagnifierSlash strokewidth={2} aria-hidden="true" />
          </div>
          <p className={styles.title}>No patches found.</p>
          <p className={styles.description}>
            Try searching for a different term.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((patch) => (
            <Card key={patch.id} patch={patch} />
          ))}
        </div>
      )}
    </div>
  );
}
