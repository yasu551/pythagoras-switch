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
    camera: { panTo: { x: 300, y: 220 }, zoom: 1.15, duration: 800 },
    sound: { play: 'roll', note: 'G4' },
    timeScale: null,
  },
  {
    label: 'trigger-domino-start',
    camera: { panTo: { x: 550, y: 290 }, zoom: 1.3, duration: 600 },
    sound: { play: 'click', note: 'A4' },
    timeScale: { value: 0.4, duration: 2000 },
  },
  {
    label: 'trigger-domino-end',
    camera: { panTo: { x: 800, y: 350 }, zoom: 1.1, duration: 800 },
    sound: { play: 'knock', note: 'B4' },
    timeScale: null,
  },
  {
    label: 'trigger-ramp3',
    camera: { panTo: { x: 1050, y: 470 }, zoom: 1.15, shake: 0.002, duration: 700 },
    sound: { play: 'roll', note: 'D5' },
    timeScale: { value: 0.35, duration: 1200 },
  },
  {
    label: 'trigger-bucket',
    camera: { panTo: { x: 1400, y: 500 }, zoom: 1.0, duration: 1200 },
    sound: { play: 'drop', note: 'E5' },
    timeScale: { value: 0.3, duration: 2000 },
  },
];
