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
  useCallback,
  useEffect,
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
  return (
    <SidebarContext value={{ pathname, onNavigate }}>{children}</SidebarContext>
  );
}

function useScrollFade(ref: React.RefObject<HTMLElement | null>) {
  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const threshold = 2;
    const canScrollUp = scrollTop > threshold;
    const canScrollDown = scrollTop + clientHeight < scrollHeight - threshold;

    if (canScrollUp && canScrollDown) el.dataset.fade = "both";
    else if (canScrollDown) el.dataset.fade = "bottom";
    else if (canScrollUp) el.dataset.fade = "top";
    else delete el.dataset.fade;
  }, [ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [ref, update]);
}

function SidebarAside({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useScrollFade(ref);
  return (
    <aside ref={ref} className={styles.sidebar}>
      {children}
    </aside>
  );
}

function SidebarDrawer({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useScrollFade(ref);
  return (
    <aside ref={ref} className={styles.drawer}>
      {children}
    </aside>
  );
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
  const [open, setOpen] = useState(false);

  const folderPath = href ? href.replace(/\/[^/]+$/, "") : undefined;
  const isActive = folderPath
    ? pathname.startsWith(folderPath)
    : href
      ? pathname.startsWith(href)
      : false;
  const entry =
    (folderPath ? getIconEntry(folderPath) : undefined) ??
    (href ? getIconEntry(href) : undefined);

  useEffect(() => {
    if (isActive) setOpen(true);
  }, [isActive]);

  const label = (
    <>
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
      <svg
        role="img"
        aria-label="Toggle"
        className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            setOpen((v) => !v);
          }
        }}
      >
        <path d="M6 4l4 4-4 4" />
      </svg>
    </>
  );

  return (
    <div className={styles.folder}>
      {href ? (
        <Link
          href={href}
          className={`${styles.folderLabel} ${isActive ? styles.folderLabelActive : ""}`}
          onClick={() => {
            setOpen(true);
            onNavigate?.();
          }}
        >
          {label}
        </Link>
      ) : (
        <button
          type="button"
          className={`${styles.folderLabel} ${isActive ? styles.folderLabelActive : ""}`}
          onClick={() => setOpen((v) => !v)}
        >
          {label}
        </button>
      )}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ overflow: "hidden" }}
          >
            <FolderChildren>{children}</FolderChildren>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function measureActive(el: HTMLDivElement, _pathname: string) {
  const active = el.querySelector(`.${styles.active}`) as HTMLElement | null;
  if (active) {
    el.style.setProperty("--active-top", `${active.offsetTop}px`);
    el.style.setProperty("--active-opacity", "1");
  } else {
    el.style.setProperty("--active-opacity", "0");
  }
}

function FolderChildren({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useSidebar();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measureActive(el, pathname);
  }, [pathname]);

  return (
    <div ref={ref} className={styles.folderChildren}>
      {children}
    </div>
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
};
