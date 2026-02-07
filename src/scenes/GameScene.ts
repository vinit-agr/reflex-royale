import Phaser from 'phaser';
import { Target } from '../game/Target';

const TARGET_COLORS = [0xe94560, 0x0f3460, 0x533483, 0x00b4d8, 0x90be6d, 0xf77f00];

export class GameScene extends Phaser.Scene {
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private targets: Target[] = [];
  private spawnTimer!: Phaser.Time.TimerEvent;
  private gameStartTime: number = 0;
  private isGameOver: boolean = false;

  // Difficulty settings
  private baseSpawnInterval: number = 2000;
  private baseTargetLifetime: number = 2500;
  private minSpawnInterval: number = 600;
  private minTargetLifetime: number = 800;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.score = 0;
    this.targets = [];
    this.isGameOver = false;
    this.gameStartTime = this.time.now;

    const { width, height } = this.scale;

    // Background gradient effect
    const gradient = this.add.graphics();
    gradient.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    gradient.fillRect(0, 0, width, height);

    // Score display
    const scoreBg = this.add.rectangle(90, 35, 160, 50, 0x16213e, 0.8)
      .setStrokeStyle(2, 0x4a4a6a);
    
    this.scoreText = this.add.text(90, 35, 'SCORE: 0', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Start spawning targets
    this.scheduleNextSpawn();

    // Initial spawn
    this.spawnTarget();

    // Fade in
    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  private getElapsedSeconds(): number {
    return (this.time.now - this.gameStartTime) / 1000;
  }

  private getCurrentSpawnInterval(): number {
    const elapsed = this.getElapsedSeconds();
    // Decrease spawn interval over time (targets spawn faster)
    const interval = this.baseSpawnInterval - (elapsed * 30);
    return Math.max(this.minSpawnInterval, interval);
  }

  private getCurrentTargetLifetime(): number {
    const elapsed = this.getElapsedSeconds();
    // Decrease target lifetime over time (less time to click)
    const lifetime = this.baseTargetLifetime - (elapsed * 35);
    return Math.max(this.minTargetLifetime, lifetime);
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
    const margin = 60;
    
    // Find a position that doesn't overlap with existing targets
    let x: number, y: number;
    let attempts = 0;
    const maxAttempts = 20;
    
    do {
      x = Phaser.Math.Between(margin, width - margin);
      y = Phaser.Math.Between(margin + 50, height - margin);
      attempts++;
    } while (this.isPositionOccupied(x, y) && attempts < maxAttempts);

    const color = Phaser.Math.RND.pick(TARGET_COLORS);
    const lifetime = this.getCurrentTargetLifetime();
    
    const target = new Target(this, x, y, color, lifetime, () => {
      this.onTargetClicked(target);
    }, () => {
      this.onTargetExpired(target);
    });

    this.targets.push(target);
  }

  private isPositionOccupied(x: number, y: number): boolean {
    const minDistance = 100;
    return this.targets.some(target => {
      const dist = Phaser.Math.Distance.Between(x, y, target.x, target.y);
      return dist < minDistance;
    });
  }

  private onTargetClicked(target: Target): void {
    if (this.isGameOver) return;

    // Remove from array
    const index = this.targets.indexOf(target);
    if (index > -1) {
      this.targets.splice(index, 1);
    }

    // Increment score
    this.score++;
    this.updateScoreDisplay();

    // Create particle burst effect
    this.createClickEffect(target.x, target.y, target.color);

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

    // Score popup
    const popup = this.add.text(x, y - 30, '+1', {
      fontFamily: 'Arial Black, Arial',
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: popup,
      y: y - 80,
      alpha: 0,
      duration: 600,
      ease: 'Quad.easeOut',
      onComplete: () => popup.destroy()
    });

    // Camera shake for satisfaction
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

  private onTargetExpired(target: Target): void {
    if (this.isGameOver) return;

    // Remove from array
    const index = this.targets.indexOf(target);
    if (index > -1) {
      this.targets.splice(index, 1);
    }

    // Game over!
    this.gameOver();
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

    // Screen flash
    this.cameras.main.flash(300, 233, 69, 96);

    // Transition to game over scene
    this.time.delayedCall(500, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameOverScene', { score: this.score });
      });
    });
  }

  update(): void {
    // Update all targets
    this.targets.forEach(target => target.update());
  }
}
