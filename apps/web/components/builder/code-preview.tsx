"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/controls/icons";
import styles from "./styles.module.css";

type Props = {
  code: string;
};

export function CodePreview({ code }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={styles.codePreview}>
      <div className={styles.codeHeader}>
        <span className={styles.codeTitle}>Output</span>
        <button type="button" className={styles.copyBtn} onClick={handleCopy}>
          {copied ? (
            <>
              <CheckIcon size={12} /> Copied
            </>
          ) : (
            <>
              <CopyIcon size={12} /> Copy
            </>
          )}
        </button>
      </div>
      <div className={styles.codeBody}>
        <pre>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
