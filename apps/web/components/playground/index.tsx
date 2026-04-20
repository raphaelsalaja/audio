"use client";

import {
  checkbox as checkboxSound,
  click as clickSound,
  tabSwitch,
  tap as tapSound,
} from "@audio/core";
import { Button } from "@base-ui/react/button";
import { Checkbox } from "@base-ui/react/checkbox";
import { Slider } from "@base-ui/react/slider";
import { Tabs } from "@base-ui/react/tabs";
import type { SoundDefinition } from "@web-kits/audio";
import { defineSound, ensureReady } from "@web-kits/audio";
import CheckIcon from "@web-kits/icons/outline/check";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import styles from "./styles.module.css";

const sounds: Record<string, SoundDefinition> = {
  click: clickSound,
  checkbox: checkboxSound,
  tap: tapSound,
  "tab-switch": tabSwitch,
};

const GRID_CELLS = [
  { id: "click" },
  { id: "checkbox" },
  { id: "tab-switch" },
  { id: "slider" },
] as const;

const spring = { type: "spring", stiffness: 500, damping: 25 } as const;

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
                <CheckIcon strokewidth={3} width={12} height={12} />
              </motion.span>
            )}
          </AnimatePresence>
        </Checkbox.Indicator>
      </Checkbox.Root>
      Enable Notifications
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

export function Playground() {
  const play = useCallback(async (name?: string) => {
    await ensureReady();
    const def = sounds[name ?? "click"];
    if (!def) return;
    defineSound(def)();
  }, []);

  return (
    <div className={styles.playground}>
      <div className={styles.grid}>
        {GRID_CELLS.map((cell) => (
          <div key={cell.id} className={styles.cell}>
            <CellWidget cellId={cell.id} play={play} />
          </div>
        ))}
      </div>
    </div>
  );
}
