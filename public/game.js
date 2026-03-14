// Game initialization and main loop
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextCanvas');
        this.nextCtx = this.nextCanvas.getContext('2d');
        
        this.tetris = new Tetris();
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.lastTime = 0;
        this.dropCounter = 0;
        this.dropInterval = 1000;
        
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        
        this.setupEventListeners();
        this.setupMobileControls();
        this.updateDisplay();
        this.gameLoop(0);
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.gameState === 'menu') {
                if (e.code === 'Space') {
                    this.startGame();
                }
                return;
            }
            
            if (this.gameState === 'gameOver') {
                if (e.code === 'Space') {
                    this.restart();
                }
                return;
            }
            
            if (this.gameState === 'playing') {
                switch(e.code) {
                    case 'ArrowLeft':
                    case 'KeyA':
                        this.tetris.move(-1);
                        break;
                    case 'ArrowRight':
                    case 'KeyD':
                        this.tetris.move(1);
                        break;
                    case 'ArrowDown':
                    case 'KeyS':
                        this.tetris.drop();
                        break;
                    case 'ArrowUp':
                    case 'KeyW':
                        this.tetris.rotate();
                        break;
                    case 'Space':
                        this.tetris.hardDrop();
                        break;
                    case 'KeyP':
                        this.togglePause();
                        break;
                }
            }
            
            if (e.code === 'KeyP') {
                this.togglePause();
            }
        });
        
        // Button controls
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
    }
    
    setupMobileControls() {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            document.getElementById('mobileControls').style.display = 'flex';
        }
        
        document.getElementById('leftBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.gameState === 'playing') this.tetris.move(-1);
        });
        
        document.getElementById('rightBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.gameState === 'playing') this.tetris.move(1);
        });
        
        document.getElementById('downBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.gameState === 'playing') this.tetris.drop();
        });
        
        document.getElementById('rotateBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.gameState === 'playing') this.tetris.rotate();
        });
        
        document.getElementById('holdBtn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.gameState === 'playing') this.tetris.hardDrop();
        });
    }
    
    startGame() {
        this.gameState = 'playing';
        this.tetris.reset();
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.dropInterval = 1000;
        this.hideOverlay();
        this.updateDisplay();
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.showOverlay('PAUSED', 'Press P to resume');
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.hideOverlay();
        }
    }
    
    restart() {
        this.startGame();
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.showOverlay('GAME OVER', `Final Score: ${this.score}\nPress SPACE to restart`);
    }
    
    showOverlay(title, text) {
        const overlay = document.getElementById('gameOverlay');
        const overlayTitle = document.getElementById('overlayTitle');
        const overlayText = document.getElementById('overlayText');
        
        overlayTitle.textContent = title;
        overlayText.innerHTML = text.replace('\n', '<br>');
        overlay.classList.remove('hidden');
    }
    
    hideOverlay() {
        document.getElementById('gameOverlay').classList.add('hidden');
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score.toLocaleString();
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) {
            if (!this.tetris.drop()) {
                // Piece has landed
                const linesCleared = this.tetris.clearLines();
                if (linesCleared > 0) {
                    this.lines += linesCleared;
                    this.score += this.calculateScore(linesCleared);
                    this.level = Math.floor(this.lines / 10) + 1;
                    this.dropInterval = Math.max(50, 1000 - (this.level - 1) * 50);
                }
                
                if (!this.tetris.spawn()) {
                    this.gameOver();
                    return;
                }
                
                this.updateDisplay();
            }
            this.dropCounter = 0;
        }
    }
    
    calculateScore(linesCleared) {
        const baseScore = [0, 40, 100, 300, 1200];
        return baseScore[linesCleared] * this.level;
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render grid background
        this.renderGrid();
        
        // Render tetris game
        this.tetris.render(this.ctx);
        
        // Render next piece
        this.renderNextPiece();
    }
    
    renderGrid() {
        const blockSize = 30;
        this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x <= this.canvas.width; x += blockSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= this.canvas.height; y += blockSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    renderNextPiece() {
        this.nextCtx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        
        if (this.tetris.nextPiece) {
            const piece = this.tetris.nextPiece;
            const blockSize = 20;
            const offsetX = (this.nextCanvas.width - piece.matrix[0].length * blockSize) / 2;
            const offsetY = (this.nextCanvas.height - piece.matrix.length * blockSize) / 2;
            
            this.nextCtx.fillStyle = piece.color;
            this.nextCtx.shadowColor = piece.color;
            this.nextCtx.shadowBlur = 10;
            
            for (let y = 0; y < piece.matrix.length; y++) {
                for (let x = 0; x < piece.matrix[y].length; x++) {
                    if (piece.matrix[y][x]) {
                        this.nextCtx.fillRect(
                            offsetX + x * blockSize,
                            offsetY + y * blockSize,
                            blockSize - 1,
                            blockSize - 1
                        );
                    }
                }
            }
            
            this.nextCtx.shadowBlur = 0;
        }
    }
    
    gameLoop(time) {
        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new Game();
});