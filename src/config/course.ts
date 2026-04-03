// Course layout configuration
// All positions are in world coordinates (canvas is 1280x720, world extends to ~3000px wide)

export interface BodyConfig {
  type: 'rectangle' | 'circle' | 'domino';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  angle?: number;        // degrees
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
  width: 2800,
  height: 720,
  floorY: 650,
  gravity: { x: 0, y: 2 },
};

// The ball (protagonist)
export const BALL: BodyConfig = {
  type: 'circle',
  x: 170,
  y: 160,
  radius: 14,
  label: 'ball',
  friction: 0.001,
  restitution: 0.3,
  density: 0.004,
};

// Static course elements
export const COURSE_BODIES: BodyConfig[] = [
  // Ramp 1: ball rolls down this
  {
    type: 'rectangle',
    x: 300, y: 220,
    width: 300, height: 10,
    angle: 15,
    isStatic: true,
    label: 'ramp1',
    friction: 0.002,
  },
  // Small ledge to slow the ball before dominoes
  {
    type: 'rectangle',
    x: 490, y: 305,
    width: 60, height: 10,
    angle: 0,
    isStatic: true,
    label: 'ledge1',
    friction: 0.01,
  },
  // Ramp 2: after dominoes, ball rolls onto this
  {
    type: 'rectangle',
    x: 900, y: 390,
    width: 250, height: 10,
    angle: 12,
    isStatic: true,
    label: 'ramp2',
    friction: 0.002,
  },
  // Platform for lever
  {
    type: 'rectangle',
    x: 1100, y: 470,
    width: 60, height: 10,
    angle: 0,
    isStatic: true,
    label: 'lever-platform',
    friction: 0.05,
  },
  // Ramp 3: ball launched by lever lands here
  {
    type: 'rectangle',
    x: 1400, y: 350,
    width: 200, height: 10,
    angle: 18,
    isStatic: true,
    label: 'ramp3',
    friction: 0.002,
  },
  // Shelf for Ball 2
  {
    type: 'rectangle',
    x: 1650, y: 440,
    width: 80, height: 10,
    angle: 0,
    isStatic: true,
    label: 'shelf',
    friction: 0.05,
  },
  // Bucket walls
  {
    type: 'rectangle',
    x: 1920, y: 560,
    width: 10, height: 60,
    angle: 0,
    isStatic: true,
    label: 'bucket-left',
  },
  {
    type: 'rectangle',
    x: 2000, y: 560,
    width: 10, height: 60,
    angle: 0,
    isStatic: true,
    label: 'bucket-right',
  },
  {
    type: 'rectangle',
    x: 1960, y: 590,
    width: 90, height: 10,
    angle: 0,
    isStatic: true,
    label: 'bucket-bottom',
  },
  // Flag pole
  {
    type: 'rectangle',
    x: 2200, y: 500,
    width: 4, height: 160,
    angle: 0,
    isStatic: true,
    label: 'flag-pole',
  },
];

// Dominoes: thin tall rectangles in a row
export const DOMINOES: BodyConfig[] = Array.from({ length: 7 }, (_, i) => ({
  type: 'domino' as const,
  x: 550 + i * 35,
  y: 285,
  width: 10,
  height: 45,
  isStatic: false,
  label: `domino-${i}`,
  friction: 0.3,
  restitution: 0.05,
  density: 0.003,
}));

// Ball 2: sits on the shelf, gets knocked into bucket
export const BALL2: BodyConfig = {
  type: 'circle',
  x: 1650,
  y: 420,
  radius: 12,
  label: 'ball2',
  friction: 0.01,
  restitution: 0.2,
  density: 0.003,
};

// Trigger sensors (invisible, fire Director events)
export const TRIGGERS: TriggerConfig[] = [
  { x: 300, y: 200, width: 40, height: 40, label: 'trigger-ramp1-start' },
  { x: 520, y: 280, width: 40, height: 40, label: 'trigger-domino-start' },
  { x: 780, y: 310, width: 40, height: 40, label: 'trigger-domino-end' },
  { x: 1050, y: 440, width: 40, height: 40, label: 'trigger-lever' },
  { x: 1350, y: 330, width: 40, height: 40, label: 'trigger-ramp3' },
  { x: 1630, y: 420, width: 40, height: 60, label: 'trigger-shelf' },
  { x: 1960, y: 550, width: 80, height: 40, label: 'trigger-bucket' },
];
