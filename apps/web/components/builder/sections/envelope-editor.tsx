"use client";

import type { Envelope } from "audio-kit";
import { useEffect, useRef } from "react";
import type { BuilderAction } from "../state";
import styles from "../styles.module.css";

type Props = {
  index: number;
  envelope: Envelope | undefined;
  dispatch: React.Dispatch<BuilderAction>;
};

export function EnvelopeEditor({ index, envelope, dispatch }: Props) {
  const env = envelope ?? { decay: 0.3 };
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const set = (next: Envelope) =>
    dispatch({ type: "set-envelope", index, envelope: next });

  const update = (key: keyof Envelope, value: number) => {
    set({ ...env, [key]: value });
  };

  useEffect(() => {
    drawADSR(canvasRef.current, env);
  }, [env]);

  return (
    <div className={styles.section}>
      <span className={styles.sectionLabel}>Envelope</span>

      <div className={styles.adsrCurve}>
        <canvas ref={canvasRef} className={styles.adsrCanvas} />
      </div>

      <div className={styles.field}>
        <span className={styles.fieldLabel}>Attack</span>
        <input
          type="range"
          className={styles.fieldInput}
          value={env.attack ?? 0}
          min={0}
          max={2}
          step={0.01}
          onChange={(e) => update("attack", Number(e.target.value))}
        />
        <span className={styles.fieldRowLabel}>
          {(env.attack ?? 0).toFixed(2)}s
        </span>
      </div>

      <div className={styles.field}>
        <span className={styles.fieldLabel}>Decay</span>
        <input
          type="range"
          className={styles.fieldInput}
          value={env.decay}
          min={0.01}
          max={4}
          step={0.01}
          onChange={(e) => update("decay", Number(e.target.value))}
        />
        <span className={styles.fieldRowLabel}>{env.decay.toFixed(2)}s</span>
      </div>

      <div className={styles.field}>
        <span className={styles.fieldLabel}>Sustain</span>
        <input
          type="range"
          className={styles.fieldInput}
          value={env.sustain ?? 0}
          min={0}
          max={1}
          step={0.01}
          onChange={(e) => update("sustain", Number(e.target.value))}
        />
        <span className={styles.fieldRowLabel}>
          {(env.sustain ?? 0).toFixed(2)}
        </span>
      </div>

      <div className={styles.field}>
        <span className={styles.fieldLabel}>Release</span>
        <input
          type="range"
          className={styles.fieldInput}
          value={env.release ?? 0}
          min={0}
          max={4}
          step={0.01}
          onChange={(e) => update("release", Number(e.target.value))}
        />
        <span className={styles.fieldRowLabel}>
          {(env.release ?? 0).toFixed(2)}s
        </span>
      </div>
    </div>
  );
}

function drawADSR(canvas: HTMLCanvasElement | null, env: Envelope) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const pad = 8;
  const drawW = w - pad * 2;
  const drawH = h - pad * 2;

  const a = env.attack ?? 0;
  const d = env.decay;
  const s = env.sustain ?? 0;
  const r = env.release ?? 0;

  const total = a + d + Math.max(r, 0.2);
  const scale = drawW / total;

  const x0 = pad;
  const y0 = pad + drawH;
  const xA = x0 + a * scale;
  const xD = xA + d * scale;
  const xR = xD + Math.max(r, 0.2) * scale;
  const yTop = pad;
  const ySustain = pad + drawH * (1 - s);

  const style = getComputedStyle(canvas);
  const strokeColor = style.getPropertyValue("--gray-8").trim() || "#888";

  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(xA, yTop);
  ctx.lineTo(xD, ySustain);
  ctx.lineTo(xR, y0);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1.5;
  ctx.lineJoin = "round";
  ctx.stroke();
}
