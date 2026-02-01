class Tetris {
    constructor() {
        this.canvas = document.getElementById('tetris');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('nextPiece');
        this.nextCtx = this.nextCanvas.getContext('2d');

        this.BLOCK_SIZE = 30;
        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;

        this.board = Array.from({ length: this.BOARD_HEIGHT }, () => Array(this.BOARD_WIDTH).fill(0));

        this.pieces = [
            [[1, 1, 1, 1]],                 // I
            [[1, 0, 0], [1, 1, 1]],          // J
            [[0, 0, 1], [1, 1, 1]],          // L
            [[1, 1], [1, 1]],                // O
            [[0, 1, 1], [1, 1, 0]],          // S
            [[0, 1, 0], [1, 1, 1]],          // T
            [[1, 1, 0], [0, 1, 1]]           // Z
        ];

        this.colors = [
            '#00b894', '#0984e3', '#fdcb6e', '#e17055',
            '#6c5ce7', '#a29bfe', '#e84393'
        ];

        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.isPaused = false;
        this.soundEnabled = true;

        this.currentPiece = null;
        this.nextPiece = null;

        this.pieceX = 0;
        this.pieceY = 0;

        this.dropCounter = 0;
        this.dropInterval = 1000;

        this.touchStartX = 0;
        this.touchStartY = 0;

        // Fondos opacos para evitar estelas
        this.BOARD_BG = '#000000';
        this.NEXT_BG = '#000000';

        // Inicializar sonidos
        this.soundManager = new SoundManager();

        this.init();
    }

    init() {
        this.nextPiece = this.getRandomPiece();
        this.newPiece();

        // Botones de control
        this.setupControls();

        this.updateScore();
        this.draw();
        this.drawNextPiece();

        // Iniciar bucle del juego
        this.lastTime = 0;
        this.update();
    }

    getRandomPiece() {
        const pieceIndex = Math.floor(Math.random() * this.pieces.length);
        return {
            shape: this.pieces[pieceIndex],
            color: this.colors[pieceIndex]
        };
    }

    newPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.getRandomPiece();

        this.pieceX = Math.floor(this.BOARD_WIDTH / 2) - Math.floor(this.currentPiece.shape[0].length / 2);
        this.pieceY = 0;

        // Verificar game over
        if (this.hasCollision()) {
            this.gameOver = true;
            setTimeout(() => {
                alert(`¡Juego Terminado! Puntaje final: ${this.score}`);
            }, 100);
        }

        this.drawNextPiece();
    }

    hasCollision() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardX = this.pieceX + x;
                    const boardY = this.pieceY + y;

                    if (boardX < 0 || boardX >= this.BOARD_WIDTH ||
                        boardY >= this.BOARD_HEIGHT ||
                        (boardY >= 0 && this.board[boardY][boardX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    mergePiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardY = this.pieceY + y;
                    if (boardY >= 0) {
                        this.board[boardY][this.pieceX + x] = this.currentPiece.color;
                    }
                }
            }
        }
    }

    clearLines() {
        let linesCleared = 0;

        for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.BOARD_WIDTH).fill(0));
                linesCleared++;
                y++; // Revisar la misma posición nuevamente
            }
        }

        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += linesCleared * 100 * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
            this.updateScore();
            if (this.soundManager && this.soundManager.sounds.clear) {
                this.soundManager.sounds.clear.play();
            }
        }
    }

    // ✅ Limpieza real (sin estela)
    clearBoardCanvas() {
        // Borra todo (alpha incluido)
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Pinta fondo opaco
        this.ctx.fillStyle = this.BOARD_BG;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // ✅ Limpieza real del canvas de siguiente pieza
    clearNextCanvas() {
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        this.nextCtx.fillStyle = this.NEXT_BG;
        this.nextCtx.fillRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
    }

    draw() {
        // ✅ Antes: rgba(...) => provocaba estela
        // ✅ Ahora: limpieza real
        this.clearBoardCanvas();

        // Dibujar bloques en el tablero
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (this.board[y][x]) {
                    this.drawBlock(x, y, this.board[y][x]);
                }
            }
        }

        // Dibujar pieza actual
        if (this.currentPiece && !this.gameOver) {
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x]) {
                        this.drawBlock(this.pieceX + x, this.pieceY + y, this.currentPiece.color);
                    }
                }
            }
        }

        // Dibujar grid
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;

        for (let x = 0; x <= this.BOARD_WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.BLOCK_SIZE, 0);
            this.ctx.lineTo(x * this.BLOCK_SIZE, this.BOARD_HEIGHT * this.BLOCK_SIZE);
            this.ctx.stroke();
        }

        for (let y = 0; y <= this.BOARD_HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.BLOCK_SIZE);
            this.ctx.lineTo(this.BOARD_WIDTH * this.BLOCK_SIZE, y * this.BLOCK_SIZE);
            this.ctx.stroke();
        }
    }

    drawBlock(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x * this.BLOCK_SIZE, y * this.BLOCK_SIZE, this.BLOCK_SIZE, this.BLOCK_SIZE);

        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x * this.BLOCK_SIZE, y * this.BLOCK_SIZE, this.BLOCK_SIZE, this.BLOCK_SIZE);

        // Efecto 3D
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.fillRect(x * this.BLOCK_SIZE, y * this.BLOCK_SIZE, this.BLOCK_SIZE, 2);
        this.ctx.fillRect(x * this.BLOCK_SIZE, y * this.BLOCK_SIZE, 2, this.BLOCK_SIZE);

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(x * this.BLOCK_SIZE + this.BLOCK_SIZE - 2, y * this.BLOCK_SIZE, 2, this.BLOCK_SIZE);
        this.ctx.fillRect(x * this.BLOCK_SIZE, y * this.BLOCK_SIZE + this.BLOCK_SIZE - 2, this.BLOCK_SIZE, 2);
    }

    drawNextPiece() {
        if (!this.nextPiece) return;

        // ✅ Antes: rgba(...) => también dejaba estela en "Siguiente"
        // ✅ Ahora: limpieza real
        this.clearNextCanvas();

        const piece = this.nextPiece;
        const blockSize = 20;
        const offsetX = (this.nextCanvas.width - piece.shape[0].length * blockSize) / 2;
        const offsetY = (this.nextCanvas.height - piece.shape.length * blockSize) / 2;

        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    this.nextCtx.fillStyle = piece.color;
                    this.nextCtx.fillRect(
                        offsetX + x * blockSize,
                        offsetY + y * blockSize,
                        blockSize - 1,
                        blockSize - 1
                    );

                    this.nextCtx.strokeStyle = 'white';
                    this.nextCtx.lineWidth = 1;
                    this.nextCtx.strokeRect(
                        offsetX + x * blockSize,
                        offsetY + y * blockSize,
                        blockSize - 1,
                        blockSize - 1
                    );
                }
            }
        }
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
    }

    // MOVIMIENTOS
    move(dx) {
        if (this.isPaused || this.gameOver) return;

        this.pieceX += dx;
        if (this.hasCollision()) {
            this.pieceX -= dx;
        } else {
            if (this.soundManager && this.soundManager.sounds.move) {
                this.soundManager.sounds.move.play();
            }
            this.buttonFeedback(dx > 0 ? 'rightBtn' : 'leftBtn');
            this.draw();
        }
    }

    rotatePiece() {
        if (this.isPaused || this.gameOver) return;

        const shape = this.currentPiece.shape;
        const rotated = [];

        // Rotar 90 grados
        for (let i = 0; i < shape[0].length; i++) {
            rotated.push([]);
            for (let j = shape.length - 1; j >= 0; j--) {
                rotated[i].push(shape[j][i]);
            }
        }

        const oldShape = this.currentPiece.shape;
        this.currentPiece.shape = rotated;

        if (this.hasCollision()) {
            this.currentPiece.shape = oldShape;
        } else {
            if (this.soundManager && this.soundManager.sounds.rotate) {
                this.soundManager.sounds.rotate.play();
            }
            this.buttonFeedback('rotateBtn');
            this.draw();
        }
    }

    drop() {
        if (this.isPaused || this.gameOver) return;

        this.pieceY++;
        if (this.hasCollision()) {
            this.pieceY--;
            this.mergePiece();
            this.clearLines();
            this.newPiece();
            if (this.soundManager && this.soundManager.sounds.drop) {
                this.soundManager.sounds.drop.play();
            }
        } else {
            this.buttonFeedback('downBtn');
        }
        this.draw();
    }

    hardDrop() {
        if (this.isPaused || this.gameOver) return;

        while (!this.hasCollision()) {
            this.pieceY++;
        }
        this.pieceY--;
        this.mergePiece();
        this.clearLines();
        this.newPiece();
        this.buttonFeedback('hardDropBtn');
        this.draw();
    }

    // CONTROLES
    setupControls() {
        // Botones del juego
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        document.getElementById('soundBtn').addEventListener('click', () => this.toggleSound());

        // Controles táctiles (botones virtuales)
        document.getElementById('leftBtn').addEventListener('click', () => this.move(-1));
        document.getElementById('rightBtn').addEventListener('click', () => this.move(1));
        document.getElementById('downBtn').addEventListener('click', () => this.drop());
        document.getElementById('rotateBtn').addEventListener('click', () => this.rotatePiece());
        document.getElementById('hardDropBtn').addEventListener('click', () => this.hardDrop());

        // Eventos táctiles (swipe)
        this.setupTouchControls();

        // Eventos de teclado
        document.addEventListener('keydown', (e) => {
        const keysToBlock = ['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '];
        if (keysToBlock.includes(e.key)) {
            e.preventDefault();   // ✅ evita que la página se mueva
        }
        this.handleKeyPress(e);
        }, { passive: false });

    }

    setupTouchControls() {
        let touchStartX, touchStartY;

        this.canvas.addEventListener('touchstart', (e) => {
            if (this.isPaused || this.gameOver) return;
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            e.preventDefault();
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            if (this.isPaused || this.gameOver) return;

            const touch = e.changedTouches[0];
            const touchEndX = touch.clientX;
            const touchEndY = touch.clientY;

            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;
            const minSwipe = 30;

            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipe) {
                // Swipe horizontal
                if (dx > 0) this.move(1);
                else this.move(-1);
            } else if (Math.abs(dy) > minSwipe) {
                // Swipe vertical
                if (dy > 0) this.drop();
                else this.rotatePiece();
            }

            e.preventDefault();
        }, { passive: false });
    }

    handleKeyPress(e) {
        if (this.isPaused || this.gameOver) return;

        switch (e.key) {
            case 'ArrowLeft':
                this.move(-1);
                break;
            case 'ArrowRight':
                this.move(1);
                break;
            case 'ArrowDown':
                this.drop();
                break;
            case 'ArrowUp':
                this.rotatePiece();
                break;
            case ' ':
                this.hardDrop();
                break;
            case 'p':
            case 'P':
                this.togglePause();
                break;
        }
    }

    // CONTROL DEL JUEGO
    start() {
        if (!this.gameLoop && !this.isPaused) {
            this.gameLoop = setInterval(() => {
                if (!this.isPaused && !this.gameOver) {
                    this.drop();
                    this.draw();
                }
            }, this.dropInterval);
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseBtn');

        if (this.isPaused) {
            pauseBtn.innerHTML = '<i class="fas fa-play"></i> Reanudar';
        } else {
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pausar';
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        if (this.soundManager) {
            this.soundManager.enabled = this.soundEnabled;
        }

        const soundBtn = document.getElementById('soundBtn');

        if (this.soundEnabled) {
            soundBtn.innerHTML = '<i class="fas fa-volume-up"></i> Sonido';
        } else {
            soundBtn.innerHTML = '<i class="fas fa-volume-mute"></i> Sonido';
        }
    }

    reset() {
        clearInterval(this.gameLoop);
        this.gameLoop = null;

        this.board = Array.from({ length: this.BOARD_HEIGHT }, () => Array(this.BOARD_WIDTH).fill(0));
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.isPaused = false;
        this.dropInterval = 1000;

        this.nextPiece = this.getRandomPiece();
        this.newPiece();

        // Resetear botón de pausa
        const pauseBtn = document.getElementById('pauseBtn');
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pausar';

        this.updateScore();
        this.draw();
        this.drawNextPiece();
    }

    buttonFeedback(buttonId) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.classList.add('button-press');
            setTimeout(() => {
                button.classList.remove('button-press');
            }, 200);
        }
    }

    update(time = 0) {
        if (!this.isPaused && !this.gameOver) {
            const deltaTime = time - this.lastTime || 0;
            this.lastTime = time;

            this.dropCounter += deltaTime;
            if (this.dropCounter > this.dropInterval) {
                this.drop();
                this.dropCounter = 0;
            }
        }

        requestAnimationFrame((time) => this.update(time));
    }
}

// Inicializar el juego cuando la página cargue
window.addEventListener('load', () => {
    const tetris = new Tetris();
});
