# 🎯 Reflex Royale

A fast-paced reflex game built with TypeScript, Phaser 3, and Vite. Test your reflexes by clicking targets before they disappear!

![Reflex Royale](https://img.shields.io/badge/Game-Reflex%20Royale-e94560?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Phaser](https://img.shields.io/badge/Phaser%203-8C7AE6?style=for-the-badge)

## 🎮 How to Play

1. **Click targets** before they disappear
2. Each successful click = **+1 score**
3. You have **3 lives** (❤️❤️❤️) - miss a target = lose 1 life
4. **Game Over** when all lives are gone
5. Build **combos** by hitting targets in a row! 🔥
6. Difficulty increases over time:
   - Targets spawn faster
   - Less time to click each target
   - Targets get smaller

## ✨ Features

### Gameplay
- **3 Lives System** - More forgiving than instant death!
- **Tutorial Mode** - First 5 targets are slower and bigger
- **Combo Counter** - Track your streaks for bragging rights
- **Wave Milestones** - Celebration every 10 targets hit
- **Progressive Difficulty** - Gentle curve that ramps up over time

### Juice & Polish
- **Sound Effects** - Web Audio API generated sounds
  - Satisfying "pop" on hit
  - "Whoosh" on target spawn
  - "Buzz" on miss
  - Milestone fanfare
- **Visual Feedback**
  - Green flash on hit
  - Red flash + screen shake on miss
  - Particle effects on successful clicks
- **Mobile Support**
  - Haptic vibration feedback (50ms on hit, 200ms on miss)
  - Touch-friendly big targets
- **Countdown Timer** - "3, 2, 1, GO!" before gameplay starts

### Technical
- **Smooth animations** - Tweens for spawn/despawn effects
- **High score tracking** - Saved to localStorage
- **Responsive design** - Scales to fit any screen

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd reflex-royale

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🛠️ Tech Stack

- **TypeScript** - Type-safe JavaScript
- **Phaser 3** - HTML5 game framework
- **Vite** - Fast build tool and dev server
- **Web Audio API** - Programmatic sound generation

## 📁 Project Structure

```
reflex-royale/
├── src/
│   ├── main.ts              # Game configuration & entry point
│   ├── game/
│   │   ├── Target.ts        # Target class with timer ring
│   │   └── SoundManager.ts  # Web Audio sound effects
│   └── scenes/
│       ├── MainMenuScene.ts # Title screen
│       ├── GameScene.ts     # Main gameplay
│       └── GameOverScene.ts # Score & high score display
├── index.html
├── package.json
└── README.md
```

## 🎨 Customization

### Difficulty Settings

In `GameScene.ts`, you can adjust:

```typescript
// Tutorial settings
private readonly TUTORIAL_TARGETS = 5;    // How many easy targets
private readonly TUTORIAL_LIFETIME = 4000; // Tutorial target duration (ms)
private readonly TUTORIAL_RADIUS = 55;     // Tutorial target size

// Normal gameplay
private readonly BASE_LIFETIME = 3500;     // Starting target duration
private readonly MIN_LIFETIME = 1200;      // Fastest target duration
private readonly BASE_RADIUS = 45;         // Starting target size
private readonly MIN_RADIUS = 28;          // Smallest target size
private readonly BASE_SPAWN_INTERVAL = 2500;
private readonly MIN_SPAWN_INTERVAL = 800;
```

### Colors

Target colors are defined in `GameScene.ts`:

```typescript
const TARGET_COLORS = [0xe94560, 0x0f3460, 0x533483, 0x00b4d8, 0x90be6d, 0xf77f00];
```

### Lives

Change `maxLives` in `GameScene.ts` to adjust starting lives (default: 3).

## 📜 License

MIT License - feel free to use and modify!

---

Made with ❤️ and fast reflexes 🎯
