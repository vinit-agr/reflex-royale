import Phaser from 'phaser';
import { getSoundManager } from '../game/SoundManager';

const HIGH_SCORE_KEY = 'reflex_royale_high_score';

export class GameOverScene extends Phaser.Scene {
  private score: number = 0;
  private bestCombo: number = 0;
  private targetsHit: number = 0;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { score: number; bestCombo?: number; targetsHit?: number }): void {
    this.score = data.score || 0;
    this.bestCombo = data.bestCombo || 0;
    this.targetsHit = data.targetsHit || 0;
  }

  create(): void {
    const { width, height } = this.scale;
    const soundManager = getSoundManager();
    soundManager.resume();

    // Get and update high score
    const storedHighScore = localStorage.getItem(HIGH_SCORE_KEY);
    let highScore = storedHighScore ? parseInt(storedHighScore, 10) : 0;
    const isNewHighScore = this.score > highScore;
    
    if (isNewHighScore) {
      highScore = this.score;
      localStorage.setItem(HIGH_SCORE_KEY, highScore.toString());
    }

    // Dark overlay with vignette effect
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x0f0f1a, 0x0f0f1a, 1);
    graphics.fillRect(0, 0, width, height);

    // Game Over title
    const gameOverShadow = this.add.text(width / 2 + 3, height * 0.15 + 3, 'GAME OVER', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '64px',
      color: '#000000',
    }).setOrigin(0.5).setAlpha(0.4);

    const gameOverText = this.add.text(width / 2, height * 0.15, 'GAME OVER', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '64px',
      color: '#e94560',
    }).setOrigin(0.5);

    // Animate title entrance
    gameOverText.setScale(0);
    gameOverShadow.setScale(0);
    this.tweens.add({
      targets: [gameOverText, gameOverShadow],
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut',
      delay: 200
    });

    // Score display
    const scoreLabel = this.add.text(width / 2, height * 0.32, 'YOUR SCORE', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#888888',
    }).setOrigin(0.5).setAlpha(0);

    const scoreValue = this.add.text(width / 2, height * 0.40, this.score.toString(), {
      fontFamily: 'Arial Black, Arial',
      fontSize: '72px',
      color: '#ffffff',
    }).setOrigin(0.5).setAlpha(0);

    // Fade in score
    this.tweens.add({
      targets: [scoreLabel, scoreValue],
      alpha: 1,
      duration: 400,
      delay: 600
    });

    // Count up animation for score
    const countUpScore = { value: 0 };
    this.tweens.add({
      targets: countUpScore,
      value: this.score,
      duration: Math.min(1000, this.score * 50),
      delay: 600,
      ease: 'Quad.easeOut',
      onUpdate: () => {
        scoreValue.setText(Math.floor(countUpScore.value).toString());
      }
    });

    // Stats display (targets hit, best combo)
    const statsY = height * 0.52;
    
    const statsContainer = this.add.container(width / 2, statsY);
    statsContainer.setAlpha(0);

    const targetsText = this.add.text(-100, 0, `🎯 ${this.targetsHit}`, {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#90be6d',
    }).setOrigin(0.5);

    const comboText = this.add.text(100, 0, `🔥 x${this.bestCombo}`, {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffd700',
    }).setOrigin(0.5);

    const targetsLabel = this.add.text(-100, 25, 'Targets Hit', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#666666',
    }).setOrigin(0.5);

    const comboLabel = this.add.text(100, 25, 'Best Combo', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#666666',
    }).setOrigin(0.5);

    statsContainer.add([targetsText, comboText, targetsLabel, comboLabel]);

    this.tweens.add({
      targets: statsContainer,
      alpha: 1,
      duration: 400,
      delay: 900
    });

    // High score display
    const highScoreY = height * 0.65;
    const highScoreContainer = this.add.container(width / 2, highScoreY);
    
    if (isNewHighScore && this.score > 0) {
      // New high score celebration
      const newRecordText = this.add.text(0, -10, '🏆 NEW HIGH SCORE! 🏆', {
        fontFamily: 'Arial Black, Arial',
        fontSize: '24px',
        color: '#ffd700',
      }).setOrigin(0.5);

      highScoreContainer.add(newRecordText);

      // Pulsing animation
      this.tweens.add({
        targets: newRecordText,
        scale: { from: 1, to: 1.1 },
        duration: 500,
        yoyo: true,
        repeat: -1
      });

      // Sparkle particles
      for (let i = 0; i < 20; i++) {
        this.time.delayedCall(i * 100, () => {
          const sparkle = this.add.circle(
            width / 2 + Phaser.Math.Between(-150, 150),
            highScoreY + Phaser.Math.Between(-30, 30),
            Phaser.Math.Between(2, 5),
            0xffd700
          );
          this.tweens.add({
            targets: sparkle,
            alpha: 0,
            y: sparkle.y - 50,
            duration: 800,
            onComplete: () => sparkle.destroy()
          });
        });
      }
    } else {
      const highScoreText = this.add.text(0, 0, `Best: ${highScore}`, {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#666666',
      }).setOrigin(0.5);

      highScoreContainer.add(highScoreText);
    }

    highScoreContainer.setAlpha(0);
    this.tweens.add({
      targets: highScoreContainer,
      alpha: 1,
      duration: 400,
      delay: 1100
    });

    // Play Again button
    const buttonY = height * 0.80;
    const buttonBg = this.add.rectangle(width / 2, buttonY, 220, 55, 0xe94560)
      .setStrokeStyle(3, 0xff6b8a)
      .setInteractive({ useHandCursor: true });
    
    const buttonText = this.add.text(width / 2, buttonY, '↻  PLAY AGAIN', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '22px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Button entrance
    buttonBg.setScale(0);
    buttonText.setScale(0);
    this.tweens.add({
      targets: [buttonBg, buttonText],
      scale: 1,
      duration: 400,
      ease: 'Back.easeOut',
      delay: 1300
    });

    // Button hover effects
    buttonBg.on('pointerover', () => {
      this.tweens.add({
        targets: [buttonBg, buttonText],
        scale: 1.05,
        duration: 100
      });
      buttonBg.setFillStyle(0xff6b8a);
    });

    buttonBg.on('pointerout', () => {
      this.tweens.add({
        targets: [buttonBg, buttonText],
        scale: 1,
        duration: 100
      });
      buttonBg.setFillStyle(0xe94560);
    });

    buttonBg.on('pointerdown', () => {
      this.tweens.add({
        targets: [buttonBg, buttonText],
        scale: 0.95,
        duration: 50
      });
    });

    buttonBg.on('pointerup', () => {
      soundManager.playPop();
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene');
      });
    });

    // Menu button
    const menuButton = this.add.text(width / 2, height - 30, 'Main Menu', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#666666',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    menuButton.on('pointerover', () => menuButton.setColor('#ffffff'));
    menuButton.on('pointerout', () => menuButton.setColor('#666666'));
    menuButton.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MainMenuScene');
      });
    });

    menuButton.setAlpha(0);
    this.tweens.add({
      targets: menuButton,
      alpha: 1,
      delay: 1500,
      duration: 400
    });

    // Fade in
    this.cameras.main.fadeIn(300, 0, 0, 0);
  }
}
