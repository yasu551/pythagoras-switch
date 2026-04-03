import Phaser from 'phaser';
import {
  WORLD,
  BALL,
  BALL2,
  LAUNCHER,
  COURSE_BODIES,
  DOMINOES,
  TRIGGERS,
  type BodyConfig,
} from '../config/course';

export class CourseBuilder {
  private scene: Phaser.Scene;
  ball!: MatterJS.BodyType;
  ball2!: MatterJS.BodyType;
  private bodies: MatterJS.BodyType[] = [];
  private graphics: Phaser.GameObjects.GameObject[] = [];
  flag!: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  build(): void {
    this.buildFloor();
    this.buildCourseElements();
    this.buildDominoes();
    this.buildLauncher();
    this.buildBall();
    this.buildBall2();
    this.buildTriggers();
    this.buildFlag();
  }

  private buildFloor(): void {
    const floor = this.scene.matter.add.rectangle(
      WORLD.width / 2, WORLD.floorY + 15,
      WORLD.width, 30,
      { isStatic: true, label: 'floor', friction: 0.05 }
    );
    this.bodies.push(floor);

    // Visual floor line
    const gfx = this.scene.add.rectangle(
      WORLD.width / 2, WORLD.floorY,
      WORLD.width, 3,
      0xdddddd
    );
    this.graphics.push(gfx);
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

  private drawBody(config: BodyConfig): void {
    const color = this.getColor(config.label ?? '');
    const alpha = config.isStatic ? 1.0 : 0.9;

    if (config.type === 'circle') {
      const circle = this.scene.add.circle(
        config.x, config.y,
        config.radius ?? 10,
        color, alpha
      );
      circle.setStrokeStyle(2, this.getStrokeColor(config.label ?? ''));
      this.graphics.push(circle);
    } else {
      const rect = this.scene.add.rectangle(
        config.x, config.y,
        config.width ?? 100, config.height ?? 10,
        color, alpha
      );
      rect.setStrokeStyle(1.5, this.getStrokeColor(config.label ?? ''));
      if (config.angle) {
        rect.setAngle(config.angle);
      }
      this.graphics.push(rect);
    }
  }

  private getColor(label: string): number {
    if (label === 'ball') return 0xf5c0b0;
    if (label === 'ball2') return 0xb0d0f5;
    if (label.startsWith('domino')) return 0xcccccc;
    if (label.startsWith('ramp')) return 0xdddddd;
    if (label.startsWith('bucket')) return 0xb0d8d8;
    if (label === 'launcher') return 0xe8c88a;
    if (label === 'shelf') return 0xd8d0c0;
    if (label.startsWith('platform')) return 0xddd8d0;
    if (label.startsWith('seesaw')) return 0xd8d0c0;
    return 0xdddddd;
  }

  private getStrokeColor(label: string): number {
    if (label === 'ball') return 0xe85d3a;
    if (label === 'ball2') return 0x3a7ee8;
    if (label.startsWith('domino')) return 0x999999;
    if (label.startsWith('bucket')) return 0x6a9a9a;
    if (label === 'launcher') return 0xc8a060;
    return 0xbbbbbb;
  }

  private buildCourseElements(): void {
    for (const config of COURSE_BODIES) {
      const body = this.createBody(config);
      this.bodies.push(body);
      this.drawBody(config);
    }
  }

  private buildDominoes(): void {
    for (const config of DOMINOES) {
      const body = this.createBody(config);
      this.bodies.push(body);
      this.drawBody(config);
    }
  }

  private buildBall(): void {
    this.ball = this.createBody(BALL);
    this.bodies.push(this.ball);
    // Ball visual is drawn in PlayScene update loop (follows physics)
  }

  private buildBall2(): void {
    this.ball2 = this.createBody(BALL2);
    this.bodies.push(this.ball2);
  }

  private buildLauncher(): void {
    const body = this.createBody(LAUNCHER);
    this.bodies.push(body);
    this.drawBody(LAUNCHER);
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
    const x = 1500;
    const y = 590;

    // Flag body (starts at bottom, will tween upward)
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

  reset(): void {
    // Remove all physics bodies and recreate
    for (const body of this.bodies) {
      this.scene.matter.world.remove(body);
    }
    for (const gfx of this.graphics) {
      gfx.destroy();
    }
    this.bodies = [];
    this.graphics = [];
    if (this.flag) this.flag.destroy();
    this.build();
  }
}
