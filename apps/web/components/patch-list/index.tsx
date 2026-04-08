"use client";

import Magnifier from "@audio-kit/icons/outline/magnifier";
import Xmark from "@audio-kit/icons/outline/xmark";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import { useMemo, useRef } from "react";
import type { PatchWithStats } from "@/lib/patches";
import styles from "./styles.module.css";

function formatLoads(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(Math.round(n));
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi",
  );
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: split fragments have no stable id
          <mark key={i} className={styles.highlight}>
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function PatchList({ patches }: { patches: PatchWithStats[] }) {
  const [query, setQuery] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({ shallow: true, throttleMs: 300 }),
  );
  const inputRef = useRef<HTMLInputElement>(null);

  function clearQuery() {
    setQuery("");
    inputRef.current?.focus();
  }

  const globalFilter = query;

  const columns = useMemo<ColumnDef<PatchWithStats, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <Link
            href={`/library/${row.original.name}`}
            className={styles.nameLink}
          >
            <span className={styles.name}>
              <Highlight text={row.original.name} query={query} />
            </span>
            <span className={styles.author}>
              <Highlight text={row.original.author} query={query} />
            </span>
          </Link>
        ),
        enableGlobalFilter: true,
      },
      {
        accessorKey: "soundCount",
        header: "Sounds",
        cell: ({ getValue }) => getValue() as number,
        meta: { align: "right" as const },
      },
      {
        accessorKey: "loads",
        header: "Installs",
        cell: ({ getValue }) => formatLoads(getValue() as number),
        meta: { align: "right" as const },
      },
    ],
    [query],
  );

  const table = useReactTable({
    data: patches,
    columns,
    state: { globalFilter },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: (row) => String(row.id),
  });

  const { rows } = table.getRowModel();
  const visibleHeaders = table.getHeaderGroups()[0]?.headers ?? [];

  const ROW_HEIGHT = 48;

  const virtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });


  return (
    <div className={styles.container}>
        <div className={styles.toolbar}>
          <div className={styles.searchBar}>
            <Magnifier
              className={styles.searchIcon}
              width={14}
              height={14}
              aria-hidden="true"
            />
            <input
              ref={inputRef}
              type="text"
              className={styles.searchInput}
              placeholder="Search packs..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                className={styles.searchClear}
                onClick={clearQuery}
                aria-label="Clear search"
              >
                <Xmark
                  width={12}
                  height={12}
                  strokewidth={2}
                  aria-hidden="true"
                />
              </button>
            )}
          </div>
        </div>

      {/* Table */}
      {rows.length === 0 ? (
        <div className={styles.empty}>No packs found.</div>
      ) : (
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              {visibleHeaders.map((header) => {
                const meta = header.column.columnDef.meta as
                  | { align?: string }
                  | undefined;
                return (
                  <th
                    key={header.id}
                    className={styles.th}
                    data-align={meta?.align}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {virtualizer.getVirtualItems().length > 0 && (
              <tr>
                <td
                  colSpan={visibleHeaders.length}
                  style={{
                    height: virtualizer.getVirtualItems()[0].start,
                    padding: 0,
                    border: "none",
                  }}
                />
              </tr>
            )}
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];
              return (
                <tr
                  key={row.id}
                  className={styles.row}
                  data-index={virtualRow.index}
                  ref={(node) => virtualizer.measureElement(node)}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as
                      | { align?: string }
                      | undefined;
                    return (
                      <td
                        key={cell.id}
                        className={styles.td}
                        data-align={meta?.align}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {virtualizer.getVirtualItems().length > 0 && (
              <tr>
                <td
                  colSpan={visibleHeaders.length}
                  style={{
                    height:
                      virtualizer.getTotalSize() -
                      ((items) => items[items.length - 1]?.end ?? 0)(virtualizer.getVirtualItems()),
                    padding: 0,
                    border: "none",
                  }}
                />
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
