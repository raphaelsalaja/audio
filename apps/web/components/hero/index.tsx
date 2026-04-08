"use client";

import type { SoundDefinition } from "audio-kit";
import { defineSound, ensureReady } from "audio-kit";
import { useCallback, useRef, useState } from "react";
import styles from "./styles.module.css";

type DemoSound = {
  name: string;
  description: string;
  definition: SoundDefinition;
};

const DEMO_SOUNDS: DemoSound[] = [
  {
    name: "click",
    description: "Button click",
    definition: {
      source: { type: "noise", color: "white" },
      filter: { type: "bandpass", frequency: 2000, resonance: 2 },
      envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.01 },
      gain: 0.3,
    },
  },
  {
    name: "success",
    description: "Confirmation",
    definition: {
      layers: [
        {
          source: { type: "sine", frequency: 523 },
          envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.08 },
          gain: 0.25,
        },
        {
          source: { type: "sine", frequency: 654 },
          envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.08 },
          delay: 0.08,
          gain: 0.25,
        },
      ],
    },
  },
  {
    name: "pop",
    description: "Toast notification",
    definition: {
      source: { type: "sine", frequency: { start: 1200, end: 300 } },
      envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.03 },
      gain: 0.3,
    },
  },
  {
    name: "ding",
    description: "Alert chime",
    definition: {
      source: {
        type: "sine",
        frequency: 880,
        fm: { ratio: 1.4, depth: 1500 },
      },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.2 },
      gain: 0.25,
    },
  },
];

export function Hero() {
  const [playing, setPlaying] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const playFnCache = useRef(new Map<string, ReturnType<typeof defineSound>>());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePlay = useCallback(
    async (name: string, definition: SoundDefinition) => {
      await ensureReady();

      if (!playFnCache.current.has(name)) {
        playFnCache.current.set(name, defineSound(definition));
      }

      const play = playFnCache.current.get(name)!;
      play();

      setPlaying(name);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setPlaying(null), 300);
    },
    [],
  );

  function handleCopy() {
    navigator.clipboard.writeText("npm install audio-kit");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={styles.hero}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Audio Kit</h1>
          <span className={styles.version}>0.1.0</span>
        </div>
        <p className={styles.tagline}>
          Declarative audio synthesis for the web. Describe sounds as plain
          objects, play them with one function call.
        </p>
      </div>

      <div className={styles.demoSection}>
        <p className={styles.demoHint}>Tap to play</p>
        <div className={styles.demoGrid}>
          {DEMO_SOUNDS.map((sound) => (
            <button
              key={sound.name}
              type="button"
              className={styles.demoCard}
              data-active={playing === sound.name || undefined}
              onClick={() => handlePlay(sound.name, sound.definition)}
            >
              <span className={styles.demoIcon}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  {playing === sound.name ? (
                    <>
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </>
                  ) : (
                    <polygon points="5 3 19 12 5 21 5 3" />
                  )}
                </svg>
              </span>
              <span className={styles.demoInfo}>
                <span className={styles.demoName}>{sound.name}</span>
                <span className={styles.demoDesc}>{sound.description}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.install}>
        <code className={styles.installCode}>npm install audio-kit</code>
        <button
          type="button"
          className={styles.installCopy}
          onClick={handleCopy}
        >
          {copied ? (
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
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
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
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>
      </div>

      <div className={styles.links}>
        <a href="/" className={styles.linkPrimary}>
          Documentation
        </a>
        <a href="#patches" className={styles.linkSecondary}>
          Browse patches
        </a>
      </div>
    </div>
  );
}
