import Phaser from 'phaser';
import { DIRECTOR_SCRIPT, type DirectorEvent } from '../config/director-script';
import { SoundManager } from './SoundManager';

const WATCHDOG_TIMEOUT = 5000; // ms before auto-reset

export class Director {
  private scene: Phaser.Scene;
  private soundManager: SoundManager;
  private eventMap: Map<string, DirectorEvent>;
  private firedTriggers: Set<string> = new Set();
  private firstTriggerFired = false;
  private watchdogTimer: Phaser.Time.TimerEvent | null = null;
  private isFinished = false;
  onFinish?: () => void;
  onReset?: () => void;

  constructor(scene: Phaser.Scene, soundManager: SoundManager) {
    this.scene = scene;
    this.soundManager = soundManager;

    this.eventMap = new Map();
    for (const event of DIRECTOR_SCRIPT) {
      this.eventMap.set(event.label, event);
    }
  }

  start(): void {
    this.firedTriggers.clear();
    this.firstTriggerFired = false;
    this.isFinished = false;

    // Listen for collision events with trigger sensors
    this.scene.matter.world.on('collisionstart', this.handleCollision, this);
  }

  stop(): void {
    this.scene.matter.world.off('collisionstart', this.handleCollision, this);
    this.clearWatchdog();
  }

  private handleCollision = (_event: Phaser.Physics.Matter.Events.CollisionStartEvent, bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType): void => {
    if (this.isFinished) return;

    // Check if either body is a trigger sensor
    const triggerLabel = this.getTriggerLabel(bodyA, bodyB);
    if (!triggerLabel) return;

    // Don't fire the same trigger twice
    if (this.firedTriggers.has(triggerLabel)) return;
    this.firedTriggers.add(triggerLabel);

    const event = this.eventMap.get(triggerLabel);
    if (!event) return;

    this.firstTriggerFired = true;
    this.resetWatchdog();

    this.executeEvent(event);

    // Check if this is the last trigger (bucket = finale)
    if (triggerLabel === 'trigger-bucket') {
      this.triggerFinale();
    }
  };

  private getTriggerLabel(bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType): string | null {
    if (bodyA.label?.startsWith('trigger-')) return bodyA.label;
    if (bodyB.label?.startsWith('trigger-')) return bodyB.label;
    return null;
  }

  private executeEvent(event: DirectorEvent): void {
    const camera = this.scene.cameras.main;

    // Camera movement — stop follow mode, Director takes control
    if (event.camera) {
      camera.stopFollow();
      if (event.camera.panTo) {
        camera.pan(
          event.camera.panTo.x,
          event.camera.panTo.y,
          event.camera.duration,
          'Sine.easeInOut'
        );
      }
      if (event.camera.zoom != null) {
        camera.zoomTo(event.camera.zoom, event.camera.duration, 'Sine.easeInOut');
      }
      if (event.camera.shake) {
        camera.shake(300, event.camera.shake);
      }
    }

    // Sound
    if (event.sound) {
      this.soundManager.playHit(event.sound.play, event.sound.note);
    }

    // Time scaling (slow-mo)
    if (event.timeScale) {
      const engine = (this.scene.matter.world as any).engine as MatterJS.Engine;
      engine.timing.timeScale = event.timeScale.value;

      this.scene.time.delayedCall(event.timeScale.duration, () => {
        engine.timing.timeScale = 1;
      });
    }
  }

  private triggerFinale(): void {
    this.isFinished = true;
    this.clearWatchdog();

    // Delay slightly for the slow-mo to play out
    this.scene.time.delayedCall(2500, () => {
      this.onFinish?.();
    });
  }

  private resetWatchdog(): void {
    this.clearWatchdog();

    this.watchdogTimer = this.scene.time.delayedCall(WATCHDOG_TIMEOUT, () => {
      if (!this.isFinished) {
        console.warn('[Director] Chain stalled, auto-resetting...');
        this.stop();
        this.onReset?.();
      }
    });
  }

  private clearWatchdog(): void {
    if (this.watchdogTimer) {
      this.watchdogTimer.destroy();
      this.watchdogTimer = null;
    }
  }

  reset(): void {
    this.stop();
    this.firedTriggers.clear();
    this.firstTriggerFired = false;
    this.isFinished = false;
    this.clearWatchdog();
  }
}
