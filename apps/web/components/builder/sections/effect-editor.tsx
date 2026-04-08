import type { Effect } from "audio-kit";
import { useRef } from "react";
import { PlusIcon, TrashIcon } from "@/components/controls/icons";
import styles from "../styles.module.css";

const EFFECT_TYPES = [
  "reverb",
  "delay",
  "distortion",
  "chorus",
  "flanger",
  "phaser",
  "tremolo",
  "vibrato",
  "bitcrusher",
  "compressor",
  "eq",
  "gain",
  "pan",
] as const;

type EffectType = (typeof EFFECT_TYPES)[number];

type Props = {
  effects: Effect[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  onUpdate: (i: number, effect: Effect) => void;
};

let nextEffectId = 0;

export function EffectEditor({ effects, onAdd, onRemove, onUpdate }: Props) {
  const ids = useRef(new WeakMap<Effect, string>());

  function getKey(effect: Effect) {
    let id = ids.current.get(effect);
    if (!id) {
      id = `effect-${++nextEffectId}`;
      ids.current.set(effect, id);
    }
    return id;
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>Effects</span>
        <button type="button" className={styles.sectionAddBtn} onClick={onAdd}>
          <PlusIcon size={10} /> Add
        </button>
      </div>

      {effects.map((effect, i) => (
        <EffectItem
          key={getKey(effect)}
          effect={effect}
          onRemove={() => onRemove(i)}
          onUpdate={(e) => onUpdate(i, e)}
        />
      ))}
    </div>
  );
}

function EffectItem({
  effect,
  onRemove,
  onUpdate,
}: {
  effect: Effect;
  onRemove: () => void;
  onUpdate: (e: Effect) => void;
}) {
  const handleTypeChange = (newType: string) => {
    onUpdate(defaultForType(newType as EffectType));
  };

  return (
    <div className={styles.inlineItem}>
      <div className={styles.inlineItemHeader}>
        <select
          className={styles.fieldSelect}
          value={effect.type}
          onChange={(e) => handleTypeChange(e.target.value)}
        >
          {EFFECT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button type="button" className={styles.iconBtn} onClick={onRemove}>
          <TrashIcon size={12} />
        </button>
      </div>
      <div className={styles.inlineItemFields}>
        <EffectFields effect={effect} onUpdate={onUpdate} />
      </div>
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <input
        type="number"
        className={styles.fieldInput}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function EffectFields({
  effect,
  onUpdate,
}: {
  effect: Effect;
  onUpdate: (e: Effect) => void;
}) {
  const set = (patch: Partial<Effect>) =>
    onUpdate({ ...effect, ...patch } as Effect);

  switch (effect.type) {
    case "reverb":
      return (
        <>
          <NumField
            label="Decay"
            value={effect.decay ?? 0.8}
            onChange={(v) => set({ decay: v })}
            min={0.1}
            max={8}
            step={0.1}
          />
          <NumField
            label="Damping"
            value={effect.damping ?? 0.5}
            onChange={(v) => set({ damping: v })}
            min={0}
            max={1}
            step={0.01}
          />
          <NumField
            label="Room size"
            value={effect.roomSize ?? 1}
            onChange={(v) => set({ roomSize: v })}
            min={0.1}
            max={4}
            step={0.1}
          />
          <NumField
            label="Pre-delay"
            value={effect.preDelay ?? 0}
            onChange={(v) => set({ preDelay: v })}
            min={0}
            max={0.5}
            step={0.01}
          />
          <NumField
            label="Mix"
            value={effect.mix ?? 0.3}
            onChange={(v) => set({ mix: v })}
            min={0}
            max={1}
            step={0.01}
          />
        </>
      );

    case "delay":
      return (
        <>
          <NumField
            label="Time"
            value={effect.time ?? 0.3}
            onChange={(v) => set({ time: v })}
            min={0.01}
            max={2}
            step={0.01}
          />
          <NumField
            label="Feedback"
            value={effect.feedback ?? 0.3}
            onChange={(v) => set({ feedback: v })}
            min={0}
            max={0.95}
            step={0.01}
          />
          <NumField
            label="Mix"
            value={effect.mix ?? 0.3}
            onChange={(v) => set({ mix: v })}
            min={0}
            max={1}
            step={0.01}
          />
        </>
      );

    case "distortion":
      return (
        <>
          <NumField
            label="Amount"
            value={effect.amount ?? 20}
            onChange={(v) => set({ amount: v })}
            min={1}
            max={100}
            step={1}
          />
          <NumField
            label="Mix"
            value={effect.mix ?? 0.5}
            onChange={(v) => set({ mix: v })}
            min={0}
            max={1}
            step={0.01}
          />
        </>
      );

    case "chorus":
      return (
        <>
          <NumField
            label="Rate"
            value={effect.rate ?? 1.5}
            onChange={(v) => set({ rate: v })}
            min={0.1}
            max={10}
            step={0.1}
          />
          <NumField
            label="Depth"
            value={effect.depth ?? 0.003}
            onChange={(v) => set({ depth: v })}
            min={0.001}
            max={0.02}
            step={0.001}
          />
          <NumField
            label="Mix"
            value={effect.mix ?? 0.3}
            onChange={(v) => set({ mix: v })}
            min={0}
            max={1}
            step={0.01}
          />
        </>
      );

    case "flanger":
      return (
        <>
          <NumField
            label="Rate"
            value={effect.rate ?? 0.5}
            onChange={(v) => set({ rate: v })}
            min={0.1}
            max={5}
            step={0.1}
          />
          <NumField
            label="Depth"
            value={effect.depth ?? 0.003}
            onChange={(v) => set({ depth: v })}
            min={0.001}
            max={0.01}
            step={0.001}
          />
          <NumField
            label="Feedback"
            value={effect.feedback ?? 0.7}
            onChange={(v) => set({ feedback: v })}
            min={0}
            max={0.95}
            step={0.01}
          />
          <NumField
            label="Mix"
            value={effect.mix ?? 0.5}
            onChange={(v) => set({ mix: v })}
            min={0}
            max={1}
            step={0.01}
          />
        </>
      );

    case "phaser":
      return (
        <>
          <NumField
            label="Rate"
            value={effect.rate ?? 0.8}
            onChange={(v) => set({ rate: v })}
            min={0.1}
            max={6}
            step={0.1}
          />
          <NumField
            label="Depth"
            value={effect.depth ?? 800}
            onChange={(v) => set({ depth: v })}
            min={100}
            max={4000}
            step={10}
          />
          <NumField
            label="Stages"
            value={effect.stages ?? 4}
            onChange={(v) => set({ stages: v })}
            min={2}
            max={12}
            step={1}
          />
          <NumField
            label="Feedback"
            value={effect.feedback ?? 0}
            onChange={(v) => set({ feedback: v })}
            min={0}
            max={0.95}
            step={0.01}
          />
          <NumField
            label="Mix"
            value={effect.mix ?? 0.5}
            onChange={(v) => set({ mix: v })}
            min={0}
            max={1}
            step={0.01}
          />
        </>
      );

    case "tremolo":
      return (
        <>
          <NumField
            label="Rate"
            value={effect.rate ?? 6}
            onChange={(v) => set({ rate: v })}
            min={0.5}
            max={20}
            step={0.5}
          />
          <NumField
            label="Depth"
            value={effect.depth ?? 0.8}
            onChange={(v) => set({ depth: v })}
            min={0}
            max={1}
            step={0.01}
          />
        </>
      );

    case "vibrato":
      return (
        <>
          <NumField
            label="Rate"
            value={effect.rate ?? 5}
            onChange={(v) => set({ rate: v })}
            min={0.5}
            max={15}
            step={0.5}
          />
          <NumField
            label="Depth"
            value={effect.depth ?? 0.005}
            onChange={(v) => set({ depth: v })}
            min={0.001}
            max={0.02}
            step={0.001}
          />
        </>
      );

    case "bitcrusher":
      return (
        <>
          <NumField
            label="Bits"
            value={effect.bits ?? 8}
            onChange={(v) => set({ bits: v })}
            min={1}
            max={16}
            step={1}
          />
          <NumField
            label="Sample rate"
            value={effect.sampleRateReduction ?? 1}
            onChange={(v) => set({ sampleRateReduction: v })}
            min={1}
            max={32}
            step={1}
          />
          <NumField
            label="Mix"
            value={effect.mix ?? 0.5}
            onChange={(v) => set({ mix: v })}
            min={0}
            max={1}
            step={0.01}
          />
        </>
      );

    case "compressor":
      return (
        <>
          <NumField
            label="Threshold"
            value={effect.threshold ?? -24}
            onChange={(v) => set({ threshold: v })}
            min={-60}
            max={0}
            step={1}
          />
          <NumField
            label="Knee"
            value={effect.knee ?? 30}
            onChange={(v) => set({ knee: v })}
            min={0}
            max={40}
            step={1}
          />
          <NumField
            label="Ratio"
            value={effect.ratio ?? 4}
            onChange={(v) => set({ ratio: v })}
            min={1}
            max={20}
            step={0.5}
          />
          <NumField
            label="Attack"
            value={effect.attack ?? 0.003}
            onChange={(v) => set({ attack: v })}
            min={0}
            max={1}
            step={0.001}
          />
          <NumField
            label="Release"
            value={effect.release ?? 0.25}
            onChange={(v) => set({ release: v })}
            min={0.01}
            max={1}
            step={0.01}
          />
        </>
      );

    case "gain":
      return (
        <NumField
          label="Value"
          value={effect.value}
          onChange={(v) => onUpdate({ type: "gain", value: v })}
          min={0}
          max={2}
          step={0.01}
        />
      );

    case "pan":
      return (
        <NumField
          label="Value"
          value={effect.value}
          onChange={(v) => onUpdate({ type: "pan", value: v })}
          min={-1}
          max={1}
          step={0.01}
        />
      );

    case "eq":
      return (
        <span className={styles.fieldLabel}>EQ bands editor coming soon</span>
      );

    default:
      return null;
  }
}

function defaultForType(type: EffectType): Effect {
  switch (type) {
    case "reverb":
      return { type: "reverb", decay: 0.8, mix: 0.3 };
    case "delay":
      return { type: "delay", time: 0.3, feedback: 0.3, mix: 0.3 };
    case "distortion":
      return { type: "distortion", amount: 20, mix: 0.5 };
    case "chorus":
      return { type: "chorus", rate: 1.5, depth: 0.003, mix: 0.3 };
    case "flanger":
      return {
        type: "flanger",
        rate: 0.5,
        depth: 0.003,
        feedback: 0.7,
        mix: 0.5,
      };
    case "phaser":
      return { type: "phaser", rate: 0.8, depth: 800, stages: 4, mix: 0.5 };
    case "tremolo":
      return { type: "tremolo", rate: 6, depth: 0.8 };
    case "vibrato":
      return { type: "vibrato", rate: 5, depth: 0.005 };
    case "bitcrusher":
      return { type: "bitcrusher", bits: 8, mix: 0.5 };
    case "compressor":
      return { type: "compressor", threshold: -24, ratio: 4 };
    case "eq":
      return {
        type: "eq",
        bands: [{ type: "peaking", frequency: 1000, gain: 0 }],
      };
    case "gain":
      return { type: "gain", value: 1 };
    case "pan":
      return { type: "pan", value: 0 };
  }
}
