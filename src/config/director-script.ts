// Director event timeline
// Each trigger sensor label maps to a camera/sound/time event

export interface DirectorEvent {
  label: string;
  camera?: {
    panTo?: { x: number; y: number };
    zoom?: number;
    shake?: number;        // intensity
    duration: number;       // ms
  };
  sound?: {
    play: string;           // SFX key
    note?: string;          // musical note for jingle buildup
  };
  timeScale?: {
    value: number;          // e.g., 0.3 for slow-mo
    duration: number;       // ms before snapping back to 1.0
  } | null;
}

// Jingle notes: G4 A4 B4 D5 E5 G5 A5 (maps to ピ・タ・ゴ・ラ・ス・イッ・チ)
export const DIRECTOR_SCRIPT: DirectorEvent[] = [
  {
    label: 'trigger-ramp1-start',
    camera: { panTo: { x: 400, y: 250 }, zoom: 1.1, duration: 800 },
    sound: { play: 'roll', note: 'G4' },
    timeScale: null,
  },
  {
    label: 'trigger-domino-start',
    camera: { panTo: { x: 650, y: 300 }, zoom: 1.3, duration: 600 },
    sound: { play: 'click', note: 'A4' },
    timeScale: { value: 0.4, duration: 1500 },  // slow-mo hero moment: dominoes falling
  },
  {
    label: 'trigger-domino-end',
    camera: { panTo: { x: 900, y: 350 }, zoom: 1.0, duration: 800 },
    sound: { play: 'click', note: 'B4' },
    timeScale: null,
  },
  {
    label: 'trigger-lever',
    camera: { panTo: { x: 1100, y: 400 }, zoom: 1.2, shake: 0.003, duration: 600 },
    sound: { play: 'thwack', note: 'D5' },
    timeScale: { value: 0.35, duration: 1200 },  // slow-mo hero moment: lever launch
  },
  {
    label: 'trigger-ramp3',
    camera: { panTo: { x: 1450, y: 380 }, zoom: 1.1, duration: 700 },
    sound: { play: 'roll', note: 'E5' },
    timeScale: null,
  },
  {
    label: 'trigger-shelf',
    camera: { panTo: { x: 1700, y: 430 }, zoom: 1.2, duration: 600 },
    sound: { play: 'knock', note: 'G5' },
    timeScale: null,
  },
  {
    label: 'trigger-bucket',
    camera: { panTo: { x: 2100, y: 450 }, zoom: 1.0, duration: 1200 },
    sound: { play: 'drop', note: 'A5' },
    timeScale: { value: 0.3, duration: 2000 },  // slow-mo hero moment: flag rises
  },
];
