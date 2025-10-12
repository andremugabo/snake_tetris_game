let snakeGameInstance = null;
let tetrisGameInstance = null;
let currentGame = null;

// Initialize games when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeGames();
    showGameSelection();
    setupTouchControls();
});

function initializeGames() {
    try {
        // Initialize Snake game
        if (typeof SnakeGame !== 'undefined') {
            snakeGameInstance = new SnakeGame();
        } else {
            console.warn('SnakeGame class not found');
        }

        // Initialize Tetris game if available
        if (typeof TetrisGame !== 'undefined') {
            tetrisGameInstance = new TetrisGame();
        } else {
            console.warn('TetrisGame class not available yet');
        }
    } catch (error) {
        console.error('Error initializing games:', error);
    }
}

// Game navigation function
function showGameSelection() {
    const snakeGame = document.getElementById('snake-game');
    const tetrisGame = document.getElementById('tetris-game');
    const gameSelection = document.querySelector('.game-selection');

    if (snakeGame) snakeGame.style.display = 'none';
    if (tetrisGame) tetrisGame.style.display = 'none';
    if (gameSelection) gameSelection.style.display = 'flex';

    // Hide all game over screens
    document.querySelectorAll('.game-over').forEach(screen => {
        screen.style.display = 'none';
    });

    // Hide all pause indicators
    document.querySelectorAll('.pause-indicator').forEach(indicator => {
        indicator.style.display = 'none';
    });

    // Stop current game if running
    if (currentGame) {
        currentGame.isRunning = false;
        if (currentGame.gameInterval) {
            clearInterval(currentGame.gameInterval);
        }
    }

    // Clear current game reference
    currentGame = null;
}

function showGame(gameType) {
    const snakeGame = document.getElementById('snake-game');
    const tetrisGame = document.getElementById('tetris-game');
    const gameSelection = document.querySelector('.game-selection');

    // Hide everything first
    if (gameSelection) gameSelection.style.display = 'none';
    if (snakeGame) snakeGame.style.display = 'none';
    if (tetrisGame) tetrisGame.style.display = 'none';

    // Hide all game over screens
    document.querySelectorAll('.game-over').forEach(screen => {
        screen.style.display = 'none';
    });

    // Hide all pause indicators
    document.querySelectorAll('.pause-indicator').forEach(indicator => {
        indicator.style.display = 'none';
    });

    // Show selected game
    if (gameType === 'snake' && snakeGameInstance) {
        if (snakeGame) snakeGame.style.display = 'block';
        currentGame = snakeGameInstance;
        snakeGameInstance.resetGame();
    } else if (gameType === 'tetris' && tetrisGameInstance) {
        if (tetrisGame) tetrisGame.style.display = 'block';
        currentGame = tetrisGameInstance;
        tetrisGameInstance.resetGame();
    } else {
        console.error(`Game "${gameType}" not available`);
        showGameSelection();
    }
}

// Game restart functions
function restartSnake() {
    const gameOverEl = document.getElementById('snake-game-over');
    if (gameOverEl) gameOverEl.style.display = 'none';
    
    if (snakeGameInstance) {
        currentGame = snakeGameInstance;
        snakeGameInstance.resetGame();
    }
}

function restartTetris() {
    const gameOverEl = document.getElementById('tetris-game-over');
    if (gameOverEl) gameOverEl.style.display = 'none';
    
    if (tetrisGameInstance) {
        currentGame = tetrisGameInstance;
        tetrisGameInstance.resetGame();
    }
}

// Global keyboard input handler
document.addEventListener('keydown', (event) => {
    if (!currentGame) return;

    // Prevent arrow key and space scrolling
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Space'].includes(event.key)) {
        event.preventDefault();
    }

    // ESC to return to menu
    if (event.key === 'Escape') {
        if (confirm('Return to game selection menu?')) {
            showGameSelection();
        }
        return;
    }

    // Route input to current game
    if (currentGame && typeof currentGame.handleInput === 'function') {
        currentGame.handleInput(event.key);
    }
});

// Touch controls for mobile devices
function setupTouchControls() {
    // Only setup if touch is supported
    if (!('ontouchstart' in window)) return;

    const touchControlsHTML = `
        <div class="touch-controls">
            <button class="touch-btn" data-direction="ArrowLeft">←</button>
            <button class="touch-btn" data-direction="ArrowUp">↑</button>
            <button class="touch-btn" data-direction="ArrowRight">→</button>
            <div></div>
            <button class="touch-btn" data-direction="ArrowDown">↓</button>
            <button class="touch-btn pause-btn" data-direction=" ">⏸</button>
        </div>
    `;

    document.querySelectorAll('.game-container').forEach(container => {
        // Check if controls already exist
        if (!container.querySelector('.touch-controls')) {
            container.insertAdjacentHTML('beforeend', touchControlsHTML);
        }
    });

    // Add event listeners to touch buttons
    document.querySelectorAll('.touch-btn').forEach(btn => {
        // Prevent default touch behavior
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const direction = btn.getAttribute('data-direction');
            if (currentGame && typeof currentGame.handleInput === 'function') {
                currentGame.handleInput(direction);
            }
        }, { passive: false });

        // Also support click for testing on desktop
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const direction = btn.getAttribute('data-direction');
            if (currentGame && typeof currentGame.handleInput === 'function') {
                currentGame.handleInput(direction);
            }
        });
    });
}

// Visibility change handler - pause game when tab is hidden
document.addEventListener('visibilitychange', () => {
    if (document.hidden && currentGame) {
        // Auto-pause when user switches tabs
        if (currentGame.isRunning && !currentGame.isPaused && typeof currentGame.togglePause === 'function') {
            currentGame.togglePause();
        }
    }
});

// Window resize handler - update game display if needed
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (currentGame && typeof currentGame.updateDisplay === 'function') {
            currentGame.updateDisplay();
        }
    }, 250);
});

// Prevent double-tap zoom on mobile
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, { passive: false });

// Cleanup before page unload
window.addEventListener('beforeunload', () => {
    if (snakeGameInstance && typeof snakeGameInstance.destroy === 'function') {
        snakeGameInstance.destroy();
    }
    if (tetrisGameInstance && typeof tetrisGameInstance.destroy === 'function') {
        tetrisGameInstance.destroy();
    }
});