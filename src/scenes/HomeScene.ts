import Phaser from 'phaser';

export class HomeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HomeScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    // Background
    this.cameras.main.setBackgroundColor('#f5f0e8');

    // Decorative circle
    const circle = this.add.circle(width / 2, height / 2, 150);
    circle.setStrokeStyle(2, 0xcccccc, 0.3);

    // Title
    this.add.text(width / 2, height / 2 - 80, 'ピタゴラスイッチ', {
      fontFamily: '"Hiragino Sans", "Noto Sans JP", sans-serif',
      fontSize: '52px',
      fontStyle: 'bold',
      color: '#e85d3a',
      letterSpacing: 8,
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, height / 2 - 30, 'PYTHAGORAS SWITCH', {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      color: '#999999',
      letterSpacing: 4,
    }).setOrigin(0.5);

    // Start button
    const btnRadius = 60;
    const btnX = width / 2;
    const btnY = height / 2 + 80;

    // Button shadow
    this.add.circle(btnX, btnY + 4, btnRadius, 0xe85d3a, 0.2);

    // Button body
    const btn = this.add.circle(btnX, btnY, btnRadius, 0xe85d3a);
    btn.setStrokeStyle(4, 0xc4492d);
    btn.setInteractive({ useHandCursor: true });

    // Button text
    const btnText = this.add.text(btnX, btnY, 'スタート', {
      fontFamily: '"Hiragino Sans", "Noto Sans JP", sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ffffff',
      letterSpacing: 2,
    }).setOrigin(0.5);

    // Hover effect
    btn.on('pointerover', () => {
      this.tweens.add({
        targets: [btn, btnText],
        scaleX: 1.08,
        scaleY: 1.08,
        duration: 150,
        ease: 'Sine.easeOut',
      });
    });

    btn.on('pointerout', () => {
      this.tweens.add({
        targets: [btn, btnText],
        scaleX: 1,
        scaleY: 1,
        duration: 150,
        ease: 'Sine.easeOut',
      });
    });

    // Click to start
    btn.on('pointerdown', () => {
      // Resume AudioContext (browser requirement)
      const snd = this.sound as Phaser.Sound.WebAudioSoundManager;
      if (snd.context && snd.context.state === 'suspended') {
        snd.context.resume();
      }

      // Fade out and transition
      this.cameras.main.fadeOut(500, 245, 240, 232);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('PlayScene');
      });
    });
  }
}
