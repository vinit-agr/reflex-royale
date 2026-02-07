import Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  private particles: Phaser.GameObjects.Arc[] = [];

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    const { width, height } = this.scale;

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
    const subtitle = this.add.text(width / 2, height / 3 + 60, 'Test your reflexes!', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5).setAlpha(0.7);

    // Decorative target preview
    const previewTarget = this.add.circle(width / 2, height / 2 + 30, 40, 0xe94560);
    const previewRing = this.add.circle(width / 2, height / 2 + 30, 50, 0xe94560, 0).setStrokeStyle(3, 0xffffff, 0.5);
    
    this.tweens.add({
      targets: previewRing,
      scale: { from: 0.8, to: 1.2 },
      alpha: { from: 0.8, to: 0 },
      duration: 1000,
      repeat: -1,
    });

    // Start button area
    const buttonBg = this.add.rectangle(width / 2, height * 0.75, 250, 60, 0x16213e)
      .setStrokeStyle(2, 0x4a4a6a);
    
    const startText = this.add.text(width / 2, height * 0.75, '▶  CLICK TO START', {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Make the entire scene clickable
    this.input.once('pointerdown', () => {
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
    });

    // Blinking animation on start text
    this.tweens.add({
      targets: startText,
      alpha: { from: 1, to: 0.5 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Instructions
    const instructions = this.add.text(width / 2, height - 40, 'Click targets before they disappear. Miss one = Game Over!', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#888888',
    }).setOrigin(0.5);

    // Fade in
    this.cameras.main.fadeIn(300, 0, 0, 0);
  }
}
