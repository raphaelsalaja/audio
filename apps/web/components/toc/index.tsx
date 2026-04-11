"use client";

import { useSound } from "@web-kits/audio/react";
import { tick } from "@audio/core";
import type { TOCItemType } from "fumadocs-core/toc";
import {
  createContext,
  type ReactNode,
  use,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./styles.module.css";

interface TOCState {
  activeIds: Set<string>;
}

interface TOCMeta {
  navRef: React.RefObject<HTMLUListElement | null>;
  indicatorRef: React.RefObject<HTMLDivElement | null>;
  registerItem: (id: string) => (el: HTMLLIElement | null) => void;
}

interface TOCContextValue {
  state: TOCState;
  meta: TOCMeta;
}

const TOCContext = createContext<TOCContextValue | null>(null);

function useTOC() {
  const ctx = use(TOCContext);
  if (!ctx) throw new Error("TOC components must be used within TOC.Provider");
  return ctx;
}

function useActiveItems(ids: string[]) {
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const visible = new Set<string>();

    function findClosest(): string | null {
      let closest: string | null = null;
      let closestTop = -Infinity;

      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= 100 && top > closestTop) {
          closest = id;
          closestTop = top;
        }
      }

      return closest ?? ids[0] ?? null;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.add(entry.target.id);
          } else {
            visible.delete(entry.target.id);
          }
        }

        if (visible.size > 0) {
          setActiveIds(new Set(visible));
        } else {
          const closest = findClosest();
          if (closest) setActiveIds(new Set([closest]));
        }
      },
      { rootMargin: "0px 0px -20% 0px" },
    );

    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [ids]);

  return activeIds;
}

// --- Compound components ---

function TOCProvider({
  toc,
  children,
}: {
  toc: TOCItemType[];
  children: ReactNode;
}) {
  const ids = useMemo(() => toc.map((item) => item.url.slice(1)), [toc]);
  const activeIds = useActiveItems(ids);

  const navRef = useRef<HTMLUListElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map());

  const registerItem = useCallback(
    (id: string) => (el: HTMLLIElement | null) => {
      if (el) itemRefs.current.set(id, el);
      else itemRefs.current.delete(id);
    },
    [],
  );

  useLayoutEffect(() => {
    const nav = navRef.current;
    const indicator = indicatorRef.current;
    if (!nav || !indicator || activeIds.size === 0) return;

    let minTop = Number.POSITIVE_INFINITY;
    let maxBottom = Number.NEGATIVE_INFINITY;
    const navRect = nav.getBoundingClientRect();

    for (const id of activeIds) {
      const li = itemRefs.current.get(id);
      if (!li) continue;
      const rect = li.getBoundingClientRect();
      const top = rect.top - navRect.top;
      const bottom = top + rect.height;
      if (top < minTop) minTop = top;
      if (bottom > maxBottom) maxBottom = bottom;
    }

    if (minTop === Number.POSITIVE_INFINITY) return;

    indicator.style.opacity = "1";
    indicator.style.top = `${minTop}px`;
    indicator.style.height = `${maxBottom - minTop}px`;
  }, [activeIds]);

  const value = useMemo<TOCContextValue>(
    () => ({
      state: { activeIds },
      meta: { navRef, indicatorRef, registerItem },
    }),
    [activeIds, registerItem],
  );

  return <TOCContext value={value}>{children}</TOCContext>;
}

function TOCRoot({ children }: { children: ReactNode }) {
  return <aside className={styles.toc}>{children}</aside>;
}

function TOCLabel({ children }: { children: ReactNode }) {
  return <div className={styles.label}>{children}</div>;
}

function TOCNav({ children }: { children: ReactNode }) {
  const { meta } = useTOC();

  return (
    <ul ref={meta.navRef} className={styles.nav}>
      <div
        ref={meta.indicatorRef}
        className={styles.indicator}
        aria-hidden={true}
      />
      {children}
    </ul>
  );
}

function TOCLink({ item }: { item: TOCItemType }) {
  const { state, meta } = useTOC();
  const id = item.url.slice(1);
  const isActive = state.activeIds.has(id);
  const playTick = useSound(tick);

  return (
    <li ref={meta.registerItem(id)}>
      <a
        href={item.url}
        data-active={isActive || undefined}
        className={styles.link}
        style={{ paddingLeft: `${(item.depth - 2) * 12 + 12}px` }}
        onClick={playTick}
      >
        {item.title}
      </a>
    </li>
  );
}

// --- Public API ---

export const TOC = {
  Provider: TOCProvider,
  Root: TOCRoot,
  Label: TOCLabel,
  Nav: TOCNav,
  Link: TOCLink,
};

export function TableOfContents({ toc }: { toc: TOCItemType[] }) {
  if (toc.length === 0) {
    return <aside className={styles.toc} />;
  }

  return (
    <TOC.Provider toc={toc}>
      <TOC.Root>
        <TOC.Label>Table of Contents</TOC.Label>
        <TOC.Nav>
          {toc.map((item) => (
            <TOC.Link key={item.url} item={item} />
          ))}
        </TOC.Nav>
      </TOC.Root>
    </TOC.Provider>
  );
}
