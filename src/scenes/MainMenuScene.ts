import Phaser from 'phaser';
import { getSoundManager } from '../game/SoundManager';

export class MainMenuScene extends Phaser.Scene {
  private particles: Phaser.GameObjects.Arc[] = [];

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const soundManager = getSoundManager();

    // Animated background particles
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(2, 6);
      const particle = this.add.circle(x, y, size, 0x4a4a6a, 0.5);
      this.particles.push(particle);
      
      this.tweens.add({
        targets: particle,
        y: particle.y - Phaser.Math.Between(50, 150),
        alpha: 0,
        duration: Phaser.Math.Between(2000, 4000),
        repeat: -1,
        onRepeat: () => {
          particle.x = Phaser.Math.Between(0, width);
          particle.y = height + 20;
          particle.alpha = 0.5;
        }
      });
    }

    // Title with gradient effect using multiple text layers
    const titleShadow = this.add.text(width / 2 + 4, height / 3 + 4, 'REFLEX ROYALE', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '56px',
      color: '#000000',
    }).setOrigin(0.5).setAlpha(0.3);

    const title = this.add.text(width / 2, height / 3, 'REFLEX ROYALE', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '56px',
      color: '#e94560',
    }).setOrigin(0.5);

    // Pulsing animation on title
    this.tweens.add({
      targets: [title, titleShadow],
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Subtitle
    this.add.text(width / 2, height / 3 + 60, 'Test your reflexes!', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5).setAlpha(0.7);

    // Lives display preview
    this.add.text(width / 2, height / 3 + 95, '❤️ ❤️ ❤️', {
      fontSize: '24px',
    }).setOrigin(0.5);

    // Decorative target preview
    this.add.circle(width / 2, height / 2 + 50, 45, 0xe94560);
    const previewRing = this.add.circle(width / 2, height / 2 + 50, 55, 0xe94560, 0).setStrokeStyle(3, 0xffffff, 0.5);
    
    this.tweens.add({
      targets: previewRing,
      scale: { from: 0.8, to: 1.2 },
      alpha: { from: 0.8, to: 0 },
      duration: 1000,
      repeat: -1,
    });

    // Start button area
    const buttonBg = this.add.rectangle(width / 2, height * 0.78, 250, 60, 0x16213e)
      .setStrokeStyle(2, 0x4a4a6a)
      .setInteractive({ useHandCursor: true });
    
    const startText = this.add.text(width / 2, height * 0.78, '▶  TAP TO START', {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Button hover effects
    buttonBg.on('pointerover', () => {
      buttonBg.setFillStyle(0x2a2a4e);
      buttonBg.setStrokeStyle(2, 0x6a6a8a);
    });

    buttonBg.on('pointerout', () => {
      buttonBg.setFillStyle(0x16213e);
      buttonBg.setStrokeStyle(2, 0x4a4a6a);
    });

    // Click handler
    const startGame = () => {
      // Resume audio context on user interaction
      soundManager.resume();
      soundManager.playPop();

      // Click feedback
      this.tweens.add({
        targets: [buttonBg, startText],
        scale: 0.95,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          this.cameras.main.fadeOut(300, 0, 0, 0);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameScene');
          });
        }
      });
    };

    buttonBg.on('pointerdown', startGame);

    // Blinking animation on start text
    this.tweens.add({
      targets: startText,
      alpha: { from: 1, to: 0.5 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Instructions - updated for lives system
    this.add.text(width / 2, height - 50, 'Click targets before they disappear!', {
      fontFamily: 'Arial',
      fontSize: '15px',
      color: '#ffffff',
    }).setOrigin(0.5).setAlpha(0.8);

    this.add.text(width / 2, height - 28, '3 lives • Build combos • Beat your high score!', {
      fontFamily: 'Arial',
      fontSize: '13px',
      color: '#888888',
    }).setOrigin(0.5);

    // Fade in
    this.cameras.main.fadeIn(300, 0, 0, 0);
  }
}
