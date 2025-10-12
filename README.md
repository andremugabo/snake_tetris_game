# snake_tetris_game


A modern web-based implementation of two iconic retro games: **Snake** and **Tetris**. Built with vanilla JavaScript, featuring beautiful animations, sound effects, and full mobile support.

![Game Preview](https://img.shields.io/badge/Games-Snake%20%7C%20Tetris-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)

## 🌟 Features

### 🐍 Snake Game
- **Classic gameplay** with smooth controls
- **Progressive difficulty** - speed increases every 50 points
- **High score tracking** with localStorage persistence
- **Pause functionality** - press SPACE to pause/resume
- **Multiple control schemes** - Arrow keys or WASD
- **Sound effects** for eating, game over, and level up

### 🧱 Tetris Game
- **Seven classic Tetrominos** (I, O, T, S, Z, J, L) with authentic colors
- **Line clearing mechanics** with combo scoring
- **Progressive speed** - increases every 10 lines
- **Wall kick rotation** for smooth piece movement
- **Hard drop** for quick placement
- **High score system** with celebration effects

### 🎵 Sound System
- **Web Audio API** implementation with custom sound synthesis
- **Persistent settings** - remembers sound preferences
- **Multiple sound types** - move, eat, rotate, line clear, game over, level up
- **Volume control** with localStorage

### 📱 Mobile Support
- **Touch controls** with on-screen buttons (←, ↑, →, ↓, Pause)
- **Responsive design** adapts to all screen sizes
- **Prevents double-tap zoom** for better gameplay
- **Auto-pause** when switching tabs

### ♿ Accessibility
- **ARIA labels** for screen readers
- **Keyboard navigation** throughout
- **High contrast** game boards
- **Clear visual feedback** for all actions

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server required - runs entirely in the browser!

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/andremugabo/snake_tetris_game.git
   cd snake_tetris_game
   ```

2. **Open in browser**
   ```bash
   # Simply open index.html in your browser
   # Or use a local server (optional):
   python -m http.server 8000
   # Then visit http://localhost:8000
   ```

3. **Play!**
   - Choose your game from the menu
   - Use arrow keys or WASD to play
   - Press SPACE to pause
   - Press ESC to return to menu

## 🎯 How to Play

### Snake Controls
| Key | Action |
|-----|--------|
| Arrow Keys / WASD | Move snake |
| SPACE | Pause/Resume |
| ESC | Return to menu |

**Objective:** Eat the red food to grow longer and score points. Don't hit the walls or yourself!

### Tetris Controls
| Key | Action |
|-----|--------|
| Arrow Left/Right or A/D | Move piece horizontally |
| Arrow Up or W | Rotate piece |
| Arrow Down or S | Soft drop |
| SPACE | Pause/Resume |
| ESC | Return to menu |

**Objective:** Complete horizontal lines to clear them and score points. Game ends when pieces reach the top!

## 📂 Project Structure

```
snake_tetris_game/
├── index.html           # Main HTML file
├── styles.css           # All styling and animations
├── sound_manager.js     # Web Audio API sound system
├── snake_game.js        # Snake game logic
├── tetris_game.js       # Tetris game logic
├── game_manager.js      # Navigation and touch controls
└── README.md           # This file
```

## 🎨 Customization

### Changing Colors

**Snake colors** (in `styles.css`):
```css
.snake-head { background: #4caf50; }  /* Head color */
.snake-body { background: #66bb6a; }  /* Body color */
.food { background: #ff5252; }        /* Food color */
```

**Tetris piece colors** (in `styles.css`):
```css
.piece-I { background: #00f0f0; }  /* Cyan */
.piece-O { background: #f0f000; }  /* Yellow */
.piece-T { background: #a000f0; }  /* Purple */
/* ... and so on */
```

### Adjusting Game Speed

**Snake** (in `snake_game.js`):
```javascript
this.speed = 150;  // Lower = faster (milliseconds)
```

**Tetris** (in `tetris_game.js`):
```javascript
const speed = Math.max(100, 1000 - (this.level - 1) * 100);
```

### Sound Customization

Edit sound frequencies in `sound_manager.js`:
```javascript
this.soundPresets = {
    eat: { frequency: 800, duration: 0.1, type: 'sine' },
    // Modify frequency, duration, or waveform type
};
```

## 🏆 Scoring System

### Snake
- **+10 points** per food eaten
- **Speed increases** every 50 points
- High score saved automatically

### Tetris
- **Single line:** 100 × level
- **Double line:** 300 × level
- **Triple line:** 500 × level
- **Tetris (4 lines):** 800 × level
- **Hard drop bonus:** 2 points per row

## 🐛 Known Issues

- None currently! 🎉

## 🛠️ Technologies Used

- **HTML5** - Structure and Canvas
- **CSS3** - Styling, animations, gradients
- **JavaScript (ES6+)** - Game logic and interactivity
- **Web Audio API** - Sound effects
- **LocalStorage API** - Score and settings persistence

## 📱 Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 14+ | ✅ Full |
| Edge | 90+ | ✅ Full |
| Mobile Safari | iOS 14+ | ✅ Full |
| Chrome Mobile | Android 8+ | ✅ Full |

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Ideas for Contributions
- Add more games (Pac-Man, Breakout, Space Invaders)
- Implement multiplayer mode
- Add difficulty levels
- Create custom themes
- Add achievements system
- Implement leaderboard



## 👏 Acknowledgments

- Inspired by the classic arcade games of the 1970s-1980s
- Sound effects generated using Web Audio API
- Icons from native emoji sets
- Built with ❤️ and vanilla JavaScript

## 📧 Contact

- **GitHub:** [@andremugabo](https://github.com/andremugabo)
- **Email:** andremugabo@yahoo.fr
- **Website:** https://yourwebsite.com

## 🎮 Screenshots

### Game Selection Menu
Beautiful gradient background with game selection cards.

### Snake Game
Classic snake gameplay with smooth animations and growing snake.

### Tetris Game
Authentic Tetris with colored pieces and line clearing effects.

### Mobile View
Fully responsive with touch controls for mobile devices.

---

**Enjoy the games! 🎮 Star ⭐ this repo if you found it helpful!**