import Phaser from 'phaser';

// Note frequencies in Hz
const NOTE_FREQ: Record<string, number> = {
  'G4': 392.00,
  'A4': 440.00,
  'B4': 493.88,
  'D5': 587.33,
  'E5': 659.25,
  'G5': 783.99,
  'A5': 880.00,
};

// Jingle sequence: ピ・タ・ゴ・ラ・ス・イッ・チ
const JINGLE_NOTES = ['G4', 'A4', 'B4', 'D5', 'E5', 'G5', 'A5'];

export class SoundManager {
  private scene: Phaser.Scene;
  private ctx: AudioContext | null = null;
  private noteIndex = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  private getContext(): AudioContext | null {
    const snd = this.scene.sound as Phaser.Sound.WebAudioSoundManager;
    if (!snd.context) return null;

    // Try to resume if suspended (may happen if resume() didn't complete before scene transition)
    if (snd.context.state === 'suspended') {
      snd.context.resume();
    }

    this.ctx = snd.context;
    return this.ctx;
  }

  playNote(note: string, duration = 0.3): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const freq = NOTE_FREQ[note];
    if (!freq) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  playHit(sfxKey: string, note?: string): void {
    // Play a collision sound effect (synthesized click/knock)
    this.playSFX(sfxKey);

    // Play the next note in the jingle buildup
    if (note) {
      this.playNote(note, 0.4);
    }
  }

  private playSFX(key: string): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    switch (key) {
      case 'roll': {
        // Soft rolling sound: low noise burst
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = 120;
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }
      case 'click': {
        // Sharp click for domino hits
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      }
      case 'thwack': {
        // Heavy thwack for lever
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }
      case 'knock': {
        // Knock sound for ball hitting ball
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 500;
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      }
      case 'drop': {
        // Drop into bucket: descending tone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }
    }
  }

  playJingle(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const noteDuration = 0.25;
    const gap = 0.3;

    JINGLE_NOTES.forEach((note, i) => {
      const freq = NOTE_FREQ[note];
      if (!freq) return;

      const startTime = now + i * gap;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + noteDuration);
    });
  }

  reset(): void {
    this.noteIndex = 0;
  }
}
