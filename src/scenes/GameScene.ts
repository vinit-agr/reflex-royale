import Phaser from 'phaser';
import { Target } from '../game/Target';
import { getSoundManager } from '../game/SoundManager';

const TARGET_COLORS = [0xe94560, 0x0f3460, 0x533483, 0x00b4d8, 0x90be6d, 0xf77f00];

export class GameScene extends Phaser.Scene {
  private score: number = 0;
  private lives: number = 3;
  private maxLives: number = 3;
  private combo: number = 0;
  private bestCombo: number = 0;
  private targetsHit: number = 0;
  
  private scoreText!: Phaser.GameObjects.Text;
  private livesContainer!: Phaser.GameObjects.Container;
  private heartTexts: Phaser.GameObjects.Text[] = [];
  private comboText!: Phaser.GameObjects.Text;
  private comboContainer!: Phaser.GameObjects.Container;
  
  private targets: Target[] = [];
  private spawnTimer!: Phaser.Time.TimerEvent;
  private gameStartTime: number = 0;
  private isGameOver: boolean = false;
  private countdownText!: Phaser.GameObjects.Text;
  
  // Flash overlay for hit/miss feedback
  private flashOverlay!: Phaser.GameObjects.Rectangle;
  
  // Milestone celebration
  private milestoneContainer!: Phaser.GameObjects.Container;

  // Difficulty settings - MUCH gentler now!
  private readonly TUTORIAL_TARGETS = 5; // First 5 targets are tutorial mode
  private readonly TUTORIAL_LIFETIME = 4000; // 4 seconds for tutorial targets
  private readonly BASE_LIFETIME = 3500; // 3.5 seconds after tutorial
  private readonly MIN_LIFETIME = 1200; // Minimum 1.2 seconds (easier than before)
  
  private readonly TUTORIAL_RADIUS = 55; // Big targets for tutorial
  private readonly BASE_RADIUS = 45; // Still pretty big
  private readonly MIN_RADIUS = 28; // Smaller than before but still hittable
  
  private readonly BASE_SPAWN_INTERVAL = 2500; // Slower spawn
  private readonly MIN_SPAWN_INTERVAL = 800;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Reset state
    this.score = 0;
    this.lives = this.maxLives;
    this.combo = 0;
    this.bestCombo = 0;
    this.targetsHit = 0;
    this.targets = [];
    this.isGameOver = false;
    this.heartTexts = [];

    const { width, height } = this.scale;
    const soundManager = getSoundManager();
    soundManager.resume();

    // Background gradient effect
    const gradient = this.add.graphics();
    gradient.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    gradient.fillRect(0, 0, width, height);

    // Flash overlay (hidden by default)
    this.flashOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x00ff00, 0);
    this.flashOverlay.setDepth(100);

    // Score display (top left)
    this.add.rectangle(90, 35, 160, 50, 0x16213e, 0.8)
      .setStrokeStyle(2, 0x4a4a6a);
    
    this.scoreText = this.add.text(90, 35, 'SCORE: 0', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Lives display (top right)
    this.livesContainer = this.add.container(width - 90, 35);
    const livesBg = this.add.rectangle(0, 0, 120, 50, 0x16213e, 0.8)
      .setStrokeStyle(2, 0x4a4a6a);
    this.livesContainer.add(livesBg);
    
    this.updateLivesDisplay();

    // Combo display (center top) - hidden initially
    this.comboContainer = this.add.container(width / 2, 35);
    this.comboContainer.setAlpha(0);
    
    const comboBg = this.add.rectangle(0, 0, 140, 40, 0x533483, 0.8)
      .setStrokeStyle(2, 0x7c5cbf);
    this.comboContainer.add(comboBg);
    
    this.comboText = this.add.text(0, 0, '🔥 x2', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '20px',
      color: '#ffd700',
    }).setOrigin(0.5);
    this.comboContainer.add(this.comboText);

    // Milestone celebration container
    this.milestoneContainer = this.add.container(width / 2, height / 2);
    this.milestoneContainer.setDepth(50);

    // Countdown text (center)
    this.countdownText = this.add.text(width / 2, height / 2, 'GET READY!', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '64px',
      color: '#ffffff',
    }).setOrigin(0.5);
    this.countdownText.setDepth(200);

    // Start countdown sequence
    this.startCountdown();

    // Fade in
    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  private startCountdown(): void {
    const soundManager = getSoundManager();
    
    // "Get Ready!" for 1 second
    this.tweens.add({
      targets: this.countdownText,
      scale: { from: 0, to: 1 },
      duration: 300,
      ease: 'Back.easeOut'
    });

    this.time.delayedCall(1000, () => {
      this.countdownText.setText('3');
      soundManager.playCountdown(false);
      this.tweens.add({
        targets: this.countdownText,
        scale: { from: 1.5, to: 1 },
        duration: 300
      });
    });

    this.time.delayedCall(2000, () => {
      this.countdownText.setText('2');
      soundManager.playCountdown(false);
      this.tweens.add({
        targets: this.countdownText,
        scale: { from: 1.5, to: 1 },
        duration: 300
      });
    });

    this.time.delayedCall(3000, () => {
      this.countdownText.setText('1');
      soundManager.playCountdown(false);
      this.tweens.add({
        targets: this.countdownText,
        scale: { from: 1.5, to: 1 },
        duration: 300
      });
    });

    this.time.delayedCall(4000, () => {
      this.countdownText.setText('GO!');
      this.countdownText.setColor('#00ff00');
      soundManager.playCountdown(true);
      
      this.tweens.add({
        targets: this.countdownText,
        scale: { from: 1.5, to: 0 },
        alpha: 0,
        duration: 500,
        onComplete: () => {
          this.countdownText.destroy();
        }
      });

      // Start the game!
      this.gameStartTime = this.time.now;
      this.spawnTarget();
      this.scheduleNextSpawn();
    });
  }

  private updateLivesDisplay(): void {
    // Clear old hearts
    this.heartTexts.forEach(h => h.destroy());
    this.heartTexts = [];

    // Create new hearts
    const heartSpacing = 35;
    const startX = -(this.maxLives - 1) * heartSpacing / 2;
    
    for (let i = 0; i < this.maxLives; i++) {
      const isFilled = i < this.lives;
      const heart = this.add.text(startX + i * heartSpacing, 0, isFilled ? '❤️' : '🖤', {
        fontSize: '28px',
      }).setOrigin(0.5);
      
      this.livesContainer.add(heart);
      this.heartTexts.push(heart);
    }
  }

  private getElapsedSeconds(): number {
    return (this.time.now - this.gameStartTime) / 1000;
  }

  private getCurrentSpawnInterval(): number {
    const elapsed = this.getElapsedSeconds();
    // Very slow decrease
    const interval = this.BASE_SPAWN_INTERVAL - (elapsed * 20);
    return Math.max(this.MIN_SPAWN_INTERVAL, interval);
  }

  private getCurrentTargetLifetime(): number {
    // Tutorial mode: first 5 targets are extra long
    if (this.targetsHit < this.TUTORIAL_TARGETS) {
      return this.TUTORIAL_LIFETIME;
    }
    
    const elapsed = this.getElapsedSeconds();
    // Gradual decrease
    const lifetime = this.BASE_LIFETIME - (elapsed * 25);
    return Math.max(this.MIN_LIFETIME, lifetime);
  }

  private getCurrentTargetRadius(): number {
    // Tutorial mode: big targets
    if (this.targetsHit < this.TUTORIAL_TARGETS) {
      return this.TUTORIAL_RADIUS;
    }
    
    const elapsed = this.getElapsedSeconds();
    // Gradual shrinking
    const radius = this.BASE_RADIUS - (elapsed * 0.3);
    return Math.max(this.MIN_RADIUS, radius);
  }

  private scheduleNextSpawn(): void {
    if (this.isGameOver) return;

    const interval = this.getCurrentSpawnInterval();
    
    this.spawnTimer = this.time.delayedCall(interval, () => {
      if (!this.isGameOver) {
        this.spawnTarget();
        this.scheduleNextSpawn();
      }
    });
  }

  private spawnTarget(): void {
    if (this.isGameOver) return;

    const { width, height } = this.scale;
    const radius = this.getCurrentTargetRadius();
    const margin = radius + 20;
    
    // Find a position that doesn't overlap with existing targets
    let x: number, y: number;
    let attempts = 0;
    const maxAttempts = 20;
    
    do {
      x = Phaser.Math.Between(margin, width - margin);
      y = Phaser.Math.Between(margin + 60, height - margin);
      attempts++;
    } while (this.isPositionOccupied(x, y, radius) && attempts < maxAttempts);

    const color = Phaser.Math.RND.pick(TARGET_COLORS);
    const lifetime = this.getCurrentTargetLifetime();
    
    const target = new Target(
      this, x, y, color, lifetime, radius,
      () => this.onTargetClicked(target),
      () => this.onTargetExpired(target)
    );

    this.targets.push(target);
    
    // Play whoosh sound
    getSoundManager().playWhoosh();
  }

  private isPositionOccupied(x: number, y: number, radius: number): boolean {
    const minDistance = radius * 2.5;
    return this.targets.some(target => {
      const dist = Phaser.Math.Distance.Between(x, y, target.x, target.y);
      return dist < minDistance;
    });
  }

  private vibrate(pattern: number | number[]): void {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Vibration not supported or failed
      }
    }
  }

  private onTargetClicked(target: Target): void {
    if (this.isGameOver) return;

    // Remove from array
    const index = this.targets.indexOf(target);
    if (index > -1) {
      this.targets.splice(index, 1);
    }

    // Increment score and combo
    this.score++;
    this.targetsHit++;
    this.combo++;
    if (this.combo > this.bestCombo) {
      this.bestCombo = this.combo;
    }
    
    this.updateScoreDisplay();
    this.updateComboDisplay();

    // Play pop sound
    getSoundManager().playPop();
    
    // Vibrate on mobile (short pulse)
    this.vibrate(50);

    // Green flash on hit
    this.flashOverlay.setFillStyle(0x00ff00, 0.3);
    this.tweens.add({
      targets: this.flashOverlay,
      alpha: { from: 1, to: 0 },
      duration: 150
    });

    // Create particle burst effect
    this.createClickEffect(target.x, target.y, target.color);

    // Check for milestone
    if (this.targetsHit > 0 && this.targetsHit % 10 === 0) {
      this.celebrateMilestone();
    }

    // Destroy the target with animation
    target.destroy();
  }

  private createClickEffect(x: number, y: number, color: number): void {
    // Expanding ring
    const ring = this.add.circle(x, y, 30, color, 0).setStrokeStyle(4, color);
    this.tweens.add({
      targets: ring,
      scale: 2.5,
      alpha: 0,
      duration: 400,
      ease: 'Quad.easeOut',
      onComplete: () => ring.destroy()
    });

    // Particle burst
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const particle = this.add.circle(x, y, Phaser.Math.Between(3, 6), color);
      
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * Phaser.Math.Between(60, 100),
        y: y + Math.sin(angle) * Phaser.Math.Between(60, 100),
        scale: 0,
        alpha: 0,
        duration: Phaser.Math.Between(300, 500),
        ease: 'Quad.easeOut',
        onComplete: () => particle.destroy()
      });
    }

    // Score popup with combo multiplier text
    const popupText = this.combo > 1 ? `+1 🔥x${this.combo}` : '+1';
    const popup = this.add.text(x, y - 30, popupText, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '28px',
      color: this.combo > 5 ? '#ffd700' : '#ffffff',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: popup,
      y: y - 80,
      alpha: 0,
      duration: 600,
      ease: 'Quad.easeOut',
      onComplete: () => popup.destroy()
    });

    // Mild camera shake for satisfaction (less than miss)
    this.cameras.main.shake(50, 0.003);
  }

  private updateScoreDisplay(): void {
    this.scoreText.setText(`SCORE: ${this.score}`);
    
    // Pop animation on score update
    this.tweens.add({
      targets: this.scoreText,
      scale: { from: 1.2, to: 1 },
      duration: 200,
      ease: 'Back.easeOut'
    });
  }

  private updateComboDisplay(): void {
    if (this.combo >= 2) {
      this.comboText.setText(`🔥 x${this.combo}`);
      
      // Show and animate combo
      this.tweens.add({
        targets: this.comboContainer,
        alpha: 1,
        scale: { from: 1.3, to: 1 },
        duration: 200,
        ease: 'Back.easeOut'
      });

      // Color based on combo level
      if (this.combo >= 10) {
        this.comboText.setColor('#ff4444');
      } else if (this.combo >= 5) {
        this.comboText.setColor('#ffd700');
      } else {
        this.comboText.setColor('#ffffff');
      }
    }
  }

  private resetCombo(): void {
    this.combo = 0;
    
    // Fade out combo display
    this.tweens.add({
      targets: this.comboContainer,
      alpha: 0,
      duration: 300
    });
  }

  private celebrateMilestone(): void {
    const soundManager = getSoundManager();
    soundManager.playMilestone();
    
    const wave = Math.floor(this.targetsHit / 10);
    
    // Clear previous milestone elements
    this.milestoneContainer.removeAll(true);
    
    // Add milestone text
    const milestoneText = this.add.text(0, 0, `🎉 WAVE ${wave} COMPLETE! 🎉`, {
      fontFamily: 'Arial Black, Arial',
      fontSize: '36px',
      color: '#ffd700',
    }).setOrigin(0.5);
    this.milestoneContainer.add(milestoneText);

    // Animate in and out
    this.milestoneContainer.setScale(0);
    this.milestoneContainer.setAlpha(1);
    
    this.tweens.add({
      targets: this.milestoneContainer,
      scale: { from: 0, to: 1.2 },
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: this.milestoneContainer,
          scale: 1,
          duration: 100,
          onComplete: () => {
            this.time.delayedCall(800, () => {
              this.tweens.add({
                targets: this.milestoneContainer,
                scale: 0,
                alpha: 0,
                duration: 300
              });
            });
          }
        });
      }
    });

    // Create celebratory particles
    const { width, height } = this.scale;
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(100, width - 100);
      const y = height + 20;
      const color = Phaser.Math.RND.pick([0xffd700, 0xff6b6b, 0x00ff00, 0x00bfff]);
      
      const particle = this.add.circle(x, y, Phaser.Math.Between(4, 8), color);
      particle.setDepth(49);
      
      this.tweens.add({
        targets: particle,
        y: Phaser.Math.Between(100, height / 2),
        x: x + Phaser.Math.Between(-100, 100),
        alpha: 0,
        scale: 0,
        duration: Phaser.Math.Between(800, 1500),
        delay: Phaser.Math.Between(0, 200),
        ease: 'Quad.easeOut',
        onComplete: () => particle.destroy()
      });
    }
  }

  private onTargetExpired(target: Target): void {
    if (this.isGameOver) return;

    // Remove from array
    const index = this.targets.indexOf(target);
    if (index > -1) {
      this.targets.splice(index, 1);
    }

    // Lose a life!
    this.lives--;
    this.updateLivesDisplay();
    this.resetCombo();

    // Play miss sound
    getSoundManager().playMiss();
    
    // Vibrate on mobile (longer pulse for miss)
    this.vibrate(200);

    // Red flash and screen shake on miss
    this.flashOverlay.setFillStyle(0xff0000, 0.4);
    this.tweens.add({
      targets: this.flashOverlay,
      alpha: { from: 1, to: 0 },
      duration: 300
    });
    
    // Stronger shake on miss
    this.cameras.main.shake(200, 0.01);

    // Animate the lost heart
    if (this.lives >= 0 && this.heartTexts[this.lives]) {
      const lostHeart = this.heartTexts[this.lives];
      this.tweens.add({
        targets: lostHeart,
        scale: { from: 1.5, to: 1 },
        duration: 300,
        ease: 'Bounce.easeOut'
      });
    }

    // Play life lost sound
    if (this.lives > 0) {
      getSoundManager().playLifeLost();
    }

    // Check for game over
    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  private gameOver(): void {
    this.isGameOver = true;

    // Stop spawning
    if (this.spawnTimer) {
      this.spawnTimer.remove();
    }

    // Destroy all remaining targets
    this.targets.forEach(target => target.destroyImmediate());
    this.targets = [];

    // Play game over sound
    getSoundManager().playGameOver();

    // Screen flash
    this.cameras.main.flash(300, 233, 69, 96);

    // Transition to game over scene
    this.time.delayedCall(500, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameOverScene', { 
          score: this.score,
          bestCombo: this.bestCombo,
          targetsHit: this.targetsHit
        });
      });
    });
  }

  update(): void {
    // Update all targets
    this.targets.forEach(target => target.update());
  }
}
