"use client";

import type { AudioAnalyser } from "audio-kit";
import { createMasterAnalyser } from "audio-kit";
import { useCallback, useEffect, useRef } from "react";

export function useVisualizer(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
  const analyserRef = useRef<AudioAnalyser | null>(null);
  const frameRef = useRef<number>(0);
  const activeRef = useRef(false);
  const decayRef = useRef<Float32Array | null>(null);

  const start = useCallback(() => {
    if (!analyserRef.current) {
      analyserRef.current = createMasterAnalyser({
        fftSize: 256,
        smoothingTimeConstant: 0.7,
      });
    }
    activeRef.current = true;

    const draw = () => {
      const canvas = canvasRef.current;
      const analyser = analyserRef.current;
      if (!canvas || !analyser) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);
      }

      const freq = analyser.getFrequencyData();
      const barCount = Math.min(freq.length, 64);

      if (!decayRef.current || decayRef.current.length !== barCount) {
        decayRef.current = new Float32Array(barCount);
      }
      const decay = decayRef.current;

      ctx.clearRect(0, 0, w, h);

      const gap = 2;
      const barWidth = (w - gap * (barCount - 1)) / barCount;
      const style = getComputedStyle(canvas);
      const color =
        style.getPropertyValue("--vis-color").trim() || "rgba(0,0,0,0.15)";

      let hasSignal = false;

      for (let i = 0; i < barCount; i++) {
        const raw = freq[i] / 255;
        if (raw > decay[i]) {
          decay[i] = raw;
        } else {
          decay[i] *= 0.92;
        }
        if (decay[i] > 0.005) hasSignal = true;

        const barH = decay[i] * h * 0.85;
        const x = i * (barWidth + gap);
        const radius = Math.min(barWidth / 2, 2);

        if (barH > 0.5) {
          ctx.beginPath();
          ctx.roundRect(x, h - barH, barWidth, barH, radius);
          ctx.fillStyle = color;
          ctx.fill();
        }
      }

      if (hasSignal || activeRef.current) {
        frameRef.current = requestAnimationFrame(draw);
      }
    };

    cancelAnimationFrame(frameRef.current);
    draw();
  }, [canvasRef]);

  const stop = useCallback(() => {
    activeRef.current = false;
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(frameRef.current);
      analyserRef.current?.dispose();
    };
  }, []);

  return { start, stop };
}
