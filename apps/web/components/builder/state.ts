import type {
  Effect,
  Envelope,
  Filter,
  Layer,
  LFO,
  Panner3D,
  SoundDefinition,
  Source,
} from "audio-kit";

// ---------------------------------------------------------------------------
// Builder state: always normalized to multi-layer form
// ---------------------------------------------------------------------------

export type BuilderLayer = Layer & { _id: number };

export type BuilderState = {
  layers: BuilderLayer[];
  effects: Effect[];
  _nextId: number;
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type BuilderAction =
  | { type: "add-layer" }
  | { type: "remove-layer"; index: number }
  | { type: "duplicate-layer"; index: number }
  | { type: "set-source"; index: number; source: Source }
  | { type: "set-envelope"; index: number; envelope: Envelope | undefined }
  | { type: "set-gain"; index: number; gain: number }
  | { type: "set-pan"; index: number; pan: number }
  | { type: "set-delay"; index: number; delay: number }
  | { type: "add-filter"; index: number }
  | { type: "remove-filter"; index: number; filterIndex: number }
  | {
      type: "update-filter";
      index: number;
      filterIndex: number;
      filter: Filter;
    }
  | { type: "add-effect"; index: number }
  | { type: "remove-effect"; index: number; effectIndex: number }
  | {
      type: "update-effect";
      index: number;
      effectIndex: number;
      effect: Effect;
    }
  | { type: "add-lfo"; index: number }
  | { type: "remove-lfo"; index: number; lfoIndex: number }
  | { type: "update-lfo"; index: number; lfoIndex: number; lfo: LFO }
  | { type: "set-panner"; index: number; panner: Panner3D | undefined }
  | { type: "add-master-effect" }
  | { type: "remove-master-effect"; effectIndex: number }
  | { type: "update-master-effect"; effectIndex: number; effect: Effect };

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

export const INITIAL_STATE: BuilderState = {
  layers: [
    {
      _id: 0,
      source: { type: "sine", frequency: 440 },
      envelope: { decay: 0.3 },
      gain: 0.3,
    },
  ],
  effects: [],
  _nextId: 1,
};

// ---------------------------------------------------------------------------
// Defaults for new items
// ---------------------------------------------------------------------------

function defaultLayer(id: number): BuilderLayer {
  return {
    _id: id,
    source: { type: "sine", frequency: 440 },
    envelope: { decay: 0.3 },
    gain: 0.3,
  };
}

function defaultFilter(): Filter {
  return { type: "lowpass", frequency: 1000 };
}

function defaultEffect(): Effect {
  return { type: "reverb", decay: 0.8, mix: 0.3 };
}

function defaultLFO(): LFO {
  return { type: "sine", frequency: 4, depth: 100, target: "filter.frequency" };
}

// ---------------------------------------------------------------------------
// Helpers to normalize arrays in layers (filter, lfo can be single or array)
// ---------------------------------------------------------------------------

function filtersArray(layer: Layer): Filter[] {
  if (!layer.filter) return [];
  return Array.isArray(layer.filter) ? [...layer.filter] : [layer.filter];
}

function lfosArray(layer: Layer): LFO[] {
  if (!layer.lfo) return [];
  return Array.isArray(layer.lfo) ? [...layer.lfo] : [layer.lfo];
}

function collapseArray<T>(arr: T[]): T | T[] | undefined {
  if (arr.length === 0) return undefined;
  if (arr.length === 1) return arr[0];
  return arr;
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function updateLayer(
  state: BuilderState,
  index: number,
  patch: Partial<BuilderLayer>,
): BuilderState {
  const layers = state.layers.map((l, i) =>
    i === index ? { ...l, ...patch } : l,
  );
  return { ...state, layers };
}

export function builderReducer(
  state: BuilderState,
  action: BuilderAction,
): BuilderState {
  switch (action.type) {
    case "add-layer":
      return {
        ...state,
        layers: [...state.layers, defaultLayer(state._nextId)],
        _nextId: state._nextId + 1,
      };

    case "remove-layer": {
      if (state.layers.length <= 1) return state;
      return {
        ...state,
        layers: state.layers.filter((_, i) => i !== action.index),
      };
    }

    case "duplicate-layer": {
      const clone = structuredClone(state.layers[action.index]);
      clone._id = state._nextId;
      const layers = [...state.layers];
      layers.splice(action.index + 1, 0, clone);
      return { ...state, layers, _nextId: state._nextId + 1 };
    }

    case "set-source":
      return updateLayer(state, action.index, { source: action.source });

    case "set-envelope":
      return updateLayer(state, action.index, { envelope: action.envelope });

    case "set-gain":
      return updateLayer(state, action.index, { gain: action.gain });

    case "set-pan":
      return updateLayer(state, action.index, { pan: action.pan });

    case "set-delay":
      return updateLayer(state, action.index, { delay: action.delay });

    case "add-filter": {
      const filters = filtersArray(state.layers[action.index]);
      filters.push(defaultFilter());
      return updateLayer(state, action.index, {
        filter: collapseArray(filters) as Layer["filter"],
      });
    }

    case "remove-filter": {
      const filters = filtersArray(state.layers[action.index]);
      filters.splice(action.filterIndex, 1);
      return updateLayer(state, action.index, {
        filter: collapseArray(filters) as Layer["filter"],
      });
    }

    case "update-filter": {
      const filters = filtersArray(state.layers[action.index]);
      filters[action.filterIndex] = action.filter;
      return updateLayer(state, action.index, {
        filter: collapseArray(filters) as Layer["filter"],
      });
    }

    case "add-effect": {
      const effects = [...(state.layers[action.index].effects ?? [])];
      effects.push(defaultEffect());
      return updateLayer(state, action.index, { effects });
    }

    case "remove-effect": {
      const effects = [...(state.layers[action.index].effects ?? [])];
      effects.splice(action.effectIndex, 1);
      return updateLayer(state, action.index, {
        effects: effects.length ? effects : undefined,
      });
    }

    case "update-effect": {
      const effects = [...(state.layers[action.index].effects ?? [])];
      effects[action.effectIndex] = action.effect;
      return updateLayer(state, action.index, { effects });
    }

    case "add-lfo": {
      const lfos = lfosArray(state.layers[action.index]);
      lfos.push(defaultLFO());
      return updateLayer(state, action.index, {
        lfo: collapseArray(lfos) as Layer["lfo"],
      });
    }

    case "remove-lfo": {
      const lfos = lfosArray(state.layers[action.index]);
      lfos.splice(action.lfoIndex, 1);
      return updateLayer(state, action.index, {
        lfo: collapseArray(lfos) as Layer["lfo"],
      });
    }

    case "update-lfo": {
      const lfos = lfosArray(state.layers[action.index]);
      lfos[action.lfoIndex] = action.lfo;
      return updateLayer(state, action.index, {
        lfo: collapseArray(lfos) as Layer["lfo"],
      });
    }

    case "set-panner":
      return updateLayer(state, action.index, { panner: action.panner });

    case "add-master-effect":
      return { ...state, effects: [...state.effects, defaultEffect()] };

    case "remove-master-effect": {
      const effects = state.effects.filter((_, i) => i !== action.effectIndex);
      return { ...state, effects };
    }

    case "update-master-effect": {
      const effects = state.effects.map((e, i) =>
        i === action.effectIndex ? action.effect : e,
      );
      return { ...state, effects };
    }

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Convert builder state → SoundDefinition for playback
// ---------------------------------------------------------------------------

export function toDefinition(state: BuilderState): SoundDefinition {
  if (state.layers.length === 1 && state.effects.length === 0) {
    return cleanLayer(state.layers[0]);
  }
  const def: { layers: Layer[]; effects?: Effect[] } = {
    layers: state.layers.map(cleanLayer),
  };
  if (state.effects.length > 0) def.effects = state.effects;
  return def as SoundDefinition;
}

function cleanLayer(layer: BuilderLayer): Layer {
  const out: Layer = { source: layer.source };
  if (layer.filter) out.filter = layer.filter;
  if (layer.envelope) out.envelope = layer.envelope;
  if (layer.gain !== undefined && layer.gain !== 1) out.gain = layer.gain;
  if (layer.pan !== undefined && layer.pan !== 0) out.pan = layer.pan;
  if (layer.delay !== undefined && layer.delay !== 0) out.delay = layer.delay;
  if (layer.lfo) out.lfo = layer.lfo;
  if (layer.effects && layer.effects.length > 0) out.effects = layer.effects;
  if (layer.panner) out.panner = layer.panner;
  return out;
}

// ---------------------------------------------------------------------------
// Serialize builder state → formatted TypeScript code string
// ---------------------------------------------------------------------------

export function serializeToCode(state: BuilderState): string {
  const def = toDefinition(state);
  const json = prettyPrint(def, 1);
  return `import { defineSound } from "audio-kit";\n\nconst play = defineSound(${json});\n\nplay();`;
}

function prettyPrint(value: unknown, depth: number): string {
  if (value === null || value === undefined) return "undefined";
  if (typeof value === "number") return numStr(value);
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "boolean") return String(value);

  const indent = "  ".repeat(depth);
  const outer = "  ".repeat(depth - 1);

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    const items = value.map((v) => `${indent}${prettyPrint(v, depth + 1)}`);
    return `[\n${items.join(",\n")},\n${outer}]`;
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const entries = Object.entries(obj).filter(
      ([, v]) => v !== undefined && v !== null,
    );
    if (entries.length === 0) return "{}";

    const isSmall =
      entries.length <= 3 && entries.every(([, v]) => typeof v !== "object");
    if (isSmall) {
      const items = entries.map(
        ([k, v]) => `${k}: ${prettyPrint(v, depth + 1)}`,
      );
      return `{ ${items.join(", ")} }`;
    }

    const items = entries.map(
      ([k, v]) => `${indent}${k}: ${prettyPrint(v, depth + 1)}`,
    );
    return `{\n${items.join(",\n")},\n${outer}}`;
  }

  return String(value);
}

function numStr(n: number): string {
  if (Number.isInteger(n)) return String(n);
  const s = String(n);
  if (s.length > 6) return n.toPrecision(4);
  return s;
}
