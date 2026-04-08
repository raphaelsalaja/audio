"use client";

import ArrowUpRight from "@audio-kit/icons/outline/arrow-up-right";
import type {
  Folder,
  Item,
  Node,
  Root as PageTree,
  Separator,
} from "fumadocs-core/page-tree";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  use,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getIconEntry } from "./icons";
import styles from "./styles.module.css";

interface SidebarContextValue {
  pathname: string;
  onNavigate?: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const ctx = use(SidebarContext);
  if (!ctx) throw new Error("Sidebar.* must be used within Sidebar.Root");
  return ctx;
}

function SidebarRoot({
  children,
  onNavigate,
}: {
  children: React.ReactNode;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const value = useMemo<SidebarContextValue>(
    () => ({ pathname, onNavigate }),
    [pathname, onNavigate],
  );
  return <SidebarContext value={value}>{children}</SidebarContext>;
}

function SidebarAside({ children }: { children: React.ReactNode }) {
  return <aside className={styles.sidebar}>{children}</aside>;
}

function SidebarDrawer({ children }: { children: React.ReactNode }) {
  return <aside className={styles.drawer}>{children}</aside>;
}

function SidebarHeader({ children }: { children: React.ReactNode }) {
  const { onNavigate } = useSidebar();
  return (
    <div className={styles.header}>
      <Link href="/" className={styles.logo} onClick={onNavigate}>
        {children}
      </Link>
    </div>
  );
}

function SidebarNav({ children }: { children: React.ReactNode }) {
  return <nav className={styles.nav}>{children}</nav>;
}

function SidebarLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const { pathname, onNavigate } = useSidebar();
  const active = pathname === href;
  const entry = getIconEntry(href);

  if (entry?.external) {
    return (
      <Link href={href} className={styles.externalLink} onClick={onNavigate}>
        <span className={styles.externalLinkLeft}>
          <entry.icon width={14} height={14} className={styles.icon} />
          {children}
          {entry.tag && <span className={styles.tag}>{entry.tag}</span>}
        </span>
        <ArrowUpRight width={12} height={12} className={styles.externalArrow} />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`${styles.link} ${active ? styles.active : ""}`}
      onClick={onNavigate}
    >
      {entry && (
        <entry.icon
          width={14}
          height={14}
          className={styles.icon}
          style={active ? { color: entry.color } : undefined}
        />
      )}
      {children}
      {entry?.tag && <span className={styles.tag}>{entry.tag}</span>}
    </Link>
  );
}

function SidebarSeparatorItem({ name }: { name?: React.ReactNode }) {
  if (!name) return <div className={styles.divider} />;
  return <div className={styles.sectionLabel}>{name}</div>;
}

function SidebarFolder({
  name,
  href,
  children,
}: {
  name: string;
  href?: string;
  children: React.ReactNode;
}) {
  const { pathname, onNavigate } = useSidebar();

  const folderPath = href ? href.replace(/\/[^/]+$/, "") : undefined;
  const isActive = folderPath
    ? pathname.startsWith(folderPath)
    : href
      ? pathname.startsWith(href)
      : false;

  const [open, setOpen] = useState(isActive);
  const entry =
    (folderPath ? getIconEntry(folderPath) : undefined) ??
    (href ? getIconEntry(href) : undefined);

  useEffect(() => {
    if (isActive) setOpen(true);
  }, [isActive]);

  const chevron = (
    <motion.svg
      aria-hidden={true}
      className={styles.chevron}
      animate={{ rotate: open ? 90 : 0 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M6 4l4 4-4 4" />
    </motion.svg>
  );

  const labelText = (
    <span className={styles.folderLabelText}>
      {entry && (
        <entry.icon
          width={14}
          height={14}
          className={styles.icon}
          style={isActive ? { color: entry.color } : undefined}
        />
      )}
      {name}
    </span>
  );

  return (
    <div className={styles.folder}>
      {href ? (
        <div
          className={`${styles.folderLabelRow} ${isActive ? styles.folderLabelActive : ""}`}
        >
          <Link
            href={href}
            className={styles.folderLabelLink}
            onClick={() => {
              setOpen(true);
              onNavigate?.();
            }}
          >
            {labelText}
          </Link>
          <button
            type="button"
            className={styles.chevronButton}
            aria-expanded={open}
            aria-label={`${open ? "Collapse" : "Expand"} ${name}`}
            onClick={(e) => {
              e.preventDefault();
              setOpen((v) => !v);
            }}
          >
            {chevron}
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={`${styles.folderLabel} ${isActive ? styles.folderLabelActive : ""}`}
          onClick={() => setOpen((v) => !v)}
        >
          {labelText}
          {chevron}
        </button>
      )}
      <FolderChildren open={open}>{children}</FolderChildren>
    </div>
  );
}

function measureActive(el: HTMLDivElement) {
  const active = el.querySelector(`.${styles.active}`) as HTMLElement | null;
  if (active) {
    el.style.setProperty("--active-top", `${active.offsetTop}px`);
    el.style.setProperty("--active-opacity", "1");
  } else {
    el.style.setProperty("--active-opacity", "0");
  }
}

function FolderChildren({
  children,
  open,
}: {
  children: React.ReactNode;
  open: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useSidebar();

  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname + open affect active rail position
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    measureActive(el);
  }, [pathname, open]);

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          style={{ overflow: "hidden" }}
        >
          <div ref={ref} className={styles.folderChildren}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SidebarTreeNode({ node }: { node: Node }) {
  switch (node.type) {
    case "page":
      return <SidebarLink href={(node as Item).url}>{node.name}</SidebarLink>;
    case "separator":
      return <SidebarSeparatorItem name={(node as Separator).name} />;
    case "folder": {
      const folder = node as Folder;
      const firstPage =
        folder.index ??
        folder.children.find((c): c is Item => c.type === "page");
      return (
        <SidebarFolder name={String(folder.name)} href={firstPage?.url}>
          {folder.children.map((child) => (
            <SidebarTreeNode
              key={child.$id ?? String(child.name)}
              node={child}
            />
          ))}
        </SidebarFolder>
      );
    }
    default:
      return null;
  }
}

function SidebarTree({ tree }: { tree: PageTree }) {
  return (
    <>
      {tree.children.map((node) => (
        <SidebarTreeNode key={node.$id ?? String(node.name)} node={node} />
      ))}
    </>
  );
}

export {
  SidebarAside,
  SidebarDrawer,
  SidebarFolder,
  SidebarHeader,
  SidebarLink,
  SidebarNav,
  SidebarRoot,
  SidebarSeparatorItem as SidebarSeparator,
  SidebarTree,
  SidebarTreeNode,
};
