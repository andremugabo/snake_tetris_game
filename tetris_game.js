// Tetris Game Implementation
class TetrisGame {
    constructor() {
        this.boardWidth = 10;
        this.boardHeight = 20;
        this.board = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.highScore = 0;
        this.level = 1;
        this.lines = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.gameInterval = null;
        this.init();
    }

    init() {
        this.loadHighScore();
        this.createBoard();
        this.setupKeyboardControls();
        // Don't auto-start - wait for user to click "Play Tetris"
        // this.resetGame();
    }

    loadHighScore() {
        this.highScore = parseInt(localStorage.getItem('tetrisHighScore')) || 0;
        const highScoreEl = document.getElementById('tetris-high-score');
        if (highScoreEl) {
            highScoreEl.textContent = this.highScore;
        }
    }

    saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('tetrisHighScore', this.highScore);
            const highScoreEl = document.getElementById('tetris-high-score');
            if (highScoreEl) {
                highScoreEl.textContent = this.highScore;
            }
            return true; // New high score
        }
        return false;
    }

    createBoard() {
        const board = document.getElementById('tetris-board');
        if (!board) {
            console.error('Tetris board element not found');
            return;
        }

        board.innerHTML = '';
        board.style.gridTemplateColumns = `repeat(${this.boardWidth}, 30px)`;
        board.style.gridTemplateRows = `repeat(${this.boardHeight}, 30px)`;

        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell tetris-cell';
                cell.id = `tetris-${x}-${y}`;
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
            // Only handle if Tetris is the current game
            if (currentGame !== this) return;

            // Prevent page scrolling
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Space'].includes(e.key)) {
                e.preventDefault();
            }

            // Handle pause
            if (e.key === ' ' || e.key === 'Space') {
                this.togglePause();
                return;
            }

            this.handleInput(e.key);
        };

        document.addEventListener('keydown', this.keyHandler);
    }

    resetGame() {
        this.board = Array(this.boardHeight).fill().map(() => 
            Array(this.boardWidth).fill(0)
        );
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.isRunning = false;
        this.isPaused = false;

        // Update UI
        const scoreEl = document.getElementById('tetris-score');
        const levelEl = document.getElementById('tetris-level');
        const linesEl = document.getElementById('tetris-lines');
        const gameOverEl = document.getElementById('tetris-game-over');

        if (scoreEl) scoreEl.textContent = '0';
        if (levelEl) levelEl.textContent = '1';
        if (linesEl) linesEl.textContent = '0';
        if (gameOverEl) gameOverEl.style.display = 'none';

        this.spawnNewPiece();
        this.startGame();
    }

    startGame() {
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
        }
        this.isRunning = true;
        this.isPaused = false;
        const speed = Math.max(100, 1000 - (this.level - 1) * 100);
        this.gameInterval = setInterval(() => this.gameLoop(), speed);
    }

    togglePause() {
        if (!this.isRunning) return;

        this.isPaused = !this.isPaused;
        const pauseEl = document.getElementById('tetris-pause-indicator');
        
        if (pauseEl) {
            pauseEl.style.display = this.isPaused ? 'block' : 'none';
        }
    }

    gameLoop() {
        if (!this.isRunning || this.isPaused) return;

        if (!this.movePiece(0, 1)) {
            // Piece can't move down
            this.lockPiece();
            const linesCleared = this.clearLines();
            
            if (linesCleared > 0) {
                soundManager.playSound('lineclear');
            }
            
            this.spawnNewPiece();
            
            if (!this.isValidPosition(this.currentPiece)) {
                soundManager.playSound('gameover');
                this.gameOver();
            }
        }

        this.updateDisplay();
    }

    // Tetromino definitions with colors
    static TETROMINOES = {
        I: {
            shape: [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
            color: 'piece-I'
        },
        O: {
            shape: [[0,0,0,0], [0,1,1,0], [0,1,1,0], [0,0,0,0]],
            color: 'piece-O'
        },
        T: {
            shape: [[0,0,0,0], [0,1,0,0], [1,1,1,0], [0,0,0,0]],
            color: 'piece-T'
        },
        S: {
            shape: [[0,0,0,0], [0,1,1,0], [1,1,0,0], [0,0,0,0]],
            color: 'piece-S'
        },
        Z: {
            shape: [[0,0,0,0], [1,1,0,0], [0,1,1,0], [0,0,0,0]],
            color: 'piece-Z'
        },
        J: {
            shape: [[0,0,0,0], [1,0,0,0], [1,1,1,0], [0,0,0,0]],
            color: 'piece-J'
        },
        L: {
            shape: [[0,0,0,0], [0,0,1,0], [1,1,1,0], [0,0,0,0]],
            color: 'piece-L'
        }
    };

    static TETROMINO_NAMES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

    spawnNewPiece() {
        const name = TetrisGame.TETROMINO_NAMES[
            Math.floor(Math.random() * TetrisGame.TETROMINO_NAMES.length)
        ];
        const pieceData = TetrisGame.TETROMINOES[name];
        
        this.currentPiece = {
            name: name,
            shape: pieceData.shape.map(row => [...row]), // Deep copy
            color: pieceData.color,
            x: 3,
            y: 0
        };
    }

    isValidPosition(piece, xOffset = 0, yOffset = 0) {
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                if (piece.shape[y][x]) {
                    const boardX = piece.x + x + xOffset;
                    const boardY = piece.y + y + yOffset;

                    // Check boundaries
                    if (boardX < 0 || boardX >= this.boardWidth || boardY >= this.boardHeight) {
                        return false;
                    }

                    // Check collision with placed pieces
                    if (boardY >= 0 && this.board[boardY][boardX]) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    movePiece(xOffset, yOffset) {
        if (this.isValidPosition(this.currentPiece, xOffset, yOffset)) {
            this.currentPiece.x += xOffset;
            this.currentPiece.y += yOffset;
            return true;
        }
        return false;
    }

    rotatePiece() {
        if (!this.currentPiece) return;

        const originalShape = this.currentPiece.shape;
        
        // Create rotated matrix (transpose and reverse rows)
        const rotated = originalShape[0].map((_, index) =>
            originalShape.map(row => row[index]).reverse()
        );

        this.currentPiece.shape = rotated;

        if (!this.isValidPosition(this.currentPiece)) {
            // Try wall kicks
            const kicks = [[1,0], [-1,0], [0,-1], [1,-1], [-1,-1], [2,0], [-2,0]];
            let kicked = false;
            
            for (const [xKick, yKick] of kicks) {
                if (this.isValidPosition(this.currentPiece, xKick, yKick)) {
                    this.currentPiece.x += xKick;
                    this.currentPiece.y += yKick;
                    soundManager.playSound('rotate');
                    kicked = true;
                    break;
                }
            }
            
            // Revert if no kick works
            if (!kicked) {
                this.currentPiece.shape = originalShape;
            }
        } else {
            soundManager.playSound('rotate');
        }
    }

    lockPiece() {
        if (!this.currentPiece) return;

        const piece = this.currentPiece;
        
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                if (piece.shape[y][x]) {
                    const boardX = piece.x + x;
                    const boardY = piece.y + y;
                    
                    if (boardY >= 0 && boardY < this.boardHeight && 
                        boardX >= 0 && boardX < this.boardWidth) {
                        this.board[boardY][boardX] = piece.color;
                    }
                }
            }
        }
    }

    clearLines() {
        let linesCleared = 0;

        for (let y = this.boardHeight - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                // Remove the completed line
                this.board.splice(y, 1);
                // Add new empty line at top
                this.board.unshift(Array(this.boardWidth).fill(0));
                linesCleared++;
                y++; // Re-check the same index
            }
        }

        if (linesCleared > 0) {
            // Update game state with Tetris scoring
            const linePoints = [0, 100, 300, 500, 800];
            this.score += linePoints[linesCleared] * this.level;
            this.lines += linesCleared;
            
            const newLevel = Math.floor(this.lines / 10) + 1;
            if (newLevel > this.level) {
                this.level = newLevel;
                soundManager.playSound('levelup');
                // Restart with new speed
                this.startGame();
            }

            const scoreEl = document.getElementById('tetris-score');
            const levelEl = document.getElementById('tetris-level');
            const linesEl = document.getElementById('tetris-lines');

            if (scoreEl) scoreEl.textContent = this.score;
            if (levelEl) levelEl.textContent = this.level;
            if (linesEl) linesEl.textContent = this.lines;
        }

        return linesCleared;
    }

    hardDrop() {
        if (!this.currentPiece) return;

        let dropDistance = 0;
        while (this.movePiece(0, 1)) {
            dropDistance++;
        }
        
        // Bonus points for hard drop
        this.score += dropDistance * 2;
        const scoreEl = document.getElementById('tetris-score');
        if (scoreEl) scoreEl.textContent = this.score;

        this.lockPiece();
        const linesCleared = this.clearLines();
        
        if (linesCleared > 0) {
            soundManager.playSound('lineclear');
        }
        
        this.spawnNewPiece();
        
        if (!this.isValidPosition(this.currentPiece)) {
            soundManager.playSound('gameover');
            this.gameOver();
        }
        
        this.updateDisplay();
    }

    updateDisplay() {
        const board = document.getElementById('tetris-board');
        if (!board) return;

        // Clear board
        const cells = board.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.className = 'cell tetris-cell';
        });

        // Draw locked pieces
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                if (this.board[y][x]) {
                    const cell = document.getElementById(`tetris-${x}-${y}`);
                    if (cell) {
                        cell.className = `cell tetris-piece ${this.board[y][x]}`;
                    }
                }
            }
        }

        // Draw current piece
        if (this.currentPiece) {
            const piece = this.currentPiece;
            for (let y = 0; y < 4; y++) {
                for (let x = 0; x < 4; x++) {
                    if (piece.shape[y][x]) {
                        const boardX = piece.x + x;
                        const boardY = piece.y + y;
                        
                        if (boardY >= 0 && boardY < this.boardHeight && 
                            boardX >= 0 && boardX < this.boardWidth) {
                            const cell = document.getElementById(`tetris-${boardX}-${boardY}`);
                            if (cell) {
                                cell.className = `cell tetris-piece ${piece.color}`;
                            }
                        }
                    }
                }
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
        const gameOverEl = document.getElementById('tetris-game-over');
        const finalScoreEl = document.getElementById('tetris-final-score');
        const highScoreMessageEl = document.getElementById('tetris-high-score-message');

        if (gameOverEl) gameOverEl.style.display = 'block';
        if (finalScoreEl) finalScoreEl.textContent = this.score;
        
        if (highScoreMessageEl) {
            highScoreMessageEl.style.display = isNewHighScore ? 'block' : 'none';
        }
    }

    handleInput(key) {
        if (!this.isRunning || this.isPaused) return;

        // Map of valid inputs
        const keyActions = {
            'ArrowLeft': () => {
                if (this.movePiece(-1, 0)) {
                    soundManager.playSound('move');
                }
            },
            'a': () => {
                if (this.movePiece(-1, 0)) {
                    soundManager.playSound('move');
                }
            },
            'A': () => {
                if (this.movePiece(-1, 0)) {
                    soundManager.playSound('move');
                }
            },
            'ArrowRight': () => {
                if (this.movePiece(1, 0)) {
                    soundManager.playSound('move');
                }
            },
            'd': () => {
                if (this.movePiece(1, 0)) {
                    soundManager.playSound('move');
                }
            },
            'D': () => {
                if (this.movePiece(1, 0)) {
                    soundManager.playSound('move');
                }
            },
            'ArrowDown': () => {
                this.movePiece(0, 1);
            },
            's': () => {
                this.movePiece(0, 1);
            },
            'S': () => {
                this.movePiece(0, 1);
            },
            'ArrowUp': () => {
                this.rotatePiece();
            },
            'w': () => {
                this.rotatePiece();
            },
            'W': () => {
                this.rotatePiece();
            }
        };

        const action = keyActions[key];
        if (action) {
            action();
            this.updateDisplay();
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

// Initialize when DOM is ready (handled by game_manager.js)