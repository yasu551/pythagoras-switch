import * as THREE from 'three';
import { CourseBuilder } from '../CourseBuilder';
import { S1_RAMP_CENTER, S1_RAMP_ANGLE, S1_BALL_START, C12_CENTER, C12_ANGLE, C12_LENGTH } from '../StageDefinitions';

export function buildStage1(cb: CourseBuilder): void {
  cb.addRamp(S1_RAMP_CENTER, 5, S1_RAMP_ANGLE, cb.world.materials.wood);
  cb.addRamp(C12_CENTER, C12_LENGTH, C12_ANGLE, cb.world.materials.wood);

  // Camera: wide establishing shot, then follow ball
  cb.director.addTrigger(
    new THREE.Vector3(3, 8.5, 0),
    new THREE.Vector3(2, 2, 2),
    'stage1-roll',
    () => {
      cb.director.soundManager.playSFX('roll');
      cb.director.soundManager.playNote('G4', 0.4);
      cb.director.triggerCamera({
        position: new THREE.Vector3(2, 11, 10),
        lookAt: new THREE.Vector3(3, 8, 0),
        duration: 1200,
        easing: 'easeInOutCubic',
      });
    }
  );
}
