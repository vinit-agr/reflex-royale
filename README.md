# 🎯 Reflex Royale

A fast-paced reflex game built with TypeScript, Phaser 3, and Vite. Test your reflexes by clicking targets before they disappear!

![Reflex Royale](https://img.shields.io/badge/Game-Reflex%20Royale-e94560?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Phaser](https://img.shields.io/badge/Phaser%203-8C7AE6?style=for-the-badge)

## 🎮 How to Play

1. **Click targets** before they disappear
2. Each successful click = **+1 score**
3. Miss a target = **Game Over!**
4. Difficulty increases over time:
   - Targets spawn faster
   - Less time to click each target
   - Multiple targets can appear at once

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

## 🎯 Features

- **Smooth animations** - Tweens for spawn/despawn effects
- **Particle effects** - Satisfying burst on successful clicks
- **Visual timer** - Shrinking ring shows time remaining
- **Progressive difficulty** - Gets harder the longer you survive
- **High score tracking** - Saved to localStorage
- **Juicy feedback** - Camera shake, scale pops, and color variety

## 🛠️ Tech Stack

- **TypeScript** - Type-safe JavaScript
- **Phaser 3** - HTML5 game framework
- **Vite** - Fast build tool and dev server

## 📁 Project Structure

```
reflex-royale/
├── src/
│   ├── main.ts              # Game configuration & entry point
│   ├── game/
│   │   └── Target.ts        # Target class with timer ring
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
private baseSpawnInterval: number = 2000;   // Starting spawn rate (ms)
private baseTargetLifetime: number = 2500;  // Starting target duration (ms)
private minSpawnInterval: number = 600;     // Fastest spawn rate
private minTargetLifetime: number = 800;    // Shortest target duration
```

### Colors

Target colors are defined in `GameScene.ts`:

```typescript
const TARGET_COLORS = [0xe94560, 0x0f3460, 0x533483, 0x00b4d8, 0x90be6d, 0xf77f00];
```

## 📜 License

MIT License - feel free to use and modify!

---

Made with ❤️ and fast reflexes 🎯
