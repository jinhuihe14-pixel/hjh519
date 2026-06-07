import Phaser from 'phaser';
import { ConfigManager } from '../config/ConfigManager';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.cameras.main;

    this.add.rectangle(width / 2, height / 2, width, height, 0x667eea);

    this.add.text(width / 2, height * 0.2, '三消小游戏', {
      font: 'bold 48px Arial',
      color: '#ffffff',
      stroke: '#333333',
      strokeThickness: 4,
    }).setOrigin(0.5);

    const config = ConfigManager.getInstance().getConfig();
    if (config) {
      this.add.text(width / 2, height * 0.3, `配置版本: ${config.version}`, {
        font: '16px Arial',
        color: '#dddddd',
      }).setOrigin(0.5);
    }

    const startButton = this.add.text(width / 2, height * 0.5, '开始游戏', {
      font: 'bold 32px Arial',
      color: '#ffffff',
      backgroundColor: '#ff6b6b',
      padding: { x: 40, y: 15 },
    }).setOrigin(0.5).setInteractive();

    startButton.on('pointerover', () => {
      startButton.setBackgroundColor('#ee5a5a');
    });

    startButton.on('pointerout', () => {
      startButton.setBackgroundColor('#ff6b6b');
    });

    startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    const events = ConfigManager.getInstance().getActiveEvents();
    if (events.length > 0) {
      this.add.text(width / 2, height * 0.65, `🎁 当前活动: ${events[0].name}`, {
        font: '18px Arial',
        color: '#ffd700',
      }).setOrigin(0.5);
    }

    this.add.text(width / 2, height * 0.8, '点击开始游戏体验三消乐趣！', {
      font: '16px Arial',
      color: '#cccccc',
    }).setOrigin(0.5);
  }
}
