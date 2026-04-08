import type { BiquadFilterType, Filter } from "audio-kit";
import { useRef } from "react";
import { PlusIcon, TrashIcon } from "@/components/controls/icons";
import type { BuilderAction } from "../state";
import styles from "../styles.module.css";

const BIQUAD_TYPES: BiquadFilterType[] = [
  "lowpass",
  "highpass",
  "bandpass",
  "notch",
  "allpass",
  "peaking",
  "lowshelf",
  "highshelf",
];

type Props = {
  index: number;
  filters: Filter[];
  dispatch: React.Dispatch<BuilderAction>;
};

let nextFilterId = 0;

export function FilterEditor({ index, filters, dispatch }: Props) {
  const ids = useRef(new WeakMap<Filter, string>());

  function getKey(filter: Filter) {
    let id = ids.current.get(filter);
    if (!id) {
      id = `filter-${++nextFilterId}`;
      ids.current.set(filter, id);
    }
    return id;
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>Filters</span>
        <button
          type="button"
          className={styles.sectionAddBtn}
          onClick={() => dispatch({ type: "add-filter", index })}
        >
          <PlusIcon size={10} /> Add
        </button>
      </div>

      {filters.map((filter, fi) => (
        <FilterItem
          key={getKey(filter)}
          layerIndex={index}
          filterIndex={fi}
          filter={filter}
          dispatch={dispatch}
        />
      ))}
    </div>
  );
}

function FilterItem({
  layerIndex,
  filterIndex,
  filter,
  dispatch,
}: {
  layerIndex: number;
  filterIndex: number;
  filter: Filter;
  dispatch: React.Dispatch<BuilderAction>;
}) {
  if (filter.type === "iir") return null;

  const set = (next: Filter) =>
    dispatch({
      type: "update-filter",
      index: layerIndex,
      filterIndex,
      filter: next,
    });

  return (
    <div className={styles.inlineItem}>
      <div className={styles.inlineItemHeader}>
        <select
          className={styles.fieldSelect}
          value={filter.type}
          onChange={(e) =>
            set({ ...filter, type: e.target.value as BiquadFilterType })
          }
        >
          {BIQUAD_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={() =>
            dispatch({ type: "remove-filter", index: layerIndex, filterIndex })
          }
        >
          <TrashIcon size={12} />
        </button>
      </div>
      <div className={styles.inlineItemFields}>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Frequency</span>
          <input
            type="number"
            className={styles.fieldInput}
            value={filter.frequency}
            min={20}
            max={20000}
            onChange={(e) =>
              set({ ...filter, frequency: Number(e.target.value) })
            }
          />
        </div>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Q</span>
          <input
            type="number"
            className={styles.fieldInput}
            value={filter.resonance ?? 1}
            min={0.1}
            max={30}
            step={0.1}
            onChange={(e) =>
              set({ ...filter, resonance: Number(e.target.value) })
            }
          />
        </div>
        {(filter.type === "peaking" ||
          filter.type === "lowshelf" ||
          filter.type === "highshelf") && (
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Gain</span>
            <input
              type="number"
              className={styles.fieldInput}
              value={filter.gain ?? 0}
              min={-24}
              max={24}
              step={0.5}
              onChange={(e) => set({ ...filter, gain: Number(e.target.value) })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
