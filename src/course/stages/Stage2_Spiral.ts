import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { CourseBuilder } from '../CourseBuilder';
import { generateHelixPoints, createTubeFromPoints } from '../../utils/geometry';
import {
  S2_CENTER_X, S2_CENTER_Z, S2_TOP_Y, S2_BOTTOM_Y,
  S2_RADIUS, S2_TURNS, S2_SEGMENTS,
  C23_CENTER, C23_ANGLE, C23_LENGTH,
} from '../StageDefinitions';

export function buildStage2(cb: CourseBuilder): void {
  const points = generateHelixPoints(
    S2_CENTER_X, S2_CENTER_Z,
    S2_TOP_Y, S2_BOTTOM_Y,
    S2_RADIUS, S2_TURNS, S2_SEGMENTS
  );

  // Visual: tube rail along helix path
  const railGeo = createTubeFromPoints(points, 0.08, 8);
  const railMesh = new THREE.Mesh(railGeo, cb.world.materials.brass);
  railMesh.castShadow = true;
  cb.addVisualMesh(railMesh);

  // Visual: track surface (wider tube)
  const trackGeo = createTubeFromPoints(points, 0.4, 6);
  const trackMat = cb.world.materials.brass.clone();
  trackMat.transparent = true;
  trackMat.opacity = 0.4;
  trackMat.side = THREE.DoubleSide;
  const trackMesh = new THREE.Mesh(trackGeo, trackMat);
  cb.addVisualMesh(trackMesh);

  // Visual: outer guide cylinder
  const outerGeo = new THREE.CylinderGeometry(
    S2_RADIUS + 0.5, S2_RADIUS + 0.5,
    S2_TOP_Y - S2_BOTTOM_Y + 0.3, 24, 1, true
  );
  const outerMat = cb.world.materials.brass.clone();
  outerMat.transparent = true;
  outerMat.opacity = 0.12;
  outerMat.side = THREE.DoubleSide;
  const outerMesh = new THREE.Mesh(outerGeo, outerMat);
  outerMesh.position.set(S2_CENTER_X, (S2_TOP_Y + S2_BOTTOM_Y) / 2, S2_CENTER_Z);
  cb.addVisualMesh(outerMesh);

  // Connector ramp: S2 exit → S3 jump
  cb.addRamp(C23_CENTER, C23_LENGTH, C23_ANGLE, cb.world.materials.wood);

  // Static platform at spiral exit to catch ball when it becomes dynamic again
  const exitPlatSize = new THREE.Vector3(1.5, 0.15, 1.2);
  cb.addStaticBox(
    new THREE.Vector3(S2_CENTER_X + S2_RADIUS, S2_BOTTOM_Y - 0.1, S2_CENTER_Z),
    exitPlatSize, cb.world.materials.wood, undefined, 0.3
  );

  // Trigger: ball reaches spiral entry zone
  const entryX = S2_CENTER_X + S2_RADIUS;
  const entryY = S2_TOP_Y;
  cb.director.addTrigger(
    new THREE.Vector3(entryX, entryY, S2_CENTER_Z),
    new THREE.Vector3(2, 2, 2),
    'stage2-spiral',
    () => {
      // Camera: orbit around the spiral from a higher angle
      cb.director.triggerCamera({
        position: new THREE.Vector3(S2_CENTER_X + 5, S2_TOP_Y + 2, 5),
        lookAt: new THREE.Vector3(S2_CENTER_X, (S2_TOP_Y + S2_BOTTOM_Y) / 2, S2_CENTER_Z),
        duration: 1000,
        easing: 'easeInOutCubic',
      });
      performSpiral(cb, points);
    }
  );
}

function performSpiral(cb: CourseBuilder, helixPoints: THREE.Vector3[]): void {
  const ball = cb.ballBody!;
  const ballMesh = cb.ballMesh!;

  // Switch to kinematic — ball follows the helix path via tween
  ball.setBodyType(RAPIER.RigidBodyType.KinematicPositionBased, true);

  cb.director.soundManager.playSFX('roll');
  cb.director.soundManager.playNote('A4', 0.4);

  const curve = new THREE.CatmullRomCurve3(helixPoints);

  cb.director.tweenManager.add({
    from: 0,
    to: 1,
    duration: 4000,  // 4 seconds for the spiral descent
    easing: 'easeInOutSine',
    onUpdate: (t) => {
      const point = curve.getPoint(t);
      // Offset slightly above the track surface
      ball.setTranslation({ x: point.x, y: point.y + 0.35, z: point.z }, true);
      ballMesh.position.set(point.x, point.y + 0.35, point.z);
    },
    onComplete: () => {
      // Restore dynamic physics, give exit velocity in +X direction
      ball.setBodyType(RAPIER.RigidBodyType.Dynamic, true);
      ball.wakeUp();
      ball.setLinvel({ x: 3, y: -1, z: 0 }, true);
    },
  });
}
