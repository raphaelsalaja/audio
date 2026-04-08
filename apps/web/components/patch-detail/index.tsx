"use client";

import { usePack } from "audio-kit/react";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import type { PatchSoundsByCategory, PatchWithStats } from "@/lib/patches";
import styles from "./styles.module.css";

function formatLoads(n: number): string {
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1)}K`;
  }
  return String(Math.round(n));
}

export function PatchDetail({
  patch,
  sounds,
}: {
  patch: PatchWithStats;
  sounds: PatchSoundsByCategory[];
}) {
  const [copied, setCopied] = useState(false);
  const snippet = `loadPack("${patch.url}")`;

  function handleCopy() {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={styles.container}>
      <Link href="/library" className={styles.back}>
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
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Patches
      </Link>

      <div className={styles.header}>
        <h1 className={styles.title}>{patch.name}</h1>
        <p className={styles.author}>by {patch.author}</p>
      </div>

      <p className={styles.description}>{patch.description}</p>

      <div className={styles.snippet}>
        <code className={styles.code}>{snippet}</code>
        <button type="button" className={styles.copyBtn} onClick={handleCopy}>
          {copied ? (
            <>
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
              Copied
            </>
          ) : (
            <>
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
              Copy
            </>
          )}
        </button>
      </div>

      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Sounds</span>
          <span className={styles.metaValue}>{patch.soundCount}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Loads</span>
          <span className={styles.metaValue}>{formatLoads(patch.loads)}</span>
        </div>
        {patch.sourceUrl ? (
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Source</span>
            <a
              href={patch.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.metaLink}
            >
              View JSON
            </a>
          </div>
        ) : patch.source ? (
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Source</span>
            <a
              href={patch.source}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.metaLink}
            >
              GitHub
            </a>
          </div>
        ) : null}
      </div>

      {patch.tags.length > 0 ? (
        <div className={styles.tags}>
          {patch.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {sounds.length > 0 ? (
        <div className={styles.soundsSection}>
          <h2 className={styles.sectionTitle}>What's inside</h2>
          <SoundDemo packName={patch.name} sounds={sounds} />
        </div>
      ) : null}
    </div>
  );
}

function SoundDemo({
  packName,
  sounds,
}: {
  packName: string;
  sounds: PatchSoundsByCategory[];
}) {
  const pack = usePack(`/api/pack/${packName}`);
  const [playing, setPlaying] = useState<string | null>(null);
  const voiceRef = useRef<{ stop: (t?: number) => void } | null>(null);
  const playingRef = useRef<string | null>(null);

  const handlePlay = useCallback(
    (soundName: string) => {
      if (voiceRef.current) {
        voiceRef.current.stop();
        voiceRef.current = null;
      }

      if (playingRef.current === soundName) {
        playingRef.current = null;
        setPlaying(null);
        return;
      }

      if (!pack.ready) return;

      const available = pack.sounds;
      if (!available.includes(soundName)) return;

      const voice = pack.play(soundName);
      voiceRef.current = voice;
      playingRef.current = soundName;
      setPlaying(soundName);

      setTimeout(() => {
        if (playingRef.current === soundName) {
          playingRef.current = null;
          voiceRef.current = null;
        }
        setPlaying((current) => (current === soundName ? null : current));
      }, 3000);
    },
    [pack],
  );

  return (
    <div className={styles.soundCategories}>
      {sounds.map((group) => (
        <div key={group.category} className={styles.categoryGroup}>
          <h3 className={styles.categoryTitle}>{group.category}</h3>
          <div className={styles.soundGrid}>
            {group.sounds.map((sound) => {
              const isAvailable =
                pack.ready && pack.sounds.includes(sound.name);
              const isPlaying = playing === sound.name;

              return (
                <button
                  key={sound.id}
                  type="button"
                  className={styles.soundCard}
                  data-playing={isPlaying}
                  data-available={isAvailable}
                  onClick={() => handlePlay(sound.name)}
                  disabled={!pack.ready}
                >
                  <div className={styles.soundIcon}>
                    {isPlaying ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    )}
                  </div>
                  <div className={styles.soundInfo}>
                    <span className={styles.soundName}>{sound.name}</span>
                    {sound.description ? (
                      <span className={styles.soundDesc}>
                        {sound.description}
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {!pack.ready ? (
        <p className={styles.loadingHint}>Loading pack...</p>
      ) : null}
    </div>
  );
}
