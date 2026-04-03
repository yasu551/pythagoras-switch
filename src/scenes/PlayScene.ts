import Phaser from 'phaser';
import { CourseBuilder } from '../systems/CourseBuilder';
import { Director } from '../systems/Director';
import { SoundManager } from '../systems/SoundManager';
import { WORLD } from '../config/course';

export class PlayScene extends Phaser.Scene {
  private courseBuilder!: CourseBuilder;
  private director!: Director;
  private soundManager!: SoundManager;
  private finaleShown = false;

  constructor() {
    super({ key: 'PlayScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#faf7f2');
    this.cameras.main.fadeIn(500);

    // Full-world background
    this.add.rectangle(WORLD.width / 2, WORLD.height / 2, WORLD.width, WORLD.height, 0xfaf7f2);

    // Set world bounds for camera
    this.cameras.main.setBounds(0, 0, WORLD.width, WORLD.height);
    this.matter.world.setBounds(0, 0, WORLD.width, WORLD.height);

    // Initialize systems
    this.soundManager = new SoundManager(this);
    this.courseBuilder = new CourseBuilder(this);
    this.director = new Director(this, this.soundManager);

    // Build the course
    this.courseBuilder.build();

    // HUD
    this.createHUD();

    // Camera starts following the ball, then Director takes over on first trigger
    this.cameras.main.setZoom(1.1);
    this.cameras.main.startFollow(
      this.courseBuilder.ballGraphic,
      false,
      0.05, 0.05,  // smooth lerp
      0, 80        // offset: look slightly ahead and below
    );

    // Director callbacks
    this.director.onFinish = () => this.showFinale();
    this.director.onReset = () => this.resetCourse();

    // Start the director
    this.director.start();
  }

  private createHUD(): void {
    const hudTitle = this.add.text(20, 15, 'ピタゴラスイッチ', {
      fontFamily: '"Hiragino Sans", "Noto Sans JP", sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#e85d3a',
    });
    hudTitle.setScrollFactor(0);
    hudTitle.setDepth(100);
  }

  update(): void {
    this.courseBuilder.update();
  }

  private showFinale(): void {
    if (this.finaleShown) return;
    this.finaleShown = true;

    this.courseBuilder.raiseFlag();

    this.time.delayedCall(500, () => {
      this.soundManager.playJingle();
    });

    this.time.delayedCall(3000, () => {
      this.showFinaleOverlay();
    });
  }

  private showFinaleOverlay(): void {
    const { width, height } = this.scale;

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0xf5f0e8, 0.85);
    overlay.setScrollFactor(0);
    overlay.setDepth(200);
    overlay.setAlpha(0);

    const title = this.add.text(width / 2, height / 2 - 30, 'ピタゴラスイッチ', {
      fontFamily: '"Hiragino Sans", "Noto Sans JP", sans-serif',
      fontSize: '56px',
      fontStyle: 'bold',
      color: '#e85d3a',
      letterSpacing: 10,
    }).setOrigin(0.5);
    title.setScrollFactor(0);
    title.setDepth(201);
    title.setAlpha(0);

    const jingleText = this.add.text(width / 2, height / 2 + 40, '♪ ピ・タ・ゴ・ラ・ス・イッ・チ ♪', {
      fontFamily: '"Hiragino Sans", "Noto Sans JP", sans-serif',
      fontSize: '18px',
      color: '#999999',
      letterSpacing: 3,
    }).setOrigin(0.5);
    jingleText.setScrollFactor(0);
    jingleText.setDepth(201);
    jingleText.setAlpha(0);

    this.tweens.add({
      targets: overlay,
      alpha: 0.85,
      duration: 800,
      ease: 'Sine.easeOut',
    });

    this.tweens.add({
      targets: [title, jingleText],
      alpha: 1,
      duration: 1000,
      delay: 400,
      ease: 'Sine.easeOut',
    });

    this.time.delayedCall(3000, () => {
      const btn = this.add.text(width / 2, height / 2 + 120, 'もう一度', {
        fontFamily: '"Hiragino Sans", "Noto Sans JP", sans-serif',
        fontSize: '20px',
        color: '#e85d3a',
        backgroundColor: '#ffffff',
        padding: { x: 24, y: 12 },
      }).setOrigin(0.5);
      btn.setScrollFactor(0);
      btn.setDepth(202);
      btn.setAlpha(0);
      btn.setInteractive({ useHandCursor: true });

      this.tweens.add({
        targets: btn,
        alpha: 1,
        duration: 500,
        ease: 'Sine.easeOut',
      });

      btn.on('pointerdown', () => {
        this.cameras.main.fadeOut(500, 245, 240, 232);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.restart();
        });
      });

      btn.on('pointerover', () => {
        btn.setStyle({ color: '#ffffff', backgroundColor: '#e85d3a' });
      });
      btn.on('pointerout', () => {
        btn.setStyle({ color: '#e85d3a', backgroundColor: '#ffffff' });
      });
    });
  }

  private resetCourse(): void {
    this.scene.restart();
  }
}
