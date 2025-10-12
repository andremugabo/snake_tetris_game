// Snake Game Implementation

class SnakeGame {
    constructor() {
        this.boardSize = 20;
        this.snake = [];
        this.food = null;
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.highScore = 0;
        this.speed = 150;
        this.gameInterval = null;
        this.isRunning = false;
        this.isPaused = false;
        this.init();
    }

    init() {
        this.loadHighScore();
        this.createBoard();
        this.setupKeyboardControls();
        this.resetGame();
    }

    loadHighScore() {
        this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
        const highScoreEl = document.getElementById('snake-high-score');
        if (highScoreEl) {
            highScoreEl.textContent = this.highScore;
        }
    }

    saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            const highScoreEl = document.getElementById('snake-high-score');
            if (highScoreEl) {
                highScoreEl.textContent = this.highScore;
            }
            return true; // New high score
        }
        return false;
    }

    createBoard() {
        const board = document.getElementById('snake-board');
        if (!board) {
            console.error('Snake board element not found');
            return;
        }

        board.innerHTML = '';
        board.style.gridTemplateColumns = `repeat(${this.boardSize}, 20px)`;
        board.style.gridTemplateRows = `repeat(${this.boardSize}, 20px)`;

        for (let y = 0; y < this.boardSize; y++) {
            for (let x = 0; x < this.boardSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.id = `snake-${x}-${y}`;
                board.appendChild(cell);
            }
        }
    }

    setupKeyboardControls() {
        // Prevent duplicate listeners
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
        }

        this.keyHandler = (e) => {
            // Prevent page scrolling with arrow keys
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }

            // Handle pause
            if (e.code === 'Space' || e.key === ' ') {
                this.togglePause();
                return;
            }

            this.handleInput(e.key);
        };

        document.addEventListener('keydown', this.keyHandler);
    }

    resetGame() {
        // Start snake in center
        const center = Math.floor(this.boardSize / 2);
        this.snake = [{ x: center, y: center }];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.speed = 150;
        this.isRunning = false;
        this.isPaused = false;

        // Update UI
        const scoreEl = document.getElementById('snake-score');
        const speedEl = document.getElementById('snake-speed');
        const gameOverEl = document.getElementById('snake-game-over');

        if (scoreEl) scoreEl.textContent = '0';
        if (speedEl) speedEl.textContent = '1';
        if (gameOverEl) gameOverEl.style.display = 'none';

        this.spawnFood();
        this.updateDisplay();
        
        // Only start game if we're actually showing the game (user clicked Play)
        const snakeGameEl = document.getElementById('snake-game');
        if (snakeGameEl && snakeGameEl.style.display !== 'none') {
            this.startGame();
        }
    }

    startGame() {
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
        }
        this.isRunning = true;
        this.isPaused = false;
        this.gameInterval = setInterval(() => this.gameLoop(), this.speed);
    }

    togglePause() {
        if (!this.isRunning) return;

        this.isPaused = !this.isPaused;
        const pauseEl = document.getElementById('snake-pause-indicator');
        
        if (pauseEl) {
            pauseEl.style.display = this.isPaused ? 'block' : 'none';
        }
    }

    gameLoop() {
        if (!this.isRunning || this.isPaused) return;

        // Update direction
        this.direction = this.nextDirection;

        // Calculate new head position
        const head = { ...this.snake[0] };
        switch (this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // Check collision
        if (this.checkCollision(head)) {
            soundManager.playSound('gameover');
            this.gameOver();
            return;
        }

        // Move snake
        this.snake.unshift(head);

        // Check food collection
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            const scoreEl = document.getElementById('snake-score');
            if (scoreEl) scoreEl.textContent = this.score;
            
            soundManager.playSound('eat');

            // Increase speed every 50 points
            if (this.score % 50 === 0) {
                this.speed = Math.max(50, this.speed - 10);
                const speedLevel = Math.floor((150 - this.speed) / 10) + 1;
                const speedEl = document.getElementById('snake-speed');
                if (speedEl) speedEl.textContent = speedLevel;
                
                soundManager.playSound('levelup');
                this.startGame(); // Restart with new speed
            }

            this.spawnFood();
        } else {
            // Remove tail if no food eaten
            this.snake.pop();
        }

        this.updateDisplay();
    }

    checkCollision(head) {
        // Wall collision
        if (head.x < 0 || head.x >= this.boardSize || 
            head.y < 0 || head.y >= this.boardSize) {
            return true;
        }

        // Self collision (check body, not head)
        return this.snake.some(segment => 
            segment.x === head.x && segment.y === head.y
        );
    }

    spawnFood() {
        let newFood;
        let attempts = 0;
        const maxAttempts = this.boardSize * this.boardSize;

        do {
            newFood = {
                x: Math.floor(Math.random() * this.boardSize),
                y: Math.floor(Math.random() * this.boardSize)
            };
            attempts++;

            // Prevent infinite loop if board is full
            if (attempts > maxAttempts) {
                console.warn('Could not spawn food - board might be full');
                return;
            }
        } while (this.snake.some(segment => 
            segment.x === newFood.x && segment.y === newFood.y
        ));

        this.food = newFood;
    }

    updateDisplay() {
        const board = document.getElementById('snake-board');
        if (!board) return;

        // Clear board efficiently
        const cells = board.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.className = 'cell';
        });

        // Draw snake with head distinction
        this.snake.forEach((segment, index) => {
            const cell = document.getElementById(`snake-${segment.x}-${segment.y}`);
            if (cell) {
                if (index === 0) {
                    cell.className = 'cell snake-head';
                } else {
                    cell.className = 'cell snake-body';
                }
            }
        });

        // Draw food
        if (this.food) {
            const foodCell = document.getElementById(`snake-${this.food.x}-${this.food.y}`);
            if (foodCell) {
                foodCell.classList.add('food');
            }
        }
    }

    gameOver() {
        this.isRunning = false;
        this.isPaused = false;
        
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
            this.gameInterval = null;
        }

        // Check and save high score
        const isNewHighScore = this.saveHighScore();

        // Update game over screen
        const gameOverEl = document.getElementById('snake-game-over');
        const finalScoreEl = document.getElementById('snake-final-score');
        const highScoreMessageEl = document.getElementById('snake-high-score-message');

        if (gameOverEl) gameOverEl.style.display = 'block';
        if (finalScoreEl) finalScoreEl.textContent = this.score;
        
        if (highScoreMessageEl) {
            highScoreMessageEl.style.display = isNewHighScore ? 'block' : 'none';
        }
    }

    handleInput(key) {
        if (!this.isRunning || this.isPaused) return;

        // Map of valid inputs to prevent invalid moves
        const directionMap = {
            'ArrowUp': { dir: 'up', opposite: 'down' },
            'ArrowDown': { dir: 'down', opposite: 'up' },
            'ArrowLeft': { dir: 'left', opposite: 'right' },
            'ArrowRight': { dir: 'right', opposite: 'left' },
            'w': { dir: 'up', opposite: 'down' },
            'W': { dir: 'up', opposite: 'down' },
            's': { dir: 'down', opposite: 'up' },
            'S': { dir: 'down', opposite: 'up' },
            'a': { dir: 'left', opposite: 'right' },
            'A': { dir: 'left', opposite: 'right' },
            'd': { dir: 'right', opposite: 'left' },
            'D': { dir: 'right', opposite: 'left' }
        };

        const input = directionMap[key];
        if (input && this.direction !== input.opposite) {
            this.nextDirection = input.dir;
            soundManager.playSound('move');
        }
    }

    // Cleanup method
    destroy() {
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
        }
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
        }
    }
}

// Initialize game when DOM is ready
let snakeGame;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        snakeGame = new SnakeGame();
    });
} else {
    snakeGame = new SnakeGame();
}

// Global restart function
function restartSnakeGame() {
    if (snakeGame) {
        snakeGame.resetGame();
    }
}