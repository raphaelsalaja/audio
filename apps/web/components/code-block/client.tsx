"use client";

import Check from "@audio-kit/icons/outline/check";
import Clone from "@audio-kit/icons/outline/clone";
import BunIcon from "@audio-kit/icons/social-media/bun";
import NpmIcon from "@audio-kit/icons/social-media/npm";
import PnpmIcon from "@audio-kit/icons/social-media/pnpm";
import YarnIcon from "@audio-kit/icons/social-media/yarn";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { Calligraph } from "calligraph";
import { AnimatePresence, motion } from "motion/react";
import type { CSSProperties } from "react";
import { useCallback, useRef, useState } from "react";
import { useScrollFade } from "@/lib/use-scroll-fade";
import styles from "./styles.module.css";

const MotionCheck = motion(Check);
const MotionClone = motion(Clone);

const iconProps = {
  strokewidth: 1.5,
  width: 14,
  height: 14,
  initial: { opacity: 0, scale: 0.95, filter: "blur(2px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.95, filter: "blur(2px)" },
  transition: { duration: 0.18, ease: "easeInOut" },
  style: { display: "flex" },
} as const;

export function CopyButton({ text }: { text: string | (() => string) }) {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(() => {
    const value = typeof text === "function" ? text() : text;
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      type="button"
      className={styles.copyButton}
      onClick={onCopy}
      aria-label="Copy code"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <MotionCheck {...iconProps} key="check" />
        ) : (
          <MotionClone {...iconProps} key="copy" />
        )}
      </AnimatePresence>
    </button>
  );
}

export function Pre(
  props: React.ComponentPropsWithoutRef<"pre"> & {
    title?: string;
    icon?: string;
  },
) {
  const { title, icon, children, ...rest } = props;
  const ref = useRef<HTMLPreElement>(null);

  const getText = useCallback(
    () => ref.current?.querySelector("code")?.textContent ?? "",
    [],
  );

  const iconElement = icon ? (
    // biome-ignore lint/security/noDangerouslySetInnerHtml: trusted Shiki build-time output
    <span className={styles.icon} dangerouslySetInnerHTML={{ __html: icon }} />
  ) : null;

  const { ref: scrollRef, fade } = useScrollFade<HTMLDivElement>();

  return (
    <div className={styles.root}>
      {title && (
        <div className={styles.header}>
          <span className={styles.title}>
            {iconElement}
            {title}
          </span>
          <CopyButton text={getText} />
        </div>
      )}
      <div className={styles.preFrame}>
        <div className={styles.preScroll} ref={scrollRef} data-fade={fade}>
          <pre ref={ref} {...rest}>
            {children}
          </pre>
        </div>
      </div>
    </div>
  );
}

export interface TokenData {
  content: string;
  offset: number;
  style: Record<string, string>;
}

export interface TabItemWithTokens {
  label: string;
  value: string;
  tokens: TokenData[];
}

const iconSize = { width: 13, height: 13 };

const tabIcons: Record<string, React.ReactNode> = {
  npm: <NpmIcon {...iconSize} aria-hidden="true" />,
  yarn: <YarnIcon {...iconSize} aria-hidden="true" />,
  pnpm: <PnpmIcon {...iconSize} aria-hidden="true" />,
  bun: <BunIcon {...iconSize} aria-hidden="true" />,
};

export function TabsClient({ items }: { items: TabItemWithTokens[] }) {
  const [active, setActive] = useState(items[0]?.label ?? "");
  const activeItem = items.find((item) => item.label === active);
  const { ref: scrollRef, fade } = useScrollFade<HTMLDivElement>();

  return (
    <BaseTabs.Root
      className={styles.root}
      value={active}
      onValueChange={(value) => setActive(String(value))}
    >
      <BaseTabs.List className={styles.list}>
        {items.map((item) => (
          <BaseTabs.Tab
            key={item.label}
            value={item.label}
            className={styles.tab}
          >
            {tabIcons[item.label.toLowerCase()]}
            {item.label}
          </BaseTabs.Tab>
        ))}
        <BaseTabs.Indicator className={styles.indicator} />
        <CopyButton text={activeItem?.value ?? ""} />
      </BaseTabs.List>
      <div className={styles.panel}>
        <div className={styles.preFrame}>
          <div className={styles.preScroll} ref={scrollRef} data-fade={fade}>
            <pre>
              <code>
                {activeItem?.tokens.map((token) => (
                  <span key={token.offset} style={token.style as CSSProperties}>
                    <Calligraph animation="smooth" stagger={0} drift={{ x: 5 }}>
                      {token.content}
                    </Calligraph>
                  </span>
                ))}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </BaseTabs.Root>
  );
}
