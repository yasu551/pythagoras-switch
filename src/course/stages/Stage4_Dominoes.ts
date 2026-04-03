import * as THREE from 'three';
import { CourseBuilder } from '../CourseBuilder';
import {
  S4_START_X, S4_Y, S4_Z, S4_COUNT, S4_SPACING,
  S5_PLATE_POS,
} from '../StageDefinitions';

export function buildStage4(cb: CourseBuilder): void {
  // ONE continuous downhill ramp from jump landing to Stage 5 dead end.
  // No gaps, no separate connectors. Ball rolls on this surface the whole way.
  const startX = S4_START_X - 1;
  const endX = S5_PLATE_POS.x;
  const totalLen = endX - startX;
  const centerX = (startX + endX) / 2;
  const startY = S4_Y;
  const endY = S5_PLATE_POS.y + 0.15; // slightly above the dead end plate
  const centerY = (startY + endY) / 2;

  // Calculate the angle for a straight downhill slope
  const angleDeg = -Math.atan2(startY - endY, totalLen) * (180 / Math.PI);

  // Main ramp surface
  const rampSize = new THREE.Vector3(totalLen, 0.15, 1.2);
  const rampRot = new THREE.Euler(0, 0, THREE.MathUtils.degToRad(angleDeg));
  cb.addStaticBox(
    new THREE.Vector3(centerX, centerY, S4_Z),
    rampSize, cb.world.materials.wood, rampRot, 0.3
  );

  // Side walls (full length, not tilted — just vertical containment)
  const wallH = 0.5;
  const wallSize = new THREE.Vector3(totalLen, wallH, 0.08);
  cb.addStaticBox(
    new THREE.Vector3(centerX, centerY + wallH / 2 + 0.1, S4_Z + 0.65),
    wallSize, cb.world.materials.wood
  );
  cb.addStaticBox(
    new THREE.Vector3(centerX, centerY + wallH / 2 + 0.1, S4_Z - 0.65),
    wallSize, cb.world.materials.wood
  );

  // Dominoes placed along the ramp
  const dominoSize = new THREE.Vector3(0.12, 0.5, 0.3);
  for (let i = 0; i < S4_COUNT; i++) {
    const t = (i + 0.5) / S4_COUNT;  // distribute evenly across first half
    const x = startX + 1 + t * (totalLen * 0.4);  // first 40% of ramp
    // Calculate Y on the ramp surface at this X position
    const frac = (x - startX) / totalLen;
    const y = startY + (endY - startY) * frac + 0.35;  // above ramp surface

    cb.addDynamicBox(
      new THREE.Vector3(x, y, S4_Z),
      dominoSize,
      cb.world.materials.darkWood,
      0.03,  // ultra-light
      0.3,
      0.01,
    );
  }

  // Trigger at first domino
  cb.director.addTrigger(
    new THREE.Vector3(startX + 1, S4_Y + 0.3, S4_Z),
    new THREE.Vector3(1.5, 1.5, 2),
    'stage4-dominoes',
    () => {
      cb.director.setTimeScale(0.5, 1500);
      cb.director.soundManager.playSFX('click');
      cb.director.soundManager.playNote('D5', 0.4);
      // Camera: tracking shot along domino line
      const platX = S4_START_X + (S4_COUNT * S4_SPACING) / 2;
      cb.director.triggerCamera({
        position: new THREE.Vector3(platX + 2, 2.5, 4),
        lookAt: new THREE.Vector3(platX, S4_Y, S4_Z),
        duration: 800,
        easing: 'easeInOutCubic',
      });
    }
  );
}
