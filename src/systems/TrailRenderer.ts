import Phaser from 'phaser';

/**
 * Draws a persistent glowing trail behind the ball using a chain of
 * circle game objects in world space. Simple, works on both Canvas
 * and WebGL, and follows the ball regardless of camera movement.
 */

interface TrailDot {
  circle: Phaser.GameObjects.Arc;
  birth: number;
}

const MAX_DOTS = 120;
const DOT_INTERVAL = 16; // ms between dots
const DOT_LIFETIME = 2000; // ms before full fade

export class TrailRenderer {
  private scene: Phaser.Scene;
  private dots: TrailDot[] = [];
  private frozen = false;
  private trailColor = 0x00f0ff;
  private dotRadius = 8;
  private lastDotTime = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  setColor(color: number): void {
    this.trailColor = color;
  }

  setRadius(radius: number): void {
    this.dotRadius = radius;
  }

  freeze(): void {
    this.frozen = true;
  }

  update(ballX: number, ballY: number): void {
    const now = this.scene.time.now;

    // Spawn new dot
    if (!this.frozen && now - this.lastDotTime >= DOT_INTERVAL) {
      const circle = this.scene.add.circle(ballX, ballY, this.dotRadius, this.trailColor, 0.7);
      circle.setDepth(-1);
      this.dots.push({ circle, birth: now });
      this.lastDotTime = now;

      // Cap the total count
      if (this.dots.length > MAX_DOTS) {
        const old = this.dots.shift()!;
        old.circle.destroy();
      }
    }

    // Fade existing dots
    for (let i = this.dots.length - 1; i >= 0; i--) {
      const dot = this.dots[i];
      const age = now - dot.birth;

      if (!this.frozen && age > DOT_LIFETIME) {
        dot.circle.destroy();
        this.dots.splice(i, 1);
        continue;
      }

      // Fade alpha based on age
      if (!this.frozen) {
        const life = Math.max(0, 1 - age / DOT_LIFETIME);
        dot.circle.setAlpha(life * 0.7);
        // Shrink slightly as it ages
        const scale = 0.4 + life * 0.6;
        dot.circle.setScale(scale);
      }
    }
  }

  destroy(): void {
    for (const dot of this.dots) {
      dot.circle.destroy();
    }
    this.dots = [];
  }
}
