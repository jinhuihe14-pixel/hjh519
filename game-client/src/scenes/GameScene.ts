import Phaser from 'phaser';
import { ConfigManager, LevelConfig } from '../config/ConfigManager';

const GRID_SIZE = 8;
const CELL_SIZE = 50;
const GEM_TYPES = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
const GEM_COLORS: Record<string, number> = {
  red: 0xff6b6b,
  blue: 0x4ecdc4,
  green: 0x95e1a3,
  yellow: 0xffe66d,
  purple: 0xa29bfe,
  orange: 0xffa07a,
};

interface Gem {
  type: string;
  sprite: Phaser.GameObjects.Sprite;
  row: number;
  col: number;
}

export class GameScene extends Phaser.Scene {
  private grid: (Gem | null)[][] = [];
  private selectedGem: Gem | null = null;
  private score = 0;
  private moves = 20;
  private targetScore = 1000;
  private scoreText!: Phaser.GameObjects.Text;
  private movesText!: Phaser.GameObjects.Text;
  private isProcessing = false;
  private levelConfig!: LevelConfig | undefined;

  constructor() {
    super('GameScene');
  }

  create() {
    const { width, height } = this.cameras.main;

    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    this.levelConfig = ConfigManager.getInstance().getLevel(1);
    if (this.levelConfig) {
      this.moves = this.levelConfig.moves;
      this.targetScore = this.levelConfig.targetScore;
    }

    const headerY = 80;
    this.scoreText = this.add.text(100, headerY, `分数: ${this.score}`, {
      font: 'bold 24px Arial',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.movesText = this.add.text(width - 100, headerY, `步数: ${this.moves}`, {
      font: 'bold 24px Arial',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(width / 2, headerY, `目标: ${this.targetScore}`, {
      font: '20px Arial',
      color: '#ffd700',
    }).setOrigin(0.5);

    const backButton = this.add.text(50, 30, '← 返回', {
      font: '18px Arial',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 10, y: 5 },
    }).setInteractive();

    backButton.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    this.createGrid();

    this.input.on('pointerdown', this.handleInput, this);
  }

  private createGrid() {
    const { width, height } = this.cameras.main;
    const startX = (width - GRID_SIZE * CELL_SIZE) / 2 + CELL_SIZE / 2;
    const startY = (height - GRID_SIZE * CELL_SIZE) / 2 + CELL_SIZE / 2;

    for (let row = 0; row < GRID_SIZE; row++) {
      this.grid[row] = [];
      for (let col = 0; col < GRID_SIZE; col++) {
        const type = GEM_TYPES[Math.floor(Math.random() * GEM_TYPES.length)];
        const x = startX + col * CELL_SIZE;
        const y = startY + row * CELL_SIZE;

        const sprite = this.add.sprite(x, y, '').setDisplaySize(CELL_SIZE - 4, CELL_SIZE - 4);
        this.drawGem(sprite, type);
        sprite.setInteractive();

        this.grid[row][col] = { type, sprite, row, col };
      }
    }

    this.removeInitialMatches();
  }

  private drawGem(sprite: Phaser.GameObjects.Sprite, type: string) {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(GEM_COLORS[type], 1);
    graphics.fillRoundedRect(-20, -20, 40, 40, 8);
    graphics.lineStyle(2, 0xffffff, 0.5);
    graphics.strokeRoundedRect(-20, -20, 40, 40, 8);
    graphics.generateTexture(type, 40, 40);
    graphics.destroy();

    sprite.setTexture(type);
  }

  private removeInitialMatches() {
    let hasMatches = true;
    while (hasMatches) {
      const matches = this.findMatches();
      if (matches.length > 0) {
        matches.forEach(gem => {
          if (gem) {
            gem.type = GEM_TYPES[Math.floor(Math.random() * GEM_TYPES.length)];
            this.drawGem(gem.sprite, gem.type);
          }
        });
      } else {
        hasMatches = false;
      }
    }
  }

  private handleInput(pointer: Phaser.Input.Pointer) {
    if (this.isProcessing || this.moves <= 0) return;

    const { width, height } = this.cameras.main;
    const startX = (width - GRID_SIZE * CELL_SIZE) / 2;
    const startY = (height - GRID_SIZE * CELL_SIZE) / 2;

    const col = Math.floor((pointer.x - startX) / CELL_SIZE);
    const row = Math.floor((pointer.y - startY) / CELL_SIZE);

    if (row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE) {
      const clickedGem = this.grid[row][col];
      if (clickedGem) {
        this.selectGem(clickedGem);
      }
    }
  }

  private selectGem(gem: Gem) {
    if (this.selectedGem === null) {
      this.selectedGem = gem;
      gem.sprite.setScale(1.1);
      gem.sprite.setTint(0xaaaaaa);
    } else if (this.selectedGem === gem) {
      gem.sprite.setScale(1);
      gem.sprite.clearTint();
      this.selectedGem = null;
    } else {
      const isAdjacent =
        (Math.abs(this.selectedGem.row - gem.row) === 1 && this.selectedGem.col === gem.col) ||
        (Math.abs(this.selectedGem.col - gem.col) === 1 && this.selectedGem.row === gem.row);

      if (isAdjacent) {
        this.swapGems(this.selectedGem, gem);
      }

      this.selectedGem.sprite.setScale(1);
      this.selectedGem.sprite.clearTint();
      this.selectedGem = null;
    }
  }

  private swapGems(gem1: Gem, gem2: Gem) {
    this.isProcessing = true;

    const tempType = gem1.type;
    gem1.type = gem2.type;
    gem2.type = tempType;

    this.drawGem(gem1.sprite, gem1.type);
    this.drawGem(gem2.sprite, gem2.type);

    const matches = this.findMatches();
    if (matches.length > 0) {
      this.moves--;
      this.movesText.setText(`步数: ${this.moves}`);
      this.processMatches();
    } else {
      const tempType2 = gem1.type;
      gem1.type = gem2.type;
      gem2.type = tempType2;
      this.drawGem(gem1.sprite, gem1.type);
      this.drawGem(gem2.sprite, gem2.type);
      this.isProcessing = false;
    }
  }

  private findMatches(): Gem[] {
    const matches: Set<Gem> = new Set();

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE - 2; col++) {
        const gem1 = this.grid[row][col];
        const gem2 = this.grid[row][col + 1];
        const gem3 = this.grid[row][col + 2];

        if (gem1 && gem2 && gem3 && gem1.type === gem2.type && gem2.type === gem3.type) {
          matches.add(gem1);
          matches.add(gem2);
          matches.add(gem3);
        }
      }
    }

    for (let col = 0; col < GRID_SIZE; col++) {
      for (let row = 0; row < GRID_SIZE - 2; row++) {
        const gem1 = this.grid[row][col];
        const gem2 = this.grid[row + 1][col];
        const gem3 = this.grid[row + 2][col];

        if (gem1 && gem2 && gem3 && gem1.type === gem2.type && gem2.type === gem3.type) {
          matches.add(gem1);
          matches.add(gem2);
          matches.add(gem3);
        }
      }
    }

    return Array.from(matches);
  }

  private processMatches() {
    const matches = this.findMatches();
    if (matches.length === 0) {
      this.isProcessing = false;
      this.checkGameEnd();
      return;
    }

    this.score += matches.length * 10;
    this.scoreText.setText(`分数: ${this.score}`);

    matches.forEach(gem => {
      if (gem) {
        this.tweens.add({
          targets: gem.sprite,
          scale: 0,
          duration: 200,
          onComplete: () => {
            gem.type = '';
          },
        });
      }
    });

    this.time.delayedCall(250, () => {
      this.dropGems();
      this.fillEmptyCells();
      this.time.delayedCall(300, () => {
        this.processMatches();
      });
    });
  }

  private dropGems() {
    for (let col = 0; col < GRID_SIZE; col++) {
      let emptyRow = GRID_SIZE - 1;
      for (let row = GRID_SIZE - 1; row >= 0; row--) {
        const gem = this.grid[row][col];
        if (gem && gem.type !== '') {
          if (row !== emptyRow) {
            this.grid[emptyRow][col] = gem;
            this.grid[row][col] = null;
            gem.row = emptyRow;
            const targetY = gem.sprite.y + (emptyRow - row) * CELL_SIZE;
            this.tweens.add({
              targets: gem.sprite,
              y: targetY,
              duration: 200,
            });
          }
          emptyRow--;
        }
      }
    }
  }

  private fillEmptyCells() {
    const { width, height } = this.cameras.main;
    const startX = (width - GRID_SIZE * CELL_SIZE) / 2 + CELL_SIZE / 2;
    const startY = (height - GRID_SIZE * CELL_SIZE) / 2 + CELL_SIZE / 2;

    for (let col = 0; col < GRID_SIZE; col++) {
      for (let row = 0; row < GRID_SIZE; row++) {
        if (!this.grid[row][col] || this.grid[row][col]?.type === '') {
          const type = GEM_TYPES[Math.floor(Math.random() * GEM_TYPES.length)];
          const x = startX + col * CELL_SIZE;
          const y = startY - GRID_SIZE * CELL_SIZE + row * CELL_SIZE;

          const sprite = this.add.sprite(x, y, type).setDisplaySize(CELL_SIZE - 4, CELL_SIZE - 4);
          sprite.setInteractive();

          const gem: Gem = { type, sprite, row, col };
          this.grid[row][col] = gem;

          const targetY = startY + row * CELL_SIZE;
          this.tweens.add({
            targets: sprite,
            y: targetY,
            duration: 300,
            delay: row * 30,
          });
        }
      }
    }
  }

  private checkGameEnd() {
    if (this.score >= this.targetScore) {
      this.showResult('恭喜过关！', true);
    } else if (this.moves <= 0) {
      this.showResult('游戏结束', false);
    }
  }

  private showResult(message: string, isWin: boolean) {
    const { width, height } = this.cameras.main;

    this.add.rectangle(width / 2, height / 2, 300, 200, 0x000000, 0.8).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 40, message, {
      font: 'bold 32px Arial',
      color: isWin ? '#4ade80' : '#f87171',
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2, `最终分数: ${this.score}`, {
      font: '20px Arial',
      color: '#ffffff',
    }).setOrigin(0.5);

    const restartButton = this.add.text(width / 2, height / 2 + 50, '再玩一次', {
      font: '20px Arial',
      color: '#ffffff',
      backgroundColor: '#6366f1',
      padding: { x: 20, y: 10 },
    }).setOrigin(0.5).setInteractive();

    restartButton.on('pointerdown', () => {
      this.scene.restart();
    });
  }
}
