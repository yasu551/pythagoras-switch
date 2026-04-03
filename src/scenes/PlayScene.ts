import Phaser from 'phaser';
import { CourseBuilder } from '../systems/CourseBuilder';
import { Director } from '../systems/Director';
import { SoundManager } from '../systems/SoundManager';
import { VisualCueManager } from '../systems/VisualCueManager';
import { WORLD } from '../config/course';

export class PlayScene extends Phaser.Scene {
  private courseBuilder!: CourseBuilder;
  private director!: Director;
  private soundManager!: SoundManager;
  private visualCueManager!: VisualCueManager;
  private finaleShown = false;

  constructor() {
    super({ key: 'PlayScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#0a0a0f');
    this.cameras.main.fadeIn(500);

    // Set world bounds for camera
    this.cameras.main.setBounds(0, 0, WORLD.width, WORLD.height);
    this.matter.world.setBounds(0, 0, WORLD.width, WORLD.height);

    // Initialize systems
    this.soundManager = new SoundManager(this);
    this.courseBuilder = new CourseBuilder(this);
    this.director = new Director(this, this.soundManager);

    // Build the course (includes dark background rect)
    this.courseBuilder.build();

    // Visual effects system
    this.visualCueManager = new VisualCueManager(this, this.courseBuilder);
    this.director.setVisualCueManager(this.visualCueManager);

    // Cleanup on scene shutdown (prevents VRAM leaks on restart)
    this.events.on('shutdown', () => {
      this.visualCueManager.destroy();
    });

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
      color: '#00f0ff',
    });
    hudTitle.setScrollFactor(0);
    hudTitle.setDepth(100);
  }

  update(): void {
    this.courseBuilder.update();
    this.visualCueManager.update();
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

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a0f, 0.85);
    overlay.setScrollFactor(0);
    overlay.setDepth(200);
    overlay.setAlpha(0);

    const title = this.add.text(width / 2, height / 2 - 30, 'ピタゴラスイッチ', {
      fontFamily: '"Hiragino Sans", "Noto Sans JP", sans-serif',
      fontSize: '56px',
      fontStyle: 'bold',
      color: '#ffffff',
      letterSpacing: 10,
    }).setOrigin(0.5);
    title.setScrollFactor(0);
    title.setDepth(201);
    title.setAlpha(0);

    // Add glow to title if WebGL
    if (this.renderer.type === Phaser.WEBGL) {
      title.postFX.addGlow(0x00f0ff, 4, 0, false, 0.1, 12);
    }

    const jingleText = this.add.text(width / 2, height / 2 + 40, '♪ ピ・タ・ゴ・ラ・ス・イッ・チ ♪', {
      fontFamily: '"Hiragino Sans", "Noto Sans JP", sans-serif',
      fontSize: '18px',
      color: '#00f0ff',
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
        color: '#00f0ff',
        backgroundColor: '#1a1a2e',
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
        this.cameras.main.fadeOut(500, 10, 10, 15);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.restart();
        });
      });

      btn.on('pointerover', () => {
        btn.setStyle({ color: '#1a1a2e', backgroundColor: '#00f0ff' });
      });
      btn.on('pointerout', () => {
        btn.setStyle({ color: '#00f0ff', backgroundColor: '#1a1a2e' });
      });
    });
  }

  private resetCourse(): void {
    this.scene.restart();
  }
}
