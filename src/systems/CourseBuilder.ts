import Phaser from 'phaser';
import {
  WORLD,
  BALL,
  COURSE_BODIES,
  DOMINOES,
  TRIGGERS,
  type BodyConfig,
} from '../config/course';

interface DynamicPair {
  body: MatterJS.BodyType;
  graphic: Phaser.GameObjects.Shape;
}

export class CourseBuilder {
  private scene: Phaser.Scene;
  ball!: MatterJS.BodyType;
  ballGraphic!: Phaser.GameObjects.Arc;
  private staticBodies: MatterJS.BodyType[] = [];
  private staticGraphics: Phaser.GameObjects.GameObject[] = [];
  private dynamicPairs: DynamicPair[] = [];
  private dominoGraphics: Phaser.GameObjects.Shape[] = [];
  private rampGraphics: Phaser.GameObjects.Shape[] = [];
  private bucketGraphics: Phaser.GameObjects.Shape[] = [];
  private bgRect: Phaser.GameObjects.Rectangle | null = null;
  flag!: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  build(): void {
    this.buildFloor();
    this.buildCourseElements();
    this.buildDominoes();
    this.buildBall();
    this.buildTriggers();
    this.buildFlag();
  }

  /** Call every frame to sync dynamic body graphics */
  update(): void {
    // Ball
    if (this.ball && this.ballGraphic) {
      this.ballGraphic.setPosition(this.ball.position.x, this.ball.position.y);
    }
    // Dominoes and other dynamic bodies
    for (const pair of this.dynamicPairs) {
      pair.graphic.setPosition(pair.body.position.x, pair.body.position.y);
      pair.graphic.setRotation(pair.body.angle);
    }
  }

  private buildFloor(): void {
    // Dark background rectangle (full world)
    this.bgRect = this.scene.add.rectangle(
      WORLD.width / 2, WORLD.height / 2,
      WORLD.width, WORLD.height,
      0x0a0a0f
    );

    const floor = this.scene.matter.add.rectangle(
      WORLD.width / 2, WORLD.floorY + 15,
      WORLD.width, 30,
      { isStatic: true, label: 'floor', friction: 0.05 }
    );
    this.staticBodies.push(floor);

    const gfx = this.scene.add.rectangle(
      WORLD.width / 2, WORLD.floorY,
      WORLD.width, 3,
      0x1a1a2e
    );
    gfx.setStrokeStyle(1, 0x333344);
    this.staticGraphics.push(gfx);
  }

  private createBody(config: BodyConfig): MatterJS.BodyType {
    const opts: Phaser.Types.Physics.Matter.MatterBodyConfig = {
      isStatic: config.isStatic ?? false,
      label: config.label ?? '',
      friction: config.friction ?? 0.1,
      restitution: config.restitution ?? 0.1,
      density: config.density ?? 0.001,
      angle: config.angle ? Phaser.Math.DegToRad(config.angle) : 0,
    };

    if (config.type === 'circle') {
      return this.scene.matter.add.circle(
        config.x, config.y,
        config.radius ?? 10,
        opts
      );
    }

    return this.scene.matter.add.rectangle(
      config.x, config.y,
      config.width ?? 100, config.height ?? 10,
      opts
    );
  }

  private createGraphic(config: BodyConfig): Phaser.GameObjects.Shape {
    const color = this.getColor(config.label ?? '');
    const alpha = config.isStatic ? 1.0 : 0.9;

    const strokeColor = this.getStrokeColor(config.label ?? '');
    const strokeWidth = 2.5; // thicker outlines for dark stage

    if (config.type === 'circle') {
      const circle = this.scene.add.circle(
        config.x, config.y,
        config.radius ?? 10,
        color, alpha
      );
      circle.setStrokeStyle(strokeWidth, strokeColor);
      return circle;
    }

    const rect = this.scene.add.rectangle(
      config.x, config.y,
      config.width ?? 100, config.height ?? 10,
      color, alpha
    );
    rect.setStrokeStyle(strokeWidth, strokeColor);
    if (config.angle) {
      rect.setAngle(config.angle);
    }
    return rect;
  }

  private getColor(label: string): number {
    if (label === 'ball') return 0xff3366;       // hot coral
    if (label.startsWith('domino')) return 0x2a2a40;
    if (label.startsWith('ramp')) return 0x1a2a3a;
    if (label.startsWith('bucket')) return 0x2a1a2a;
    if (label.startsWith('platform')) return 0x1a2a3a;
    if (label === 'flag-pole') return 0x1a2a3a;
    return 0x1a1a2e;
  }

  private getStrokeColor(label: string): number {
    if (label === 'ball') return 0xff3366;
    if (label.startsWith('domino')) return 0xe8ff00; // acid yellow
    if (label.startsWith('ramp')) return 0x00f0ff;   // cyan
    if (label.startsWith('platform')) return 0x00f0ff;
    if (label.startsWith('bucket')) return 0xff3366;  // coral
    if (label === 'flag-pole') return 0x333344;
    return 0x333344;
  }

  private buildCourseElements(): void {
    for (const config of COURSE_BODIES) {
      const body = this.createBody(config);
      const graphic = this.createGraphic(config);

      if (config.isStatic !== false) {
        this.staticBodies.push(body);
        this.staticGraphics.push(graphic);
      } else {
        this.dynamicPairs.push({ body, graphic });
      }

      // Track graphics for visual cue effects
      if (config.label?.startsWith('ramp') || config.label?.startsWith('platform')) {
        this.rampGraphics.push(graphic);
      }
      if (config.label?.startsWith('bucket')) {
        this.bucketGraphics.push(graphic);
      }
    }
  }

  private buildDominoes(): void {
    for (const config of DOMINOES) {
      const body = this.createBody(config);
      const graphic = this.createGraphic(config);
      this.dynamicPairs.push({ body, graphic });
      this.dominoGraphics.push(graphic);
    }
  }

  private buildBall(): void {
    this.ball = this.createBody(BALL);
    this.ballGraphic = this.scene.add.circle(
      BALL.x, BALL.y,
      BALL.radius ?? 15, 0xff3366 // hot coral
    );
    this.ballGraphic.setStrokeStyle(2.5, 0xffffff);
  }

  private buildTriggers(): void {
    for (const trigger of TRIGGERS) {
      this.scene.matter.add.rectangle(
        trigger.x, trigger.y,
        trigger.width, trigger.height,
        {
          isStatic: true,
          isSensor: true,
          label: trigger.label,
        }
      );
    }
  }

  private buildFlag(): void {
    const x = 1380;
    const y = 590;

    const flagBg = this.scene.add.rectangle(0, 0, 100, 50, 0x1a1a2e);
    flagBg.setStrokeStyle(2, 0x00f0ff);

    const flagText = this.scene.add.text(0, 0, 'ピタゴラスイッチ', {
      fontFamily: '"Hiragino Sans", "Noto Sans JP", sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#00f0ff',
    }).setOrigin(0.5);

    this.flag = this.scene.add.container(x + 50, y, [flagBg, flagText]);
    this.flag.setAlpha(0.3);
  }

  raiseFlag(): Phaser.Tweens.Tween {
    return this.scene.tweens.add({
      targets: this.flag,
      y: this.flag.y - 130,
      alpha: 1,
      duration: 2000,
      ease: 'Sine.easeOut',
    });
  }

  getDominoGraphics(): Phaser.GameObjects.Shape[] {
    return this.dominoGraphics;
  }

  getRampGraphics(): Phaser.GameObjects.Shape[] {
    return this.rampGraphics;
  }

  getBackgroundRect(): Phaser.GameObjects.Rectangle | null {
    return this.bgRect;
  }

  getBucketGraphics(): Phaser.GameObjects.Shape[] {
    return this.bucketGraphics;
  }
}
