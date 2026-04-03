import * as THREE from 'three';
import { TweenManager, type EasingName } from './TweenManager';

export interface CameraKeyframe {
  position: THREE.Vector3;
  lookAt: THREE.Vector3;
  fov?: number;
  duration: number;
  easing: EasingName;
  timeScale?: number;
}

export class CameraDirector {
  private camera: THREE.PerspectiveCamera;
  private tweenManager: TweenManager;
  private targetLookAt = new THREE.Vector3();
  private currentLookAt = new THREE.Vector3();
  private isTransitioning = false;

  // Track the ball for follow mode
  followTarget: THREE.Object3D | null = null;
  followOffset = new THREE.Vector3(3, 4, 8);
  followLerp = 0.03;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.tweenManager = new TweenManager();
    this.currentLookAt.copy(camera.position).add(new THREE.Vector3(0, 0, -1));
  }

  transitionTo(keyframe: CameraKeyframe): void {
    this.isTransitioning = true;
    this.followTarget = null;

    const startPos = this.camera.position.clone();
    const startLookAt = this.currentLookAt.clone();
    const startFov = this.camera.fov;
    const endFov = keyframe.fov ?? this.camera.fov;

    this.targetLookAt.copy(keyframe.lookAt);

    this.tweenManager.add({
      from: 0,
      to: 1,
      duration: keyframe.duration,
      easing: keyframe.easing,
      onUpdate: (t) => {
        this.camera.position.lerpVectors(startPos, keyframe.position, t);
        this.currentLookAt.lerpVectors(startLookAt, keyframe.lookAt, t);
        this.camera.lookAt(this.currentLookAt);

        if (endFov !== startFov) {
          this.camera.fov = startFov + (endFov - startFov) * t;
          this.camera.updateProjectionMatrix();
        }
      },
      onComplete: () => {
        this.isTransitioning = false;
      },
    });
  }

  startFollow(target: THREE.Object3D, offset?: THREE.Vector3): void {
    this.followTarget = target;
    if (offset) this.followOffset.copy(offset);
    this.isTransitioning = false;
  }

  update(dt: number): void {
    this.tweenManager.update(dt);

    if (!this.isTransitioning && this.followTarget) {
      const targetPos = this.followTarget.position.clone().add(this.followOffset);
      this.camera.position.lerp(targetPos, this.followLerp);
      this.currentLookAt.lerp(this.followTarget.position, this.followLerp);
      this.camera.lookAt(this.currentLookAt);
    }
  }

  reset(): void {
    this.tweenManager.clear();
    this.followTarget = null;
    this.isTransitioning = false;
    this.camera.position.set(0, 8, 20);
    this.camera.fov = 50;
    this.camera.updateProjectionMatrix();
    this.currentLookAt.set(0, 2, 0);
    this.camera.lookAt(this.currentLookAt);
  }
}
