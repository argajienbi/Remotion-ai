/**
 * Remotion Mathematical Animation Engine
 * Emulates Remotion's frame-accurate interpolate() and spring() physics in pure TypeScript.
 */

export interface InterpolateOptions {
  extrapolateLeft?: 'clamp' | 'identity' | 'extend';
  extrapolateRight?: 'clamp' | 'identity' | 'extend';
  easing?: (t: number) => number;
}

export function interpolate(
  input: number,
  inputRange: [number, number],
  outputRange: [number, number],
  options: InterpolateOptions = {}
): number {
  const {
    extrapolateLeft = 'clamp',
    extrapolateRight = 'clamp',
    easing = (t) => t,
  } = options;

  const [inMin, inMax] = inputRange;
  const [outMin, outMax] = outputRange;

  if (inMin === inMax) return outMin;

  if (input < inMin) {
    if (extrapolateLeft === 'clamp') return outMin;
    if (extrapolateLeft === 'identity') return input;
  }

  if (input > inMax) {
    if (extrapolateRight === 'clamp') return outMax;
    if (extrapolateRight === 'identity') return input;
  }

  // Normalized progress 0 to 1
  const t = Math.max(0, Math.min(1, (input - inMin) / (inMax - inMin)));
  const eased = easing(t);

  return outMin + (outMax - outMin) * eased;
}

export interface SpringConfig {
  damping?: number;
  mass?: number;
  stiffness?: number;
  overshootClamping?: boolean;
}

export interface SpringParams {
  frame: number;
  fps: number;
  config?: SpringConfig;
  from?: number;
  to?: number;
}

/**
 * Analytical Damped Harmonic Oscillator (Remotion Spring)
 */
export function spring({
  frame,
  fps = 30,
  config = {},
  from = 0,
  to = 1,
}: SpringParams): number {
  if (frame <= 0) return from;

  const damping = config.damping ?? 10;
  const mass = config.mass ?? 1;
  const stiffness = config.stiffness ?? 100;
  const overshootClamping = config.overshootClamping ?? false;

  const t = frame / fps;
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));

  let position = 1;

  if (zeta < 1) {
    // Underdamped
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    const envelope = Math.exp(-zeta * w0 * t);
    position = 1 - envelope * (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t));
  } else if (zeta === 1) {
    // Critically damped
    const envelope = Math.exp(-w0 * t);
    position = 1 - envelope * (1 + w0 * t);
  } else {
    // Overdamped
    const s1 = -zeta * w0 + w0 * Math.sqrt(zeta * zeta - 1);
    const s2 = -zeta * w0 - w0 * Math.sqrt(zeta * zeta - 1);
    const c1 = -s2 / (s1 - s2);
    const c2 = s1 / (s1 - s2);
    position = 1 - (c1 * Math.exp(s1 * t) + c2 * Math.exp(s2 * t));
  }

  if (overshootClamping && position > 1) {
    position = 1;
  }

  return from + (to - from) * position;
}

export function frameToTimecode(frame: number, fps: number): string {
  const totalSeconds = frame / fps;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const currentFrameInSecond = Math.floor(frame % fps);

  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  const ff = String(currentFrameInSecond).padStart(2, '0');

  return `${mm}:${ss}.${ff}`;
}

export function framesToSeconds(frames: number, fps: number): string {
  return (frames / fps).toFixed(1) + 's';
}
