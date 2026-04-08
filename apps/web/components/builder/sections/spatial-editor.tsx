import type { Panner3D } from "audio-kit";
import type { BuilderAction } from "../state";
import styles from "../styles.module.css";

const DISTANCE_MODELS = ["linear", "inverse", "exponential"] as const;
const PANNING_MODELS = ["equalpower", "HRTF"] as const;

type Props = {
  index: number;
  panner: Panner3D | undefined;
  dispatch: React.Dispatch<BuilderAction>;
};

export function SpatialEditor({ index, panner, dispatch }: Props) {
  const enabled = !!panner;

  const set = (next: Panner3D | undefined) =>
    dispatch({ type: "set-panner", index, panner: next });

  const toggle = () => {
    if (enabled) {
      set(undefined);
    } else {
      set({ positionX: 0, positionY: 0, positionZ: 0 });
    }
  };

  const update = (patch: Partial<Panner3D>) => {
    if (!panner) return;
    set({ ...panner, ...patch });
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>Spatial (3D)</span>
        <button type="button" className={styles.sectionAddBtn} onClick={toggle}>
          {enabled ? "Remove" : "Enable"}
        </button>
      </div>

      {panner && (
        <div className={styles.inlineItem}>
          <div className={styles.inlineItemFields}>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Position</span>
              <div className={styles.fieldRow}>
                {(["positionX", "positionY", "positionZ"] as const).map(
                  (axis) => (
                    <div key={axis} className={styles.fieldRowItem}>
                      <span className={styles.fieldRowLabel}>
                        {axis.slice(-1)}
                      </span>
                      <input
                        type="number"
                        className={styles.fieldInput}
                        value={panner[axis]}
                        step={0.5}
                        onChange={(e) =>
                          update({ [axis]: Number(e.target.value) })
                        }
                      />
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>Panning</span>
              <select
                className={styles.fieldSelect}
                value={panner.panningModel ?? "equalpower"}
                onChange={(e) =>
                  update({
                    panningModel: e.target.value as Panner3D["panningModel"],
                  })
                }
              >
                {PANNING_MODELS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>Distance</span>
              <select
                className={styles.fieldSelect}
                value={panner.distanceModel ?? "inverse"}
                onChange={(e) =>
                  update({
                    distanceModel: e.target.value as Panner3D["distanceModel"],
                  })
                }
              >
                {DISTANCE_MODELS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>Ref dist</span>
              <input
                type="number"
                className={styles.fieldInput}
                value={panner.refDistance ?? 1}
                min={0}
                step={0.5}
                onChange={(e) =>
                  update({ refDistance: Number(e.target.value) })
                }
              />
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>Max dist</span>
              <input
                type="number"
                className={styles.fieldInput}
                value={panner.maxDistance ?? 10000}
                min={0}
                onChange={(e) =>
                  update({ maxDistance: Number(e.target.value) })
                }
              />
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>Rolloff</span>
              <input
                type="number"
                className={styles.fieldInput}
                value={panner.rolloffFactor ?? 1}
                min={0}
                max={10}
                step={0.1}
                onChange={(e) =>
                  update({ rolloffFactor: Number(e.target.value) })
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
