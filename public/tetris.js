// Tetris game logic
class Tetris {
    constructor() {
        this.arena = this.createMatrix(10, 20);
        this.player = {
            pos: { x: 0, y: 0 },
            matrix: null
        };
        this.nextPiece = null;
        this.pieces = 'TJLOSZI';
        this.colors = {
            'T': '#FF2D7C', // Electric Pink
            'J': '#00F0FF', // Cyber Blue
            'L': '#FF6B35', // Orange Pop
            'O': '#EEFF00', // Neon Yellow
            'S': '#39FF14', // Toxic Green
            'Z': '#FF2D7C', // Electric Pink
            'I': '#00F0FF'  // Cyber Blue
        };
        
        this.pieceTemplates = {
            'T': [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0]
            ],
            'O': [
                [1, 1],
                [1, 1]
            ],
            'L': [
                [0, 0, 1],
                [1, 1, 1],
                [0, 0, 0]
            ],
            'J': [
                [1, 0, 0],
                [1, 1, 1],
                [0, 0, 0]
            ],
            'I': [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0]
            ],
            'S': [
                [0, 1, 1],
                [1, 1, 0],
                [0, 0, 0]
            ],
            'Z': [
                [1, 1, 0],
                [0, 1, 1],
                [0, 0, 0]
            ]
        };
        
        this.blockSize = 30;
    }
    
    createMatrix(width, height) {
        const matrix = [];
        for (let y = 0; y < height; y++) {
            matrix[y] = new Array(width).fill(0);
        }
        return matrix;
    }
    
    createPiece(type) {
        const matrix = this.pieceTemplates[type].map(row => [...row]);
        return {
            matrix: matrix,
            color: this.colors[type],
            type: type
        };
    }
    
    randomPiece() {
        const pieces = 'TJLOSZI';
        const type = pieces[Math.floor(Math.random() * pieces.length)];
        return this.createPiece(type);
    }
    
    reset() {
        this.arena = this.createMatrix(10, 20);
        this.spawn();
    }
    
    spawn() {
        if (this.nextPiece) {
            this.player.matrix = this.nextPiece;
        } else {
            this.player.matrix = this.randomPiece();
        }
        
        this.nextPiece = this.randomPiece();
        this.player.pos.y = 0;
        this.player.pos.x = Math.floor(this.arena[0].length / 2) - Math.floor(this.player.matrix.matrix[0].length / 2);
        
        // Check if spawn position is valid
        if (this.collide(this.arena, this.player)) {
            return false; // Game over
        }
        
        return true;
    }
    
    move(dir) {
        this.player.pos.x += dir;
        if (this.collide(this.arena, this.player)) {
            this.player.pos.x -= dir;
        }
    }
    
    rotate() {
        const pos = this.player.pos.x;
        let offset = 1;
        this.rotateMatrix(this.player.matrix.matrix);
        
        while (this.collide(this.arena, this.player)) {
            this.player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > this.player.matrix.matrix[0].length) {
                this.rotateMatrix(this.player.matrix.matrix, -1);
                this.player.pos.x = pos;
                return;
            }
        }
    }
    
    rotateMatrix(matrix, dir = 1) {
        for (let y = 0; y < matrix.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
            }
        }
        
        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }
    }
    
    drop() {
        this.player.pos.y++;
        if (this.collide(this.arena, this.player)) {
            this.player.pos.y--;
            this.merge(this.arena, this.player);
            return false; // Piece has landed
        }
        return true; // Piece is still falling
    }
    
    hardDrop() {
        while (this.drop()) {
            // Continue dropping until piece lands
        }
    }
    
    collide(arena, player) {
        const [m, o] = [player.matrix.matrix, player.pos];
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 &&
                   (arena[y + o.y] &&
                    arena[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }
    
    merge(arena, player) {
        const piece = player.matrix;
        player.matrix.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    arena[y + player.pos.y][x + player.pos.x] = {
                        color: piece.color,
                        type: piece.type
                    };
                }
            });
        });
    }
    
    clearLines() {
        let rowCount = 1;
        let linesCleared = 0;
        
        outer: for (let y = this.arena.length - 1; y > 0; --y) {
            for (let x = 0; x < this.arena[y].length; ++x) {
                if (this.arena[y][x] === 0) {
                    continue outer;
                }
            }
            
            const row = this.arena.splice(y, 1)[0].fill(0);
            this.arena.unshift(row);
            ++y;
            linesCleared++;
        }
        
        return linesCleared;
    }
    
    render(ctx) {
        // Render arena (placed blocks)
        this.renderMatrix(ctx, this.arena, { x: 0, y: 0 });
        
        // Render current piece
        if (this.player.matrix) {
            this.renderPiece(ctx, this.player.matrix, this.player.pos);
        }
    }
    
    renderMatrix(ctx, matrix, offset) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    ctx.fillStyle = value.color;
                    ctx.shadowColor = value.color;
                    ctx.shadowBlur = 15;
                    
                    const posX = (x + offset.x) * this.blockSize;
                    const posY = (y + offset.y) * this.blockSize;
                    
                    ctx.fillRect(posX, posY, this.blockSize - 2, this.blockSize - 2);
                    
                    // Add inner highlight
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.fillRect(posX + 2, posY + 2, this.blockSize - 6, this.blockSize - 6);
                }
            });
        });
        
        ctx.shadowBlur = 0;
    }
    
    renderPiece(ctx, piece, offset) {
        piece.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    ctx.fillStyle = piece.color;
                    ctx.shadowColor = piece.color;
                    ctx.shadowBlur = 20;
                    
                    const posX = (x + offset.x) * this.blockSize;
                    const posY = (y + offset.y) * this.blockSize;
                    
                    ctx.fillRect(posX, posY, this.blockSize - 2, this.blockSize - 2);
                    
                    // Add inner highlight for active piece
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                    ctx.fillRect(posX + 3, posY + 3, this.blockSize - 8, this.blockSize - 8);
                    
                    // Add extra glow for active piece
                    ctx.shadowColor = piece.color;
                    ctx.shadowBlur = 30;
                    ctx.fillStyle = piece.color;
                    ctx.globalAlpha = 0.3;
                    ctx.fillRect(posX - 2, posY - 2, this.blockSize + 2, this.blockSize + 2);
                    ctx.globalAlpha = 1;
                }
            });
        });
        
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
    }
}