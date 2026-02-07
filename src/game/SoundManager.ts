// Sound Manager using Web Audio API
// Generates simple tones programmatically - no external files needed

export class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Create audio context on first user interaction (browser requirement)
    this.initContext();
  }

  private initContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
      this.enabled = false;
    }
  }

  // Resume audio context (needed after user interaction)
  resume(): void {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // Satisfying "pop" sound on successful click
  playPop(): void {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // Main pop tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.1);
    osc.type = 'sine';
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    osc.start(now);
    osc.stop(now + 0.15);

    // Add a click/snap sound
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc2.frequency.setValueAtTime(1200, now);
    osc2.frequency.exponentialRampToValueAtTime(600, now + 0.05);
    osc2.type = 'triangle';
    
    gain2.gain.setValueAtTime(0.2, now);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    
    osc2.start(now);
    osc2.stop(now + 0.05);
  }

  // "Whoosh" sound when target spawns
  playWhoosh(): void {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // White noise burst with filter sweep
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, now);
    filter.frequency.exponentialRampToValueAtTime(500, now + 0.15);
    filter.Q.value = 1;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
  }

  // Sad "buzz" sound when target expires (miss)
  playMiss(): void {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // Low descending buzz
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);
    osc.type = 'sawtooth';
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc.start(now);
    osc.stop(now + 0.3);

    // Second harmonic for richness
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    
    osc2.frequency.setValueAtTime(150, now);
    osc2.frequency.exponentialRampToValueAtTime(60, now + 0.25);
    osc2.type = 'square';
    
    gain2.gain.setValueAtTime(0.1, now);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    
    osc2.start(now);
    osc2.stop(now + 0.25);
  }

  // Celebratory sound for milestones
  playMilestone(): void {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // Play a short ascending arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const startTime = now + i * 0.08;
      osc.frequency.setValueAtTime(freq, startTime);
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
      
      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  }

  // Countdown beep
  playCountdown(final: boolean = false): void {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(final ? 880 : 660, now);
    osc.type = 'sine';
    
    const duration = final ? 0.3 : 0.15;
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    osc.start(now);
    osc.stop(now + duration);
  }

  // Life lost sound
  playLifeLost(): void {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // Descending "oh no" tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.4);
    osc.type = 'triangle';
    
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.setValueAtTime(0.25, now + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    osc.start(now);
    osc.stop(now + 0.5);
  }

  // Game over fanfare
  playGameOver(): void {
    if (!this.enabled || !this.audioContext) return;
    this.resume();

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // Descending sad melody
    const notes = [392, 349.23, 293.66, 261.63]; // G4, F4, D4, C4
    
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const startTime = now + i * 0.2;
      osc.frequency.setValueAtTime(freq, startTime);
      osc.type = 'triangle';
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
      gain.gain.setValueAtTime(0.2, startTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }
}

// Singleton instance
let soundManagerInstance: SoundManager | null = null;

export function getSoundManager(): SoundManager {
  if (!soundManagerInstance) {
    soundManagerInstance = new SoundManager();
  }
  return soundManagerInstance;
}
