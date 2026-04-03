import Phaser from 'phaser';
import { TrailRenderer } from './TrailRenderer';
import { CourseBuilder } from './CourseBuilder';

// Neon palette
const CYAN = 0x00f0ff;
const YELLOW = 0xe8ff00;
const CORAL = 0xff3366;
const WHITE = 0xffffff;

export class VisualCueManager {
  private scene: Phaser.Scene;
  private courseBuilder: CourseBuilder;
  private trailRenderer: TrailRenderer;
  private isWebGL: boolean;

  // Post-FX handles (WebGL only)
  private ballGlow: Phaser.FX.Glow | null = null;
  private cameraBloom: Phaser.FX.Bloom | null = null;

  // Particle textures
  private texturesCreated = false;

  // Ball aura ring
  private ballAura!: Phaser.GameObjects.Arc;

  constructor(scene: Phaser.Scene, courseBuilder: CourseBuilder) {
    this.scene = scene;
    this.courseBuilder = courseBuilder;
    this.isWebGL = scene.renderer.type === Phaser.WEBGL;

    this.trailRenderer = new TrailRenderer(scene);
    this.createParticleTextures();
    this.initPostFX();
    this.createBallAura();
  }

  private createParticleTextures(): void {
    if (this.texturesCreated) return;

    // Larger particle for big bursts
    const dotGfx = this.scene.make.graphics({ x: 0, y: 0 }, false);
    dotGfx.fillStyle(0xffffff);
    dotGfx.fillCircle(6, 6, 6);
    dotGfx.generateTexture('particle-dot', 12, 12);
    dotGfx.destroy();

    // Square sparkle
    const rectGfx = this.scene.make.graphics({ x: 0, y: 0 }, false);
    rectGfx.fillStyle(0xffffff);
    rectGfx.fillRect(0, 0, 6, 6);
    rectGfx.generateTexture('particle-rect', 6, 6);
    rectGfx.destroy();

    this.texturesCreated = true;
  }

  /** Pulsing outer ring around the ball — always visible */
  private createBallAura(): void {
    this.ballAura = this.scene.add.circle(0, 0, 30, CORAL, 0);
    this.ballAura.setStrokeStyle(3, CORAL, 0.5);
    this.ballAura.setDepth(10);

    // Pulsing animation
    this.scene.tweens.add({
      targets: this.ballAura,
      scaleX: 1.6,
      scaleY: 1.6,
      alpha: 0,
      duration: 800,
      repeat: -1,
      ease: 'Sine.easeOut',
      onRepeat: () => {
        this.ballAura.setScale(1);
        this.ballAura.setAlpha(0.5);
      },
    });
  }

  private initPostFX(): void {
    if (!this.isWebGL) return;

    // Ball glow
    this.ballGlow = this.courseBuilder.ballGraphic.postFX.addGlow(
      CORAL, 8, 0, false, 0.1, 16
    );

    // Camera bloom — created inactive
    this.cameraBloom = this.scene.cameras.main.postFX.addBloom(
      WHITE, 1, 1, 1, 0
    );
    this.cameraBloom.setActive(false);
  }

  onTrigger(label: string): void {
    switch (label) {
      case 'trigger-ramp1-start':
        this.fireCue1_Launch();
        break;
      case 'trigger-domino-start':
        this.fireCue2_DominoChain();
        break;
      case 'trigger-domino-end':
        this.fireCue3_DominoExit();
        break;
      case 'trigger-ramp3':
        this.fireCue4_FinalRamp();
        break;
      case 'trigger-bucket':
        this.fireCue5_Finale();
        break;
    }
  }

  update(): void {
    if (!this.courseBuilder.ball) return;
    const pos = this.courseBuilder.ball.position;
    this.trailRenderer.update(pos.x, pos.y);

    // Aura follows ball
    this.ballAura.setPosition(pos.x, pos.y);
  }

  // ── Cue 1: Ball Launch ──────────────────────────────────
  private fireCue1_Launch(): void {
    this.trailRenderer.setColor(CYAN);
    this.updateAuraColor(CYAN);

    // Expanding ring at ball position
    this.spawnRing(this.courseBuilder.ball.position.x, this.courseBuilder.ball.position.y, CYAN);
  }

  // ── Cue 2: Domino Chain ──────────────────────────────────
  private fireCue2_DominoChain(): void {
    this.trailRenderer.setColor(YELLOW);
    this.updateAuraColor(YELLOW);

    const ball = this.courseBuilder.ball;

    // BIG expanding ring
    this.spawnRing(ball.position.x, ball.position.y, YELLOW, 200);

    // Screen flash
    this.screenFlash(YELLOW, 0.3, 200);

    // Particle burst — LARGE
    this.scene.add.particles(ball.position.x, ball.position.y, 'particle-rect', {
      speed: { min: 150, max: 350 },
      angle: { min: 0, max: 360 },
      lifespan: 600,
      tint: [YELLOW, WHITE],
      scale: { start: 2, end: 0 },
      emitting: false,
    }).explode(40, ball.position.x, ball.position.y);

    // Flash domino outlines bright white
    for (const gfx of this.courseBuilder.getDominoGraphics()) {
      const rect = gfx as Phaser.GameObjects.Rectangle;
      rect.setStrokeStyle(4, WHITE);
      rect.setFillStyle(YELLOW, 0.3);
      this.scene.time.delayedCall(300, () => {
        rect.setStrokeStyle(2.5, YELLOW);
        rect.setFillStyle(0x1a1a2e, 0.9);
      });
    }

    // Bloom pulse
    this.pulseBloom(2.0, 600);
  }

  // ── Cue 3: Domino Exit ──────────────────────────────────
  private fireCue3_DominoExit(): void {
    this.trailRenderer.setColor(CORAL);
    this.updateAuraColor(CORAL);

    const ball = this.courseBuilder.ball;
    this.spawnRing(ball.position.x, ball.position.y, CORAL, 150);

    // Particles burst outward
    this.scene.add.particles(ball.position.x, ball.position.y, 'particle-dot', {
      speed: { min: 200, max: 400 },
      angle: { min: 0, max: 360 },
      lifespan: 500,
      tint: [CORAL, WHITE],
      scale: { start: 1.5, end: 0 },
      emitting: false,
    }).explode(30, ball.position.x, ball.position.y);

    this.screenFlash(CORAL, 0.2, 150);
  }

  // ── Cue 4: Final Ramp ──────────────────────────────────
  private fireCue4_FinalRamp(): void {
    this.trailRenderer.setColor(WHITE);
    this.trailRenderer.setRadius(14);
    this.updateAuraColor(WHITE);

    const ball = this.courseBuilder.ball;
    this.spawnRing(ball.position.x, ball.position.y, WHITE, 180);

    // Brighten all ramps
    for (const gfx of this.courseBuilder.getRampGraphics()) {
      const rect = gfx as Phaser.GameObjects.Rectangle;
      rect.setStrokeStyle(4, WHITE);
      rect.setFillStyle(CYAN, 0.15);
    }

    // Speed line particles following ball
    const speedEmitter = this.scene.add.particles(0, 0, 'particle-dot', {
      speed: { min: 300, max: 500 },
      lifespan: 150,
      frequency: 25,
      quantity: 4,
      tint: WHITE,
      scale: { start: 1, end: 0 },
      angle: { min: -10, max: 10 },
    });

    const updateEvent = this.scene.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        if (!ball?.velocity) return;
        speedEmitter.setPosition(ball.position.x, ball.position.y);
        const angle = Math.atan2(ball.velocity.y, ball.velocity.x) * (180 / Math.PI) + 180;
        speedEmitter.setEmitterAngle({ min: angle - 15, max: angle + 15 });
      },
    });

    this.scene.time.delayedCall(3000, () => {
      speedEmitter.stop();
      updateEvent.destroy();
    });

    // Subtle background shift
    const bgRect = this.courseBuilder.getBackgroundRect();
    if (bgRect) {
      this.scene.tweens.add({
        targets: bgRect,
        fillColor: 0x0a0a2a,
        duration: 1000,
      });
    }

    this.pulseBloom(1.5, 500);
  }

  // ── Cue 5: Bucket Catch + Finale ──────────────────────────
  private fireCue5_Finale(): void {
    this.trailRenderer.freeze();

    const bucketX = 1200;
    const bucketY = 590;

    // BIG screen flash — white
    this.screenFlash(WHITE, 0.7, 300);

    // Multiple expanding rings
    this.spawnRing(bucketX, bucketY, CYAN, 300);
    this.scene.time.delayedCall(150, () => this.spawnRing(bucketX, bucketY, CORAL, 250));
    this.scene.time.delayedCall(300, () => this.spawnRing(bucketX, bucketY, YELLOW, 200));

    // LARGE particle fountain
    const colors = [CYAN, YELLOW, CORAL, WHITE];
    this.scene.add.particles(bucketX, bucketY, 'particle-dot', {
      speed: { min: 250, max: 500 },
      angle: { min: -130, max: -50 },
      lifespan: 1200,
      gravityY: 250,
      tint: colors,
      scale: { start: 2.5, end: 0 },
      emitting: false,
    }).explode(100, bucketX, bucketY);

    // Bloom explosion
    this.pulseBloom(3.0, 1000);

    // Make the ball itself pulse big at the end
    this.scene.tweens.add({
      targets: this.courseBuilder.ballGraphic,
      scaleX: 2,
      scaleY: 2,
      duration: 300,
      yoyo: true,
      repeat: 2,
      ease: 'Sine.easeInOut',
    });

    // Brighten bucket walls
    for (const gfx of this.courseBuilder.getBucketGraphics()) {
      const rect = gfx as Phaser.GameObjects.Rectangle;
      rect.setStrokeStyle(4, WHITE);
      rect.setFillStyle(CORAL, 0.3);
    }

    // Flag glow
    if (this.isWebGL && this.courseBuilder.flag) {
      this.courseBuilder.flag.each((child: Phaser.GameObjects.GameObject) => {
        if ('postFX' in child) {
          (child as Phaser.GameObjects.Shape).postFX.addGlow(CYAN, 8, 0, false, 0.1, 16);
        }
      });
    }
  }

  // ── Visual Primitives ────────────────────────────────────

  /** Expanding ring effect at a world position — works on Canvas and WebGL */
  private spawnRing(x: number, y: number, color: number, maxRadius = 120): void {
    const ring = this.scene.add.circle(x, y, 10, color, 0);
    ring.setStrokeStyle(4, color, 0.9);
    ring.setDepth(20);

    this.scene.tweens.add({
      targets: ring,
      scaleX: maxRadius / 10,
      scaleY: maxRadius / 10,
      alpha: 0,
      duration: 600,
      ease: 'Sine.easeOut',
      onUpdate: () => {
        // Thin the stroke as it expands
        const scale = ring.scaleX;
        ring.setStrokeStyle(Math.max(1, 4 / scale), color, ring.alpha);
      },
      onComplete: () => ring.destroy(),
    });
  }

  /** Full-screen color flash — works on Canvas and WebGL */
  private screenFlash(color: number, maxAlpha: number, duration: number): void {
    const { width, height } = this.scene.scale;
    const flash = this.scene.add.rectangle(width / 2, height / 2, width, height, color, 0);
    flash.setScrollFactor(0);
    flash.setDepth(50);

    this.scene.tweens.add({
      targets: flash,
      alpha: maxAlpha,
      duration: duration / 2,
      yoyo: true,
      ease: 'Sine.easeOut',
      onComplete: () => flash.destroy(),
    });
  }

  private pulseBloom(strength: number, duration: number): void {
    if (!this.cameraBloom) return;
    this.cameraBloom.setActive(true);
    this.cameraBloom.strength = 0;
    this.scene.tweens.add({
      targets: this.cameraBloom,
      strength,
      duration: duration / 2,
      yoyo: true,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        if (this.cameraBloom) {
          this.cameraBloom.strength = 0;
          this.cameraBloom.setActive(false);
        }
      },
    });
  }

  private updateAuraColor(color: number): void {
    this.ballAura.setStrokeStyle(3, color, 0.5);
    if (this.ballGlow) {
      this.ballGlow.color = color;
    }
  }

  destroy(): void {
    this.trailRenderer.destroy();
    this.ballAura.destroy();

    if (this.ballGlow) {
      this.courseBuilder.ballGraphic.postFX.remove(this.ballGlow);
    }
    if (this.cameraBloom) {
      this.scene.cameras.main.postFX.remove(this.cameraBloom);
    }
  }
}
