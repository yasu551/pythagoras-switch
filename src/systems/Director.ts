import RAPIER from '@dimforge/rapier3d-compat';
import { World } from '../world/World';
import { CourseBuilder } from '../course/CourseBuilder';
import { CameraDirector, type CameraKeyframe } from './CameraDirector';
import { SoundManager } from './SoundManager';
import { TweenManager } from './TweenManager';
import * as THREE from 'three';

interface TriggerDef {
  position: THREE.Vector3;
  size: THREE.Vector3;
  label: string;
  onEnter: () => void;
}

const WATCHDOG_TIMEOUT = 4.0; // seconds

export class Director {
  private world: World;
  private courseBuilder: CourseBuilder;
  private cameraDirector: CameraDirector;
  soundManager: SoundManager;
  tweenManager: TweenManager;

  private triggers: TriggerDef[] = [];
  private firedTriggers: Set<string> = new Set();
  private sensorBodies: RAPIER.RigidBody[] = [];
  private sensorColliders: RAPIER.Collider[] = [];
  private watchdogTime = 0;
  private watchdogPaused = false;
  private isFinished = false;
  private started = false;

  timeScale = 1.0;
  onFinale?: () => void;

  constructor(world: World, courseBuilder: CourseBuilder, cameraDirector: CameraDirector, soundManager: SoundManager) {
    this.world = world;
    this.courseBuilder = courseBuilder;
    this.cameraDirector = cameraDirector;
    this.soundManager = soundManager;
    this.tweenManager = new TweenManager();
  }

  setupTriggers(): void {
    this.triggers = [];
    this.sensorBodies = [];
    this.sensorColliders = [];

    // Stage triggers will be added by each stage builder
    // They call director.addTrigger(...)
  }

  addTrigger(position: THREE.Vector3, size: THREE.Vector3, label: string, onEnter: () => void): void {
    this.triggers.push({ position, size, label, onEnter });

    // Create Rapier sensor
    const bodyDesc = RAPIER.RigidBodyDesc.fixed()
      .setTranslation(position.x, position.y, position.z);
    const body = this.world.rapierWorld.createRigidBody(bodyDesc);

    const colliderDesc = RAPIER.ColliderDesc.cuboid(size.x / 2, size.y / 2, size.z / 2)
      .setSensor(true);
    const collider = this.world.rapierWorld.createCollider(colliderDesc, body);

    this.sensorBodies.push(body);
    this.sensorColliders.push(collider);
  }

  start(): void {
    this.started = true;
    this.isFinished = false;
    this.firedTriggers.clear();
    this.watchdogTime = 0;
    this.watchdogPaused = false;
    this.timeScale = 1.0;

    // Start with a wide establishing shot, then follow ball
    this.cameraDirector.transitionTo({
      position: new THREE.Vector3(-2, 13, 12),
      lookAt: new THREE.Vector3(5, 7, 0),
      duration: 1500,
      easing: 'easeOutCubic',
    });

    // After establishing shot, switch to ball follow
    this.tweenManager.add({
      from: 0, to: 1, duration: 1, delay: 2000,
      easing: 'linear', onUpdate: () => {},
      onComplete: () => {
        if (this.courseBuilder.ballMesh) {
          this.cameraDirector.startFollow(
            this.courseBuilder.ballMesh,
            new THREE.Vector3(3, 3, 8)
          );
        }
      },
    });
  }

  update(dt: number): void {
    if (!this.started || this.isFinished) return;

    this.tweenManager.update(dt);

    // Check sensor collisions
    this.checkTriggers();

    // Watchdog
    if (!this.watchdogPaused) {
      this.watchdogTime += dt;
      if (this.watchdogTime > WATCHDOG_TIMEOUT) {
        const ball = this.courseBuilder.ballBody;
        if (ball) {
          const vel = ball.linvel();
          const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z);
          if (speed < 0.05) {
            console.warn('[Director] Stall detected, resetting...');
            this.onFinale?.(); // treat as failure -> show replay
          }
        }
      }
    }
  }

  private checkTriggers(): void {
    const ball = this.courseBuilder.ballBody;
    if (!ball) return;

    const ballPos = ball.translation();

    for (let i = 0; i < this.triggers.length; i++) {
      const trigger = this.triggers[i];
      if (this.firedTriggers.has(trigger.label)) continue;

      const dx = Math.abs(ballPos.x - trigger.position.x);
      const dy = Math.abs(ballPos.y - trigger.position.y);
      const dz = Math.abs(ballPos.z - trigger.position.z);

      if (dx < trigger.size.x / 2 && dy < trigger.size.y / 2 && dz < trigger.size.z / 2) {
        this.firedTriggers.add(trigger.label);
        this.resetWatchdog();
        trigger.onEnter();
      }
    }
  }

  pauseWatchdog(): void {
    this.watchdogPaused = true;
  }

  resumeWatchdog(): void {
    this.watchdogPaused = false;
    this.watchdogTime = 0;
  }

  private resetWatchdog(): void {
    this.watchdogTime = 0;
  }

  setTimeScale(scale: number, duration: number): void {
    this.timeScale = scale;
    this.tweenManager.add({
      from: scale,
      to: 1.0,
      duration,
      easing: 'easeOutCubic',
      onUpdate: (v) => { this.timeScale = v; },
    });
  }

  triggerCamera(keyframe: CameraKeyframe): void {
    this.cameraDirector.transitionTo(keyframe);
  }

  triggerFinale(): void {
    this.isFinished = true;
    this.soundManager.playJingle();
    this.onFinale?.();
  }

  reset(): void {
    this.started = false;
    this.isFinished = false;
    this.firedTriggers.clear();
    this.timeScale = 1.0;
    this.tweenManager.clear();
    this.watchdogTime = 0;
    this.watchdogPaused = false;

    // Clean up sensor bodies
    for (const body of this.sensorBodies) {
      this.world.rapierWorld.removeRigidBody(body);
    }
    this.sensorBodies = [];
    this.sensorColliders = [];
    this.triggers = [];
  }
}
