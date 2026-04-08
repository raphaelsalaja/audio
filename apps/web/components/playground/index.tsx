"use client";

import { Button } from "@base-ui/react/button";
import { Checkbox } from "@base-ui/react/checkbox";
import { Slider } from "@base-ui/react/slider";
import { Tabs } from "@base-ui/react/tabs";
import type { SoundDefinition } from "audio-kit";
import { defineSound, ensureReady } from "audio-kit";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import uiEssentials from "../../../../packs/core.json";
import styles from "./styles.module.css";

type Pack = {
  name: string;
  sounds: Record<string, SoundDefinition>;
};

const pack = uiEssentials as unknown as Pack;

const GRID_CELLS = [
  { id: "click" },
  { id: "checkbox" },
  { id: "tab-switch" },
  { id: "slider" },
] as const;

const spring = { type: "spring", stiffness: 500, damping: 25 } as const;

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */

function CheckIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      fill="currentcolor"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-hidden="true"
      {...props}
    >
      <path d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Widget components                                                  */
/* ------------------------------------------------------------------ */

type WidgetProps = {
  play: (name?: string) => void;
};

function CheckboxWidget({ play }: WidgetProps) {
  const [checked, setChecked] = useState(false);
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: Base UI Checkbox.Root renders a hidden input internally
    <label className={styles.widgetCheckboxLabel}>
      <Checkbox.Root
        className={styles.widgetCheckbox}
        checked={checked}
        onCheckedChange={(val) => {
          setChecked(val);
          play("checkbox");
        }}
      >
        <Checkbox.Indicator className={styles.widgetCheckboxIndicator}>
          <AnimatePresence>
            {checked && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={spring}
                style={{ display: "flex" }}
              >
                <CheckIcon className={styles.widgetCheckboxIcon} />
              </motion.span>
            )}
          </AnimatePresence>
        </Checkbox.Indicator>
      </Checkbox.Root>
      Enable notifications
    </label>
  );
}

function SliderWidget({ play }: WidgetProps) {
  const lastTick = useRef(0);
  return (
    <Slider.Root
      className={styles.widgetSliderRoot}
      defaultValue={40}
      step={5}
      onValueChange={() => {
        const now = performance.now();
        if (now - lastTick.current > 60) {
          lastTick.current = now;
          play("tap");
        }
      }}
    >
      <Slider.Control className={styles.widgetSliderControl}>
        <Slider.Track className={styles.widgetSliderTrack}>
          <Slider.Indicator className={styles.widgetSliderIndicator} />
          <Slider.Thumb
            aria-label="Volume"
            className={styles.widgetSliderThumb}
          />
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  );
}

function TabsWidget({ play }: WidgetProps) {
  return (
    <Tabs.Root
      defaultValue="general"
      className={styles.widgetTabsRoot}
      onValueChange={() => play("tab-switch")}
    >
      <Tabs.List className={styles.widgetTabsList}>
        <Tabs.Tab value="general" className={styles.widgetTab}>
          General
        </Tabs.Tab>
        <Tabs.Tab value="settings" className={styles.widgetTab}>
          Settings
        </Tabs.Tab>
        <Tabs.Tab value="about" className={styles.widgetTab}>
          About
        </Tabs.Tab>
        <Tabs.Indicator className={styles.widgetTabsIndicator} />
      </Tabs.List>
    </Tabs.Root>
  );
}

function ButtonWidget({ play }: WidgetProps) {
  return (
    <Button
      className={styles.widgetButton}
      render={
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.92 }}
          transition={spring}
        />
      }
      onClick={() => play("click")}
    >
      Submit
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/*  Cell renderer                                                      */
/* ------------------------------------------------------------------ */

function CellWidget({ cellId, play }: { cellId: string } & WidgetProps) {
  switch (cellId) {
    case "checkbox":
      return <CheckboxWidget play={play} />;
    case "slider":
      return <SliderWidget play={play} />;
    case "tab-switch":
      return <TabsWidget play={play} />;
    case "click":
      return <ButtonWidget play={play} />;
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Playground                                                         */
/* ------------------------------------------------------------------ */

export function Playground() {
  const play = useCallback(async (name?: string) => {
    await ensureReady();
    const def = pack.sounds[name ?? "click"];
    if (!def) return;
    defineSound(def)();
  }, []);

  return (
    <div className={styles.playground}>
      <div className={styles.grid}>
        {GRID_CELLS.map((cell, i) => (
          <motion.div
            key={cell.id}
            className={styles.cell}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, ...spring }}
          >
            <CellWidget cellId={cell.id} play={play} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
