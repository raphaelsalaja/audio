import { getDestination } from "./context";
import { render } from "./engine";
import type {
  PlayOptions,
  SequenceOptions,
  SequenceStep,
  SoundDefinition,
  VoiceHandle,
} from "./types";

function isDefinition(sound: SequenceStep["sound"]): sound is SoundDefinition {
  return typeof sound !== "function";
}

function resolveStepTimes(steps: SequenceStep[]): number[] {
  const times: number[] = [];
  let cursor = 0;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (step.at !== undefined) {
      cursor = step.at;
    } else if (step.wait !== undefined) {
      cursor += step.wait;
    } else if (i === 0) {
      cursor = 0;
    }
    times.push(cursor);
  }

  return times;
}

const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD = 0.1;

function scheduleOnce(
  ctx: AudioContext,
  steps: SequenceStep[],
  times: number[],
  opts: PlayOptions | undefined,
  baseTime: number,
  scheduled: Set<number>,
): VoiceHandle[] {
  const handles: VoiceHandle[] = [];

  for (let i = 0; i < steps.length; i++) {
    if (scheduled.has(i)) continue;

    const stepTime = baseTime + times[i];
    if (stepTime > ctx.currentTime + SCHEDULE_AHEAD) continue;

    scheduled.add(i);
    const step = steps[i];
    const volume = step.volume ?? opts?.volume;

    if (isDefinition(step.sound)) {
      const handle = render(
        ctx,
        step.sound,
        volume !== undefined ? { volume } : opts,
        stepTime,
        getDestination(),
      );
      handles.push(handle);
    } else {
      const fn = step.sound;
      const delay = (stepTime - ctx.currentTime) * 1000;
      if (delay <= 0) {
        const result = fn(volume !== undefined ? { volume } : opts);
        if (result) handles.push(result);
      } else {
        setTimeout(() => fn(volume !== undefined ? { volume } : opts), delay);
      }
    }
  }

  return handles;
}

/**
 * Schedules and plays a sequence of sounds using a lookahead timer.
 *
 * Steps are positioned in time via `at` (absolute) or `wait` (relative)
 * fields. When `options.loop` is true the sequence repeats indefinitely
 * using `options.duration` as the loop length.
 *
 * @param ctx - The real-time `AudioContext`
 * @param steps - Ordered list of {@link SequenceStep}s
 * @param options - Loop and duration settings
 * @param opts - Runtime overrides applied to every step
 * @returns A stop function that halts playback, or `undefined` if empty
 */
export function playSequence(
  ctx: AudioContext,
  steps: SequenceStep[],
  options?: SequenceOptions,
  opts?: PlayOptions,
): (() => void) | undefined {
  const times = resolveStepTimes(steps);

  if (!options?.loop) {
    const scheduled = new Set<number>();
    const handles: VoiceHandle[] = [];

    const tick = () => {
      const h = scheduleOnce(
        ctx,
        steps,
        times,
        opts,
        ctx.currentTime,
        scheduled,
      );
      handles.push(...h);
      if (scheduled.size < steps.length) {
        timerId = setTimeout(tick, LOOKAHEAD_MS);
      }
    };

    let timerId: ReturnType<typeof setTimeout> | null = null;
    tick();

    return () => {
      if (timerId !== null) clearTimeout(timerId);
      for (const h of handles) h.stop();
    };
  }

  const duration = options.duration ?? 1;
  let stopped = false;
  let timerId: ReturnType<typeof setInterval> | null = null;
  let loopBase = ctx.currentTime;
  let scheduled = new Set<number>();
  const handles: VoiceHandle[] = [];

  const tick = () => {
    if (stopped) return;

    const h = scheduleOnce(ctx, steps, times, opts, loopBase, scheduled);
    handles.push(...h);

    if (scheduled.size >= steps.length) {
      if (ctx.currentTime >= loopBase + duration - SCHEDULE_AHEAD) {
        loopBase += duration;
        scheduled = new Set<number>();
      }
    }
  };

  timerId = setInterval(tick, LOOKAHEAD_MS);
  tick();

  return () => {
    stopped = true;
    if (timerId !== null) clearInterval(timerId);
    for (const h of handles) h.stop();
  };
}
