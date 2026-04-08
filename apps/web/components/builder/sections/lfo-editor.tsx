import type { LFO, LFOTarget } from "audio-kit";
import { useRef } from "react";
import { PlusIcon, TrashIcon } from "@/components/controls/icons";
import type { BuilderAction } from "../state";
import styles from "../styles.module.css";

const WAVEFORMS = ["sine", "triangle", "square", "sawtooth"] as const;

const LFO_TARGETS: LFOTarget[] = [
  "frequency",
  "detune",
  "gain",
  "pan",
  "filter.frequency",
  "filter.detune",
  "filter.Q",
  "filter.gain",
  "playbackRate",
];

type Props = {
  index: number;
  lfos: LFO[];
  dispatch: React.Dispatch<BuilderAction>;
};

let nextLfoId = 0;

export function LFOEditor({ index, lfos, dispatch }: Props) {
  const ids = useRef(new WeakMap<LFO, string>());

  function getKey(lfo: LFO) {
    let id = ids.current.get(lfo);
    if (!id) {
      id = `lfo-${++nextLfoId}`;
      ids.current.set(lfo, id);
    }
    return id;
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>LFO</span>
        <button
          type="button"
          className={styles.sectionAddBtn}
          onClick={() => dispatch({ type: "add-lfo", index })}
        >
          <PlusIcon size={10} /> Add
        </button>
      </div>

      {lfos.map((lfo, li) => (
        <LFOItem
          key={getKey(lfo)}
          layerIndex={index}
          lfoIndex={li}
          lfo={lfo}
          dispatch={dispatch}
        />
      ))}
    </div>
  );
}

function LFOItem({
  layerIndex,
  lfoIndex,
  lfo,
  dispatch,
}: {
  layerIndex: number;
  lfoIndex: number;
  lfo: LFO;
  dispatch: React.Dispatch<BuilderAction>;
}) {
  const set = (next: LFO) =>
    dispatch({ type: "update-lfo", index: layerIndex, lfoIndex, lfo: next });

  return (
    <div className={styles.inlineItem}>
      <div className={styles.inlineItemHeader}>
        <select
          className={styles.fieldSelect}
          value={lfo.type}
          onChange={(e) => set({ ...lfo, type: e.target.value as LFO["type"] })}
        >
          {WAVEFORMS.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={() =>
            dispatch({ type: "remove-lfo", index: layerIndex, lfoIndex })
          }
        >
          <TrashIcon size={12} />
        </button>
      </div>
      <div className={styles.inlineItemFields}>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Target</span>
          <select
            className={styles.fieldSelect}
            value={lfo.target}
            onChange={(e) =>
              set({ ...lfo, target: e.target.value as LFOTarget })
            }
          >
            {LFO_TARGETS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Frequency</span>
          <input
            type="number"
            className={styles.fieldInput}
            value={lfo.frequency}
            min={0.1}
            max={30}
            step={0.1}
            onChange={(e) => set({ ...lfo, frequency: Number(e.target.value) })}
          />
        </div>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Depth</span>
          <input
            type="number"
            className={styles.fieldInput}
            value={lfo.depth}
            min={0}
            max={5000}
            step={1}
            onChange={(e) => set({ ...lfo, depth: Number(e.target.value) })}
          />
        </div>
      </div>
    </div>
  );
}
