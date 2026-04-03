// Course layout — staircase design, maximum reliability
//
// All ramps tilt the same direction (left-to-right, top-to-bottom).
// Each ramp's low end overlaps with the next ramp's high end.
// No zigzag, no walls, no gaps. The ball never needs to change direction.
//
// Flow: Ball → Ramp1 → Dominoes on Platform → Ramp2 → Ramp3 → Bucket → Flag

export interface BodyConfig {
  type: 'rectangle' | 'circle' | 'domino';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  angle?: number;
  isStatic?: boolean;
  label?: string;
  friction?: number;
  restitution?: number;
  density?: number;
}

export interface TriggerConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export const WORLD = {
  width: 1600,
  height: 720,
  floorY: 650,
  gravity: { x: 0, y: 2 },
};

export const BALL: BodyConfig = {
  type: 'circle',
  x: 100, y: 50,
  radius: 15,
  label: 'ball',
  friction: 0.0005,
  restitution: 0.3,
  density: 0.008,
};

// Unused — single ball design
export const BALL2: BodyConfig = {
  type: 'circle', x: -50, y: -50, radius: 1,
  label: 'ball2-unused', isStatic: true,
};
export const LAUNCHER: BodyConfig = {
  type: 'rectangle', x: -50, y: -50, width: 1, height: 1,
  isStatic: true, label: 'launcher-unused',
};

export const COURSE_BODIES: BodyConfig[] = [
  // ============================================================
  // RAMP 1 (x: 60-400)
  // Steep entry ramp. Ball gains speed here.
  // High end: ~(60, 85)  Low end: ~(400, 265)
  // ============================================================
  {
    type: 'rectangle',
    x: 230, y: 175,
    width: 350, height: 14,
    angle: 18,
    isStatic: true,
    label: 'ramp1',
    friction: 0.0005,
  },

  // ============================================================
  // DOMINO PLATFORM (x: 380-620)
  // Tilted 12 degrees. Ball pushes through dominoes and slides off.
  // High end overlaps ramp1 low end.
  // High: ~(380, 258)  Low: ~(620, 308)
  // ============================================================
  {
    type: 'rectangle',
    x: 500, y: 283,
    width: 240, height: 14,
    angle: 12,
    isStatic: true,
    label: 'platform1',
    friction: 0.0005,
  },

  // ============================================================
  // RAMP 2 (x: 600-900)
  // Catches ball after platform. Wider ramp = easier catch.
  // High end overlaps platform1 low end.
  // High: ~(600, 340)  Low: ~(900, 450)
  // ============================================================
  {
    type: 'rectangle',
    x: 750, y: 395,
    width: 310, height: 14,
    angle: 20,
    isStatic: true,
    label: 'ramp2',
    friction: 0.0005,
  },

  // ============================================================
  // RAMP 3 (x: 880-1150)
  // Final ramp to bucket. Overlaps ramp2 low end.
  // High: ~(880, 470)  Low: ~(1150, 560)
  // ============================================================
  {
    type: 'rectangle',
    x: 1015, y: 515,
    width: 280, height: 14,
    angle: 18,
    isStatic: true,
    label: 'ramp3',
    friction: 0.0005,
  },

  // ============================================================
  // BUCKET (x: 1140-1220)
  // Wide bucket to reliably catch the ball.
  // ============================================================
  {
    type: 'rectangle',
    x: 1150, y: 590,
    width: 14, height: 60,
    angle: 0,
    isStatic: true,
    label: 'bucket-left',
  },
  {
    type: 'rectangle',
    x: 1250, y: 590,
    width: 14, height: 60,
    angle: 0,
    isStatic: true,
    label: 'bucket-right',
  },
  {
    type: 'rectangle',
    x: 1200, y: 620,
    width: 114, height: 14,
    angle: 0,
    isStatic: true,
    label: 'bucket-bottom',
  },

  // ============================================================
  // FLAG POLE
  // ============================================================
  {
    type: 'rectangle',
    x: 1380, y: 510,
    width: 4, height: 180,
    angle: 0,
    isStatic: true,
    label: 'flag-pole',
  },
];

// 4 dominoes on tilted platform. Very light so they don't block the ball.
export const DOMINOES: BodyConfig[] = Array.from({ length: 4 }, (_, i) => ({
  type: 'domino' as const,
  x: 430 + i * 35,
  y: 240,
  width: 12,
  height: 50,
  isStatic: false,
  label: `domino-${i}`,
  friction: 0.05,
  restitution: 0.01,
  density: 0.0004,
}));

// Trigger sensors
export const TRIGGERS: TriggerConfig[] = [
  { x: 200, y: 150, width: 50, height: 50, label: 'trigger-ramp1-start' },
  { x: 420, y: 260, width: 40, height: 50, label: 'trigger-domino-start' },
  { x: 640, y: 330, width: 50, height: 60, label: 'trigger-domino-end' },
  { x: 850, y: 450, width: 50, height: 50, label: 'trigger-ramp3' },
  { x: 1200, y: 590, width: 100, height: 50, label: 'trigger-bucket' },
];
