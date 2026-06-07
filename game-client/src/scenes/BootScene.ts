import Phaser from 'phaser';
import { ConfigManager } from '../config/ConfigManager';

export class BootScene extends Phaser.Scene {
  private loadingText!: Phaser.GameObjects.Text;

  constructor() {
    super('BootScene');
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    this.loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: '加载配置中...',
      style: {
        font: '20px monospace',
        color: '#ffffff',
      },
    });
    this.loadingText.setOrigin(0.5);

    const percentText = this.make.text({
      x: width / 2,
      y: height / 2,
      text: '0%',
      style: {
        font: '18px monospace',
        color: '#ffffff',
      },
    });
    percentText.setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      percentText.setText(`${(value * 100).toFixed(0)}%`);
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      this.loadingText.destroy();
      percentText.destroy();
    });
  }

  async create() {
    this.loadingText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      '正在加载游戏配置...',
      { font: '24px Arial', color: '#ffffff' }
    ).setOrigin(0.5);

    try {
      await ConfigManager.getInstance().loadConfig();
      this.scene.start('MenuScene');
    } catch (error) {
      console.error('Failed to load config:', error);
      this.loadingText.setText('配置加载失败，使用默认配置');
      this.time.delayedCall(1500, () => {
        this.scene.start('MenuScene');
      });
    }
  }
}
