import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { CourseBuilder } from '../CourseBuilder';
import {
  S5_PLATE_POS, S5_DROP_Y,
  S5_LOWER_RAMP_CENTER, S5_LOWER_RAMP_ANGLE, S5_LOWER_RAMP_LENGTH,
} from '../StageDefinitions';

export function buildStage5(cb: CourseBuilder): void {
  // Dead-end metal plate (the ball stops here)
  const plateSize = new THREE.Vector3(1.8, 0.12, 1.2);
  const { mesh: plateMesh, body: plateBody } = cb.addStaticBox(
    S5_PLATE_POS, plateSize, cb.world.materials.steel, undefined, 0.8
  );

  // Wall blocking further progress (visual dead end)
  const wallSize = new THREE.Vector3(0.2, 2, 1.2);
  cb.addStaticBox(
    new THREE.Vector3(S5_PLATE_POS.x + 1.1, S5_PLATE_POS.y + 1, 0),
    wallSize, cb.world.materials.steel
  );

  // Lower level: ramp that catches ball after the drop
  cb.addRamp(S5_LOWER_RAMP_CENTER, S5_LOWER_RAMP_LENGTH, S5_LOWER_RAMP_ANGLE, cb.world.materials.wood);

  // Trigger: ball reaches dead end
  cb.director.addTrigger(
    new THREE.Vector3(S5_PLATE_POS.x, S5_PLATE_POS.y + 0.5, 0),
    new THREE.Vector3(1.5, 1.5, 2),
    'stage5-surprise',
    () => {
      cb.director.pauseWatchdog();
      cb.director.soundManager.playNote('E5', 0.4);

      // Camera: close-up on the ball hitting the dead end
      cb.director.triggerCamera({
        position: new THREE.Vector3(S5_PLATE_POS.x - 1, 1.5, 3),
        lookAt: S5_PLATE_POS.clone(),
        duration: 500,
        easing: 'easeOutCubic',
      });

      // Dramatic pause (1.5 seconds)
      cb.director.tweenManager.add({
        from: 0, to: 1, duration: 1, delay: 1500,
        easing: 'linear', onUpdate: () => {},
        onComplete: () => {
          cb.director.soundManager.playSFX('mechanical');
          performDrop(cb, plateMesh, plateBody);
        },
      });
    }
  );
}

function performDrop(cb: CourseBuilder, plateMesh: THREE.Mesh, plateBody: RAPIER.RigidBody): void {
  const ball = cb.ballBody!;
  const ballMesh = cb.ballMesh!;

  // Animate plate dropping away
  cb.director.tweenManager.add({
    from: S5_PLATE_POS.y, to: S5_PLATE_POS.y - 5,
    duration: 500, easing: 'easeInCubic',
    onUpdate: (y) => {
      plateMesh.position.y = y;
      plateBody.setTranslation({ x: S5_PLATE_POS.x, y, z: 0 }, true);
    },
  });

  // Switch ball to kinematic and tween it down to the lower ramp
  ball.setBodyType(RAPIER.RigidBodyType.KinematicPositionBased, true);

  const startX = S5_PLATE_POS.x;
  const startY = S5_PLATE_POS.y + 0.3;  // ball center
  const endX = S5_LOWER_RAMP_CENTER.x - S5_LOWER_RAMP_LENGTH / 2 + 0.5;  // left end of lower ramp
  const endY = S5_DROP_Y + 0.5;  // above lower ramp surface

  // Drop animation: delay slightly, then fall
  cb.director.tweenManager.add({
    from: 0, to: 1,
    duration: 1000,
    delay: 300,
    easing: 'easeInCubic',
    onUpdate: (t) => {
      const x = startX + (endX - startX) * t;
      const y = startY + (endY - startY) * t;
      ball.setTranslation({ x, y, z: 0 }, true);
      ballMesh.position.set(x, y, 0);
    },
    onComplete: () => {
      // Keep kinematic — continue scripted path through Stages 6-8
      // Import the scripted continuation dynamically
      import('./Stage6_Elevator').then(m => m.performScriptedContinuation(cb));
    },
  });
}
