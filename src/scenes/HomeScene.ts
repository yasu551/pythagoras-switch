import Phaser from 'phaser';

export class HomeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HomeScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    // Dark background
    this.cameras.main.setBackgroundColor('#0a0a0f');

    // Decorative circle with neon glow
    const circle = this.add.circle(width / 2, height / 2, 150);
    circle.setStrokeStyle(2, 0x00f0ff, 0.3);

    // Title
    const title = this.add.text(width / 2, height / 2 - 80, 'ピタゴラスイッチ', {
      fontFamily: '"Hiragino Sans", "Noto Sans JP", sans-serif',
      fontSize: '52px',
      fontStyle: 'bold',
      color: '#ffffff',
      letterSpacing: 8,
    }).setOrigin(0.5);

    // Add glow to title if WebGL
    if (this.renderer.type === Phaser.WEBGL) {
      title.postFX.addGlow(0x00f0ff, 4, 0, false, 0.1, 12);
    }

    // Subtitle
    this.add.text(width / 2, height / 2 - 30, 'PYTHAGORAS SWITCH', {
      fontFamily: 'sans-serif',
      fontSize: '14px',
      color: '#00f0ff',
      letterSpacing: 4,
    }).setOrigin(0.5);

    // Start button
    const btnRadius = 60;
    const btnX = width / 2;
    const btnY = height / 2 + 80;

    // Button shadow (subtle neon)
    this.add.circle(btnX, btnY + 4, btnRadius, 0xff3366, 0.15);

    // Button body
    const btn = this.add.circle(btnX, btnY, btnRadius, 0xff3366);
    btn.setStrokeStyle(4, 0x00f0ff);
    btn.setInteractive({ useHandCursor: true });

    // Add glow to button if WebGL
    if (this.renderer.type === Phaser.WEBGL) {
      btn.postFX.addGlow(0xff3366, 4, 0, false, 0.1, 12);
    }

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

      // Fade out to dark
      this.cameras.main.fadeOut(500, 10, 10, 15);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('PlayScene');
      });
    });
  }
}
