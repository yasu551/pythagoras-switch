import * as THREE from 'three';
import { CourseBuilder } from '../CourseBuilder';
import { S3_LANDING_POS } from '../StageDefinitions';

export function buildStage3(cb: CourseBuilder): void {
  // Connecting ramp from C23 exit (~10.2, 1.8) to landing (~12.5, 0.5)
  // This is a downhill ramp bridging the height gap
  cb.addRamp(
    new THREE.Vector3(11.3, 1.1, 0),  // midpoint between C23 exit and landing
    3,  // length
    -25,  // steep downhill
    cb.world.materials.wood
  );

  // Landing platform — tilted slightly downhill to feed into domino section
  const platSize = new THREE.Vector3(4, 0.15, 1.2);
  const platRot = new THREE.Euler(0, 0, THREE.MathUtils.degToRad(-4));
  cb.addStaticBox(S3_LANDING_POS, platSize, cb.world.materials.wood, platRot, 0.3);

  // Side walls
  const wallH = 0.4;
  const wallSize = new THREE.Vector3(4, wallH, 0.08);
  cb.addStaticBox(
    new THREE.Vector3(S3_LANDING_POS.x, S3_LANDING_POS.y + wallH / 2 + 0.1, 0.65),
    wallSize, cb.world.materials.wood
  );
  cb.addStaticBox(
    new THREE.Vector3(S3_LANDING_POS.x, S3_LANDING_POS.y + wallH / 2 + 0.1, -0.65),
    wallSize, cb.world.materials.wood
  );

  // Trigger
  cb.director.addTrigger(
    new THREE.Vector3(S3_LANDING_POS.x, S3_LANDING_POS.y + 0.5, 0),
    new THREE.Vector3(3, 2, 2),
    'stage3-jump',
    () => {
      cb.director.soundManager.playSFX('roll');
      cb.director.soundManager.playNote('B4', 0.4);
      // Camera: side tracking shot
      cb.director.triggerCamera({
        position: new THREE.Vector3(S3_LANDING_POS.x, 3, 6),
        lookAt: new THREE.Vector3(S3_LANDING_POS.x, 1, 0),
        duration: 800,
        easing: 'easeInOutCubic',
      });
    }
  );
}
