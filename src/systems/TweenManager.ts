export type EasingName = 'linear' | 'easeInQuad' | 'easeOutQuad' | 'easeInOutQuad'
  | 'easeInCubic' | 'easeOutCubic' | 'easeInOutCubic'
  | 'easeInOutSine' | 'easeOutExpo';

const EASING_FNS: Record<EasingName, (t: number) => number> = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => (--t) * t * t + 1,
  easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
  easeOutExpo: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
};

interface TweenConfig {
  from: number;
  to: number;
  duration: number;
  easing: EasingName;
  onUpdate: (value: number) => void;
  onComplete?: () => void;
  delay?: number;
}

interface ActiveTween {
  config: TweenConfig;
  elapsed: number;
  started: boolean;
}

export class TweenManager {
  private tweens: ActiveTween[] = [];

  add(config: TweenConfig): void {
    this.tweens.push({
      config,
      elapsed: -(config.delay ?? 0),
      started: false,
    });
  }

  update(dt: number): void {
    for (let i = this.tweens.length - 1; i >= 0; i--) {
      const tween = this.tweens[i];
      tween.elapsed += dt * 1000; // convert to ms

      if (tween.elapsed < 0) continue; // still in delay

      if (!tween.started) {
        tween.started = true;
      }

      const progress = Math.min(tween.elapsed / tween.config.duration, 1);
      const easedProgress = EASING_FNS[tween.config.easing](progress);
      const value = tween.config.from + (tween.config.to - tween.config.from) * easedProgress;
      tween.config.onUpdate(value);

      if (progress >= 1) {
        tween.config.onComplete?.();
        this.tweens.splice(i, 1);
      }
    }
  }

  clear(): void {
    this.tweens = [];
  }
}
