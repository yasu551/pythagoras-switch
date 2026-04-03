import Phaser from 'phaser';
import { HomeScene } from './scenes/HomeScene';
import { PlayScene } from './scenes/PlayScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#0a0a0f',
  parent: document.body,
  physics: {
    default: 'matter',
    matter: {
      gravity: { x: 0, y: 2 },
      debug: window.location.search.includes('debug'),
      enableSleeping: false,
    },
  },
  scene: [HomeScene, PlayScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

const game = new Phaser.Game(config);

// Debug: expose game instance and allow skipping to PlayScene via ?play
(window as any).__game = game;
if (window.location.search.includes('play')) {
  game.events.once('ready', () => {
    game.scene.start('PlayScene');
    game.scene.stop('HomeScene');
  });
}
