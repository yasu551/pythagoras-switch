import * as THREE from 'three';

// =================================================================
// Course layout — all stages flow left-to-right (+X direction).
// Y is up. Each stage's exit connects to the next stage's entry.
//
// Height profile:
//   Ball starts at y=10, gradually descends to y=0.5 by Stage 4.
//   Stage 5 "surprise" sends ball to a lower section at y=-2.
//   Elevator (Stage 6) brings it back up to y=3.
//   Loop + funnel finish near y=0.
// =================================================================

// ── Stage 1: Free Fall + Entry Ramp ─────────────────────
export const S1_BALL_START = new THREE.Vector3(0, 11, 0);
// Ramp catches the ball and sends it toward the spiral.
// Ramp: -20° angle (negative = downhill left→right), 5m long
// → high end ≈ (-0.85, 9.85), low end ≈ (3.85, 8.15)
export const S1_RAMP_CENTER = new THREE.Vector3(1.5, 9, 0);
export const S1_RAMP_ANGLE = -20;

// ── Connector 1→2: ramp from S1 exit to spiral entry ───
// From (3.85, 8.15) → spiral entry at (6.3, 7.0)
export const C12_CENTER = new THREE.Vector3(5.0, 7.6, 0);
export const C12_ANGLE = -12;
export const C12_LENGTH = 3.0;

// ── Stage 2: Spiral Descent ─────────────────────────────
// 2 full turns, entry and exit at same angle (+X side).
export const S2_CENTER_X = 5.0;
export const S2_CENTER_Z = 0;
export const S2_TOP_Y = 7.0;
export const S2_BOTTOM_Y = 3.0;
export const S2_RADIUS = 1.3;
export const S2_TURNS = 2.0;
export const S2_SEGMENTS = 50;
// Entry: (5.0+1.3, 7.0, 0) = (6.3, 7.0, 0)
// Exit:  (6.3, 3.0, 0) — same X after 2 full turns

// ── Connector 2→3: ramp from spiral exit to jump ────────
// From (6.3, 3.0) → jump launch at (10, 1.5)
export const C23_CENTER = new THREE.Vector3(8.2, 2.2, 0);
export const C23_ANGLE = -12;
export const C23_LENGTH = 4;

// ── Stage 3: Jump Ramp ──────────────────────────────────
// Kicker launches ball across a gap. Landing platform beyond.
export const S3_LAUNCH_CENTER = new THREE.Vector3(10.5, 1.2, 0);
export const S3_LAUNCH_ANGLE = 6;   // gentle kicker — more horizontal distance
export const S3_LAUNCH_LENGTH = 1.5;
// Ball launches from ~(11.2, 1.4), arcs through air
export const S3_LANDING_POS = new THREE.Vector3(12.8, 0.8, 0);
export const S3_LANDING_LENGTH = 3;
// Exit: ball rolls to ~(14.7, 0.5)

// ── Stage 4: Dominoes ───────────────────────────────────
// Platform with 8 dominoes. Ball knocks them over.
export const S4_START_X = 14.0;
export const S4_Y = 0.7;
export const S4_Z = 0;
export const S4_COUNT = 3;
export const S4_SPACING = 0.4;
// Dominoes from x=15.0 to x=19.0
// Last domino at x=18.5, ball exits ~x=19.5

// ── Connector 4→5: steep ramp to dead end ───────────────
export const C45_CENTER = new THREE.Vector3(19.5, 0.3, 0);
export const C45_ANGLE = -6;
export const C45_LENGTH = 2;

// ── Stage 5: The Surprise ───────────────────────────────
// Ball stops on a metal plate at a dead end. Silence.
// Then a trapdoor opens and ball drops to a lower level.
export const S5_PLATE_POS = new THREE.Vector3(20.5, 0.1, 0);
// Trapdoor drops ball to y = -2.5 level
export const S5_DROP_Y = -2.5;

// ── Lower level ramp (post-drop) ────────────────────────
// Ball lands on a ramp going right, toward the seesaw
export const S5_LOWER_RAMP_CENTER = new THREE.Vector3(21.5, -2.2, 0);
export const S5_LOWER_RAMP_ANGLE = -8;
export const S5_LOWER_RAMP_LENGTH = 3;

// ── Stage 6: Seesaw + Elevator ──────────────────────────
export const S6_SEESAW_POS = new THREE.Vector3(23.5, -2.5, 0);
export const S6_ELEVATOR_POS = new THREE.Vector3(25, -2.5, 0);
export const S6_ELEVATOR_TOP_Y = 3.0;
// Exit ramp from elevator top: ball rolls to the loop

// ── Connector 6→7: ramp from elevator top to loop ───────
export const C67_CENTER = new THREE.Vector3(26.5, 2.5, 0);
export const C67_ANGLE = -8;
export const C67_LENGTH = 3;

// ── Stage 7: Loop-the-loop ──────────────────────────────
export const S7_LOOP_CENTER = new THREE.Vector3(28.5, 2.5, 0);
export const S7_LOOP_RADIUS = 1.5;
export const S7_LOOP_SEGMENTS = 40;
// Loop bottom at y = 2.5 - 1.5 = 1.0
// Loop top at y = 2.5 + 1.5 = 4.0
// Exit at bottom: ball continues right

// ── Connector 7→8: ramp to funnel ───────────────────────
export const C78_CENTER = new THREE.Vector3(31, 1.5, 0);
export const C78_ANGLE = -5;
export const C78_LENGTH = 3;

// ── Stage 8: Funnel Finale ──────────────────────────────
export const S8_FUNNEL_CENTER_X = 32.5;
export const S8_FUNNEL_CENTER_Z = 0;
export const S8_FUNNEL_TOP_Y = 1.2;
export const S8_FUNNEL_BOTTOM_Y = 0.3;
export const S8_FUNNEL_TOP_RADIUS = 1.5;
export const S8_FUNNEL_BOTTOM_RADIUS = 0.1;
export const S8_FUNNEL_TURNS = 3;
export const S8_FLAG_POS = new THREE.Vector3(34.5, 0, 0);
