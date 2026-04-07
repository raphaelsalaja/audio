"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Fade = "none" | "left" | "right" | "both";

export function useScrollFade<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [fade, setFade] = useState<Fade>("none");

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const threshold = 2;
    const canLeft = scrollLeft > threshold;
    const canRight = scrollLeft + clientWidth < scrollWidth - threshold;

    if (canLeft && canRight) setFade("both");
    else if (canLeft) setFade("left");
    else if (canRight) setFade("right");
    else setFade("none");
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    el.addEventListener("scroll", update, { passive: true });

    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, [update]);

  return { ref, fade };
}
