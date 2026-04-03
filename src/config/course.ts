// Course layout — simplified, one ball continuous path
//
// Flow: Ball drops → Ramp1 → knocks over Dominoes on tilted platform
//       → Ball rolls off platform → drops onto Ramp2
//       → rolls down Ramp2 → drops onto Ramp3
//       → rolls into Bucket → triggers Flag → ♪ ピタゴラスイッチ ♪
//
// DESIGN: One ball, continuous path. Every surface connects to the next.
// Platform is tilted 10deg so ball + dominoes slide off the end.

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
  width: 1800,
  height: 720,
  floorY: 650,
  gravity: { x: 0, y: 2 },
};

// The ball
export const BALL: BodyConfig = {
  type: 'circle',
  x: 100, y: 60,
  radius: 15,
  label: 'ball',
  friction: 0.0005,
  restitution: 0.3,
  density: 0.008,
};

// Ball2 not used — single ball path
export const BALL2: BodyConfig = {
  type: 'circle',
  x: -50, y: -50,
  radius: 1,
  label: 'ball2-unused',
  isStatic: true,
};

export const LAUNCHER: BodyConfig = {
  type: 'rectangle',
  x: -50, y: -50,
  width: 1, height: 1,
  isStatic: true,
  label: 'launcher-unused',
};

export const COURSE_BODIES: BodyConfig[] = [
  // === RAMP 1 (x: 60-380) ===
  // Ball drops onto the high end. 16 degree slope.
  // Low end at ~(380, 270).
  {
    type: 'rectangle',
    x: 220, y: 170,
    width: 330, height: 14,
    angle: 16,
    isStatic: true,
    label: 'ramp1',
    friction: 0.0005,
  },

  // === DOMINO PLATFORM (x: 380-640) ===
  // 15 degree slope — steep enough that ball slides through fallen dominoes.
  {
    type: 'rectangle',
    x: 510, y: 300,
    width: 260, height: 14,
    angle: 15,
    isStatic: true,
    label: 'platform1',
    friction: 0.0005,
  },

  // === RAMP 2 (x: 680-950) ===
  // Catches ball after it falls off platform1 edge.
  // High end at ~(720, 370), directly below platform1's right edge.
  {
    type: 'rectangle',
    x: 820, y: 420,
    width: 260, height: 14,
    angle: 20,
    isStatic: true,
    label: 'ramp2',
    friction: 0.0005,
  },

  // === RAMP 3 (x: 950-1150) ===
  // Catches ball from ramp2, redirects toward bucket.
  // Angled the other way (-15deg) to create a zigzag.
  {
    type: 'rectangle',
    x: 1040, y: 510,
    width: 220, height: 14,
    angle: -12,
    isStatic: true,
    label: 'ramp3',
    friction: 0.0005,
  },
  // Wall at left end of ramp3 to catch the ball
  {
    type: 'rectangle',
    x: 928, y: 498,
    width: 14, height: 40,
    angle: 0,
    isStatic: true,
    label: 'ramp3-wall',
  },

  // === RAMP 4 (final) ===
  // Ball rolls off ramp3 right end into bucket below.
  {
    type: 'rectangle',
    x: 1200, y: 550,
    width: 160, height: 14,
    angle: 20,
    isStatic: true,
    label: 'ramp4',
    friction: 0.0005,
  },

  // === BUCKET ===
  {
    type: 'rectangle',
    x: 1290, y: 595,
    width: 14, height: 50,
    angle: 0,
    isStatic: true,
    label: 'bucket-left',
  },
  {
    type: 'rectangle',
    x: 1370, y: 595,
    width: 14, height: 50,
    angle: 0,
    isStatic: true,
    label: 'bucket-right',
  },
  {
    type: 'rectangle',
    x: 1330, y: 620,
    width: 94, height: 14,
    angle: 0,
    isStatic: true,
    label: 'bucket-bottom',
  },

  // === FLAG POLE ===
  {
    type: 'rectangle',
    x: 1500, y: 510,
    width: 4, height: 180,
    angle: 0,
    isStatic: true,
    label: 'flag-pole',
  },
];

// 4 dominoes. Light, tall, low friction so they slide when fallen.
export const DOMINOES: BodyConfig[] = Array.from({ length: 4 }, (_, i) => ({
  type: 'domino' as const,
  x: 430 + i * 35,
  y: 250,
  width: 12,
  height: 50,
  isStatic: false,
  label: `domino-${i}`,
  friction: 0.05,
  restitution: 0.01,
  density: 0.0005,
}));

// Trigger sensors
export const TRIGGERS: TriggerConfig[] = [
  { x: 200, y: 150, width: 50, height: 50, label: 'trigger-ramp1-start' },
  { x: 420, y: 270, width: 40, height: 50, label: 'trigger-domino-start' },
  { x: 700, y: 350, width: 50, height: 60, label: 'trigger-domino-end' },
  { x: 940, y: 500, width: 50, height: 50, label: 'trigger-ramp3' },
  { x: 1330, y: 590, width: 80, height: 40, label: 'trigger-bucket' },
];
