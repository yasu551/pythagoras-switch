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
    const floor = this.scene.matter.add.rectangle(
      WORLD.width / 2, WORLD.floorY + 15,
      WORLD.width, 30,
      { isStatic: true, label: 'floor', friction: 0.05 }
    );
    this.staticBodies.push(floor);

    const gfx = this.scene.add.rectangle(
      WORLD.width / 2, WORLD.floorY,
      WORLD.width, 3,
      0xdddddd
    );
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

    if (config.type === 'circle') {
      const circle = this.scene.add.circle(
        config.x, config.y,
        config.radius ?? 10,
        color, alpha
      );
      circle.setStrokeStyle(2, this.getStrokeColor(config.label ?? ''));
      return circle;
    }

    const rect = this.scene.add.rectangle(
      config.x, config.y,
      config.width ?? 100, config.height ?? 10,
      color, alpha
    );
    rect.setStrokeStyle(1.5, this.getStrokeColor(config.label ?? ''));
    if (config.angle) {
      rect.setAngle(config.angle);
    }
    return rect;
  }

  private getColor(label: string): number {
    if (label === 'ball') return 0xf5c0b0;
    if (label.startsWith('domino')) return 0xcccccc;
    if (label.startsWith('ramp')) return 0xdddddd;
    if (label.startsWith('bucket')) return 0xb0d8d8;
    if (label.startsWith('platform')) return 0xddd8d0;
    return 0xdddddd;
  }

  private getStrokeColor(label: string): number {
    if (label === 'ball') return 0xe85d3a;
    if (label.startsWith('domino')) return 0x999999;
    if (label.startsWith('bucket')) return 0x6a9a9a;
    return 0xbbbbbb;
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
    }
  }

  private buildDominoes(): void {
    for (const config of DOMINOES) {
      const body = this.createBody(config);
      const graphic = this.createGraphic(config);
      this.dynamicPairs.push({ body, graphic });
    }
  }

  private buildBall(): void {
    this.ball = this.createBody(BALL);
    this.ballGraphic = this.scene.add.circle(
      BALL.x, BALL.y,
      BALL.radius ?? 15, 0xf5c0b0
    );
    this.ballGraphic.setStrokeStyle(2.5, 0xe85d3a);
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

    const flagBg = this.scene.add.rectangle(0, 0, 100, 50, 0xffeedd);
    flagBg.setStrokeStyle(2, 0xe85d3a);

    const flagText = this.scene.add.text(0, 0, 'ピタゴラスイッチ', {
      fontFamily: '"Hiragino Sans", "Noto Sans JP", sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#e85d3a',
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
}
