"use client";

import Check from "@audio-kit/icons/outline/check";
import ChevronDown from "@audio-kit/icons/outline/chevron-down";
import Clone from "@audio-kit/icons/outline/clone";
import Markdown from "@audio-kit/icons/outline/markdown";
import { Menu } from "@base-ui/react/menu";
import { Calligraph } from "calligraph";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import styles from "./styles.module.css";

const cache = new Map<string, Promise<string>>();

const MotionCheck = motion(Check);
const MotionClone = motion(Clone);

const iconAnim = {
  initial: { opacity: 0, scale: 0.95, filter: "blur(2px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.95, filter: "blur(2px)" },
  transition: { duration: 0.18, ease: "easeInOut" },
  style: { display: "flex" },
} as const;

export function CopyForLLM() {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const markdownUrl = `${pathname}.mdx`;

  const onCopy = useCallback(async () => {
    const cached = cache.get(markdownUrl);
    if (cached) {
      await navigator.clipboard.writeText(await cached);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }

    setLoading(true);
    try {
      const promise = fetch(markdownUrl).then((res) => res.text());
      cache.set(markdownUrl, promise);
      const text = await promise;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } finally {
      setLoading(false);
    }
  }, [markdownUrl]);

  return (
    <div className={styles.container}>
      <button type="button" className={styles.button} onClick={onCopy}>
        <AnimatePresence mode="wait" initial={false}>
          {copied ? (
            <MotionCheck
              {...iconAnim}
              key="check"
              width={14}
              height={14}
              strokewidth={1.5}
            />
          ) : (
            <MotionClone
              {...iconAnim}
              key="clone"
              width={14}
              height={14}
              strokewidth={1.5}
            />
          )}
        </AnimatePresence>
        <Calligraph animation="smooth" stagger={0} drift={{ x: 5 }}>
          {copied ? "Copied" : "Copy for LLM"}
        </Calligraph>
      </button>
      <Menu.Root>
        <Menu.Trigger className={styles.trigger}>
          <ChevronDown
            width={12}
            height={12}
            strokewidth={2}
            className={styles.chevron}
          />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner
            className={styles.positioner}
            sideOffset={8}
            align="end"
          >
            <Menu.Popup className={styles.popup}>
              <Menu.Item
                className={styles.item}
                disabled={loading}
                onSelect={onCopy}
              >
                <Clone width={16} height={16} strokewidth={1.5} />
                <div className={styles.itemText}>
                  <span className={styles.itemTitle}>Copy Page</span>
                  <span className={styles.itemDescription}>
                    Copy page as Markdown for LLMs
                  </span>
                </div>
              </Menu.Item>

              <Menu.Item
                className={styles.item}
                onSelect={() => window.open(markdownUrl, "_blank")}
              >
                <Markdown width={16} height={16} strokewidth={1.5} />
                <div className={styles.itemText}>
                  <span className={styles.itemTitle}>View as Markdown</span>
                  <span className={styles.itemDescription}>
                    View this page as plain text
                  </span>
                </div>
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </div>
  );
}
