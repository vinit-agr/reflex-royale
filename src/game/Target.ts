import Phaser from 'phaser';

export class Target {
  private scene: Phaser.Scene;
  private circle: Phaser.GameObjects.Arc;
  private innerCircle: Phaser.GameObjects.Arc;
  private timerRing: Phaser.GameObjects.Graphics;
  private glowRing: Phaser.GameObjects.Arc;
  private container: Phaser.GameObjects.Container;
  
  private lifetime: number;
  private startTime: number;
  private radius: number = 35;
  private onClickCallback: () => void;
  private onExpireCallback: () => void;
  private isDestroyed: boolean = false;

  public x: number;
  public y: number;
  public color: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    color: number,
    lifetime: number,
    onClick: () => void,
    onExpire: () => void
  ) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.color = color;
    this.lifetime = lifetime;
    this.startTime = scene.time.now;
    this.onClickCallback = onClick;
    this.onExpireCallback = onExpire;

    // Create container for all elements
    this.container = scene.add.container(x, y);

    // Outer glow ring
    this.glowRing = scene.add.circle(0, 0, this.radius + 15, color, 0.15);
    this.container.add(this.glowRing);

    // Timer ring (drawn as graphics)
    this.timerRing = scene.add.graphics();
    this.container.add(this.timerRing);

    // Main circle
    this.circle = scene.add.circle(0, 0, this.radius, color);
    this.container.add(this.circle);

    // Inner highlight
    this.innerCircle = scene.add.circle(-8, -8, this.radius * 0.3, 0xffffff, 0.3);
    this.container.add(this.innerCircle);

    // Make interactive
    this.circle.setInteractive({ useHandCursor: true });
    this.circle.on('pointerdown', this.handleClick, this);
    this.circle.on('pointerover', this.handleHover, this);
    this.circle.on('pointerout', this.handleHoverOut, this);

    // Spawn animation
    this.container.setScale(0);
    scene.tweens.add({
      targets: this.container,
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });

    // Pulsing glow effect
    scene.tweens.add({
      targets: this.glowRing,
      scale: { from: 0.9, to: 1.1 },
      alpha: { from: 0.15, to: 0.05 },
      duration: 600,
      yoyo: true,
      repeat: -1
    });
  }

  private handleClick(): void {
    if (this.isDestroyed) return;
    
    // Pop effect before callback
    this.scene.tweens.add({
      targets: this.container,
      scale: 1.3,
      duration: 80,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.onClickCallback();
      }
    });
  }

  private handleHover(): void {
    if (this.isDestroyed) return;
    
    this.scene.tweens.add({
      targets: this.container,
      scale: 1.1,
      duration: 100
    });
  }

  private handleHoverOut(): void {
    if (this.isDestroyed) return;
    
    this.scene.tweens.add({
      targets: this.container,
      scale: 1,
      duration: 100
    });
  }

  update(): void {
    if (this.isDestroyed) return;

    const elapsed = this.scene.time.now - this.startTime;
    const remaining = Math.max(0, this.lifetime - elapsed);
    const progress = remaining / this.lifetime;

    // Draw timer ring
    this.timerRing.clear();
    if (progress > 0) {
      // Color transitions from white to red as time runs out
      const timerColor = progress > 0.3 ? 0xffffff : 0xff4444;
      const alpha = progress > 0.3 ? 0.8 : 0.9;
      
      this.timerRing.lineStyle(4, timerColor, alpha);
      
      // Draw arc from top, going clockwise
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + (progress * Math.PI * 2);
      
      this.timerRing.beginPath();
      this.timerRing.arc(0, 0, this.radius + 6, startAngle, endAngle, false);
      this.timerRing.strokePath();

      // Urgency shake when low on time
      if (progress < 0.2 && progress > 0) {
        const shake = Math.sin(this.scene.time.now * 0.05) * 2;
        this.container.x = this.x + shake;
      }
    }

    // Check if expired
    if (remaining <= 0) {
      this.expire();
    }
  }

  private expire(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    // Fade out with red flash
    this.circle.setFillStyle(0xff0000);
    
    this.scene.tweens.add({
      targets: this.container,
      scale: 0,
      alpha: 0,
      duration: 300,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.onExpireCallback();
        this.container.destroy();
      }
    });
  }

  destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    // Already handled by click animation, just clean up
    this.scene.time.delayedCall(100, () => {
      if (this.container && this.container.active) {
        this.container.destroy();
      }
    });
  }

  destroyImmediate(): void {
    this.isDestroyed = true;
    if (this.container && this.container.active) {
      this.container.destroy();
    }
  }
}
