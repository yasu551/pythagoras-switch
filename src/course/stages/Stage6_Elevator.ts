import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { CourseBuilder } from '../CourseBuilder';
import {
  S6_SEESAW_POS, S6_ELEVATOR_POS, S6_ELEVATOR_TOP_Y,
  S7_LOOP_CENTER, S7_LOOP_RADIUS,
  S8_FUNNEL_CENTER_X, S8_FUNNEL_CENTER_Z,
  S8_FUNNEL_TOP_Y, S8_FUNNEL_BOTTOM_Y,
  S8_FUNNEL_TOP_RADIUS, S8_FUNNEL_BOTTOM_RADIUS,
  S8_FUNNEL_TURNS, S8_FLAG_POS,
} from '../StageDefinitions';
import { generateLoopPoints, generateFunnelPoints, createTubeFromPoints } from '../../utils/geometry';

export function buildStage6(cb: CourseBuilder): void {
  // Seesaw visual (static — not physically interactive in scripted mode)
  const pivotSize = new THREE.Vector3(0.3, 0.5, 0.8);
  cb.addStaticBox(
    new THREE.Vector3(S6_SEESAW_POS.x, S6_SEESAW_POS.y - 0.15, 0),
    pivotSize, cb.world.materials.industrialSteel
  );

  const plankSize = new THREE.Vector3(2.5, 0.1, 0.8);
  cb.addStaticBox(
    new THREE.Vector3(S6_SEESAW_POS.x, S6_SEESAW_POS.y + 0.2, 0),
    plankSize, cb.world.materials.wood
  );

  // Elevator shaft visual (vertical rail)
  const shaftGeo = new THREE.BoxGeometry(0.08, S6_ELEVATOR_TOP_Y - S6_ELEVATOR_POS.y + 1, 0.08);
  const shaftMesh = new THREE.Mesh(shaftGeo, cb.world.materials.industrialSteel);
  shaftMesh.position.set(S6_ELEVATOR_POS.x + 0.7, (S6_ELEVATOR_POS.y + S6_ELEVATOR_TOP_Y) / 2, 0);
  shaftMesh.castShadow = true;
  cb.addVisualMesh(shaftMesh);

  // Elevator platform visual
  const elevGeo = new THREE.BoxGeometry(1.2, 0.12, 1.0);
  const elevMesh = new THREE.Mesh(elevGeo, cb.world.materials.industrialSteel);
  elevMesh.position.set(S6_ELEVATOR_POS.x, S6_ELEVATOR_POS.y, 0);
  elevMesh.castShadow = true;
  cb.addVisualMesh(elevMesh);

  // Loop visual
  const loopPoints = generateLoopPoints(
    S7_LOOP_CENTER.x, S7_LOOP_CENTER.y, S7_LOOP_CENTER.z,
    S7_LOOP_RADIUS, 40
  );
  const railGeo = createTubeFromPoints(loopPoints, 0.08, 8);
  const railMat = new THREE.MeshStandardMaterial({
    color: 0xcccccc, metalness: 0.9, roughness: 0.1,
  });
  const railMesh = new THREE.Mesh(railGeo, railMat);
  railMesh.castShadow = true;
  cb.addVisualMesh(railMesh);

  const trackGeo = createTubeFromPoints(loopPoints, 0.35, 6);
  const trackMat = new THREE.MeshStandardMaterial({
    color: 0xaaddff, metalness: 0.1, roughness: 0.05,
    transparent: true, opacity: 0.25,
    side: THREE.DoubleSide,
  });
  cb.addVisualMesh(new THREE.Mesh(trackGeo, trackMat));

  // Funnel visual
  const funnelHeight = S8_FUNNEL_TOP_Y - S8_FUNNEL_BOTTOM_Y;
  const funnelGeo = new THREE.ConeGeometry(S8_FUNNEL_TOP_RADIUS, funnelHeight, 32, 1, true);
  const funnelMat = cb.world.materials.copper.clone();
  funnelMat.side = THREE.DoubleSide;
  funnelMat.transparent = true;
  funnelMat.opacity = 0.5;
  const funnelMesh = new THREE.Mesh(funnelGeo, funnelMat);
  funnelMesh.position.set(S8_FUNNEL_CENTER_X, (S8_FUNNEL_TOP_Y + S8_FUNNEL_BOTTOM_Y) / 2, S8_FUNNEL_CENTER_Z);
  cb.addVisualMesh(funnelMesh);

  // Flag pole + banner
  const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 3, 8);
  const poleMesh = new THREE.Mesh(poleGeo, cb.world.materials.steel);
  poleMesh.position.set(S8_FLAG_POS.x, 1.5, S8_FLAG_POS.z);
  poleMesh.castShadow = true;
  cb.addVisualMesh(poleMesh);

  // Flag banner with text drawn via canvas texture
  const flagCanvas = document.createElement('canvas');
  flagCanvas.width = 256;
  flagCanvas.height = 160;
  const ctx2d = flagCanvas.getContext('2d')!;
  ctx2d.fillStyle = '#e74c3c';
  ctx2d.fillRect(0, 0, 256, 160);
  // Border
  ctx2d.strokeStyle = '#c0392b';
  ctx2d.lineWidth = 6;
  ctx2d.strokeRect(3, 3, 250, 154);
  // Text
  ctx2d.fillStyle = '#ffffff';
  ctx2d.font = 'bold 36px "Hiragino Sans", "Noto Sans JP", sans-serif';
  ctx2d.textAlign = 'center';
  ctx2d.textBaseline = 'middle';
  ctx2d.fillText('コロコロ', 128, 58);
  ctx2d.fillText('スイッチ', 128, 106);

  const flagTexture = new THREE.CanvasTexture(flagCanvas);
  const flagGeo = new THREE.PlaneGeometry(1.4, 0.85);
  const flagMat = new THREE.MeshStandardMaterial({
    map: flagTexture,
    side: THREE.DoubleSide,
    metalness: 0,
    roughness: 0.8,
  });
  const flagMesh = new THREE.Mesh(flagGeo, flagMat);
  flagMesh.position.set(S8_FLAG_POS.x + 0.7, 0.3, S8_FLAG_POS.z);
  cb.addVisualMesh(flagMesh);
  cb.flagMesh = flagMesh;

  // Store references for scripted continuation
  (cb as any)._elevMesh = elevMesh;
  (cb as any)._loopPoints = loopPoints;
}

/**
 * Scripted continuation: ball is already kinematic from Stage 5.
 * Animate through seesaw → elevator → loop → funnel → flag.
 */
export function performScriptedContinuation(cb: CourseBuilder): void {
  const ball = cb.ballBody!;
  const ballMesh = cb.ballMesh!;
  const elevMesh = (cb as any)._elevMesh as THREE.Mesh;
  const loopPoints = (cb as any)._loopPoints as THREE.Vector3[];

  const tm = cb.director.tweenManager;

  // ── Phase 1: Roll to seesaw (1s) ──
  const startPos = new THREE.Vector3().copy(ballMesh.position);
  const seesawPos = new THREE.Vector3(S6_SEESAW_POS.x - 0.8, S6_SEESAW_POS.y + 0.5, 0);

  tm.add({
    from: 0, to: 1, duration: 1000, easing: 'easeOutCubic',
    onUpdate: (t) => {
      const p = new THREE.Vector3().lerpVectors(startPos, seesawPos, t);
      ball.setTranslation({ x: p.x, y: p.y, z: p.z }, true);
      ballMesh.position.copy(p);
    },
    onComplete: () => {
      cb.director.soundManager.playSFX('impact');
      cb.director.soundManager.playNote('G5', 0.3);

      // Camera: wide shot showing the lower level
      cb.director.triggerCamera({
        position: new THREE.Vector3(S6_ELEVATOR_POS.x - 2, 0, 8),
        lookAt: new THREE.Vector3(S6_ELEVATOR_POS.x, -1, 0),
        duration: 800,
        easing: 'easeInOutCubic',
      });

      // ── Phase 2: Elevator rises (2.5s, delay 0.5s) ──
      const elevStartY = S6_ELEVATOR_POS.y;
      const elevEndY = S6_ELEVATOR_TOP_Y;
      const ballOnElev = new THREE.Vector3(S6_ELEVATOR_POS.x, elevStartY + 0.4, 0);

      // Move ball to elevator
      tm.add({
        from: 0, to: 1, duration: 500, easing: 'easeInOutSine',
        onUpdate: (t) => {
          const p = new THREE.Vector3().lerpVectors(seesawPos, ballOnElev, t);
          ball.setTranslation({ x: p.x, y: p.y, z: p.z }, true);
          ballMesh.position.copy(p);
        },
        onComplete: () => {
          cb.director.soundManager.playSFX('mechanical');

          // Camera: low angle looking UP as elevator rises
          cb.director.triggerCamera({
            position: new THREE.Vector3(S6_ELEVATOR_POS.x - 3, -2, 5),
            lookAt: new THREE.Vector3(S6_ELEVATOR_POS.x, 1, 0),
            duration: 2500,
            easing: 'easeInOutSine',
          });

          // Elevator + ball rise together
          tm.add({
            from: elevStartY, to: elevEndY, duration: 2500, easing: 'easeInOutCubic',
            onUpdate: (y) => {
              elevMesh.position.y = y;
              ball.setTranslation({ x: S6_ELEVATOR_POS.x, y: y + 0.4, z: 0 }, true);
              ballMesh.position.set(S6_ELEVATOR_POS.x, y + 0.4, 0);
            },
            onComplete: () => {
              cb.director.soundManager.playSFX('whoosh');

              // ── Phase 3: Roll to loop (1s) ──
              const loopEntry = new THREE.Vector3(
                S7_LOOP_CENTER.x - S7_LOOP_RADIUS,
                S7_LOOP_CENTER.y - S7_LOOP_RADIUS + 0.3,
                0
              );
              const fromElev = new THREE.Vector3(S6_ELEVATOR_POS.x, elevEndY + 0.4, 0);

              tm.add({
                from: 0, to: 1, duration: 1000, easing: 'easeInOutSine',
                onUpdate: (t) => {
                  const p = new THREE.Vector3().lerpVectors(fromElev, loopEntry, t);
                  ball.setTranslation({ x: p.x, y: p.y, z: p.z }, true);
                  ballMesh.position.copy(p);
                },
                onComplete: () => {
                  // ── Phase 4: Loop (2.5s) ──
                  cb.director.soundManager.playSFX('whoosh');
                  cb.director.setTimeScale(0.4, 3000);

                  // Camera: dramatic low angle for the loop
                  cb.director.triggerCamera({
                    position: new THREE.Vector3(S7_LOOP_CENTER.x, S7_LOOP_CENTER.y - S7_LOOP_RADIUS - 2, 5),
                    lookAt: S7_LOOP_CENTER.clone(),
                    duration: 600,
                    easing: 'easeOutCubic',
                  });
                  const curve = new THREE.CatmullRomCurve3(loopPoints);
                  tm.add({
                    from: 0, to: 1, duration: 2500, easing: 'easeInOutSine',
                    onUpdate: (t) => {
                      const p = curve.getPoint(t);
                      ball.setTranslation({ x: p.x, y: p.y, z: p.z }, true);
                      ballMesh.position.copy(p);
                    },
                    onComplete: () => {
                      cb.director.soundManager.playSFX('impact');

                      // ── Phase 5: Roll to funnel (1s) ──
                      const loopExit = ballMesh.position.clone();
                      const funnelEntry = new THREE.Vector3(
                        S8_FUNNEL_CENTER_X, S8_FUNNEL_TOP_Y + 0.3, S8_FUNNEL_CENTER_Z
                      );
                      tm.add({
                        from: 0, to: 1, duration: 1000, easing: 'easeInOutSine',
                        onUpdate: (t) => {
                          const p = new THREE.Vector3().lerpVectors(loopExit, funnelEntry, t);
                          ball.setTranslation({ x: p.x, y: p.y, z: p.z }, true);
                          ballMesh.position.copy(p);
                        },
                        onComplete: () => {
                          // Camera: overhead for funnel
                          cb.director.triggerCamera({
                            position: new THREE.Vector3(S8_FUNNEL_CENTER_X, S8_FUNNEL_TOP_Y + 5, 2),
                            lookAt: new THREE.Vector3(S8_FUNNEL_CENTER_X, S8_FUNNEL_BOTTOM_Y, S8_FUNNEL_CENTER_Z),
                            duration: 1000,
                            easing: 'easeInOutCubic',
                          });
                          // ── Phase 6: Funnel spiral (3.5s) ──
                          const funnelPts = generateFunnelPoints(
                            S8_FUNNEL_CENTER_X, S8_FUNNEL_CENTER_Z,
                            S8_FUNNEL_TOP_Y, S8_FUNNEL_BOTTOM_Y,
                            S8_FUNNEL_TOP_RADIUS * 0.7, S8_FUNNEL_BOTTOM_RADIUS,
                            S8_FUNNEL_TURNS, 80
                          );
                          const funnelCurve = new THREE.CatmullRomCurve3(funnelPts);
                          tm.add({
                            from: 0, to: 1, duration: 3500, easing: 'easeInCubic',
                            onUpdate: (t) => {
                              const p = funnelCurve.getPoint(t);
                              ball.setTranslation({ x: p.x, y: p.y, z: p.z }, true);
                              ballMesh.position.copy(p);
                            },
                            onComplete: () => {
                              cb.director.soundManager.playSFX('drop');
                              cb.director.soundManager.playNote('A5', 0.5);

                              // Camera: pull back for flag reveal
                              cb.director.triggerCamera({
                                position: new THREE.Vector3(S8_FLAG_POS.x - 3, 3, 7),
                                lookAt: new THREE.Vector3(S8_FLAG_POS.x, 2, S8_FLAG_POS.z),
                                duration: 1500,
                                easing: 'easeOutCubic',
                              });

                              // Raise flag
                              if (cb.flagMesh) {
                                tm.add({
                                  from: 0.3, to: 2.5, duration: 2000, easing: 'easeOutCubic',
                                  onUpdate: (y) => { cb.flagMesh!.position.y = y; },
                                });
                              }

                              setTimeout(() => {
                                cb.director.triggerFinale();
                              }, 2500);
                            },
                          });
                        },
                      });
                    },
                  });
                },
              });
            },
          });
        },
      });
    },
  });
}
