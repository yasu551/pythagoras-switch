export interface DirectorEvent {
  label: string;
  camera?: {
    panTo?: { x: number; y: number };
    zoom?: number;
    shake?: number;
    duration: number;
  };
  sound?: {
    play: string;
    note?: string;
  };
  timeScale?: {
    value: number;
    duration: number;
  } | null;
}

export const DIRECTOR_SCRIPT: DirectorEvent[] = [
  {
    label: 'trigger-ramp1-start',
    camera: { panTo: { x: 280, y: 200 }, zoom: 1.15, duration: 800 },
    sound: { play: 'roll', note: 'G4' },
    timeScale: null,
  },
  {
    label: 'trigger-domino-start',
    camera: { panTo: { x: 500, y: 280 }, zoom: 1.3, duration: 600 },
    sound: { play: 'click', note: 'A4' },
    timeScale: { value: 0.4, duration: 1200 },
  },
  {
    label: 'trigger-domino-end',
    camera: { panTo: { x: 750, y: 380 }, zoom: 1.1, duration: 800 },
    sound: { play: 'knock', note: 'B4' },
    timeScale: null,
  },
  {
    label: 'trigger-ramp3',
    camera: { panTo: { x: 1000, y: 490 }, zoom: 1.15, duration: 700 },
    sound: { play: 'roll', note: 'D5' },
    timeScale: null,
  },
  {
    label: 'trigger-bucket',
    camera: { panTo: { x: 1200, y: 560 }, zoom: 1.3, shake: 0.08, duration: 800 },
    sound: { play: 'drop', note: 'E5' },
    timeScale: { value: 0.3, duration: 1500 },
  },
];
