const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');

// Jugador
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50,
    height: 30,
    speed: 8,
    color: '#0ff'
};

// Disparos
let bullets = [];

// Enemigos
let enemies = [];
const enemyRows = 5;
const enemyCols = 10;

// Inicializar enemigos
function initEnemies() {
    enemies = [];
    for (let r = 0; r < enemyRows; r++) {
        for (let c = 0; c < enemyCols; c++) {
            enemies.push({
                x: c * 70 + 30,
                y: r * 50 + 30,
                width: 40,
                height: 40,
                alive: true,
                color: r % 2 === 0 ? '#f0f' : '#ff0'
            });
        }
    }
}

// Controles
let keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

// Dibujar jugador
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    // Cañón
    ctx.fillRect(player.x + player.width / 2 - 5, player.y - 15, 10, 20);
}

// Dibujar enemigos
function drawEnemies() {
    enemies.forEach(enemy => {
        if (enemy.alive) {
            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            // Ojos
            ctx.fillStyle = '#000';
            ctx.fillRect(enemy.x + 8, enemy.y + 10, 8, 8);
            ctx.fillRect(enemy.x + 24, enemy.y + 10, 8, 8);
        }
    });
}

// Disparar
function shoot() {
    bullets.push({
        x: player.x + player.width / 2 - 3,
        y: player.y,
        width: 6,
        height: 15,
        speed: 10
    });
}

// Actualizar balas
function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed;
        // Eliminar si sale de la pantalla
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
            continue;
        }
        // Dibujar bala
        ctx.fillStyle = '#ff0';
        ctx.fillRect(bullets[i].x, bullets[i].y, bullets[i].width, bullets[i].height);
    }
}

// Detectar colisiones
function checkCollisions() {
    bullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy, eIndex) => {
            if (enemy.alive &&
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                enemy.alive = false;
                bullets.splice(bIndex, 1);
                // Aumentar puntuación
                let score = parseInt(scoreElement.textContent);
                scoreElement.textContent = score + 100;
            }
        });
    });
}

// Bucle principal del juego
function gameLoop() {
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Movimiento del jugador
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
    if (keys[' ']) { // Espacio
        shoot();
        delete keys[' ']; // Evitar disparo continuo
    }

    // Dibujar elementos
    drawPlayer();
    drawEnemies();
    updateBullets();
    checkCollisions();

    requestAnimationFrame(gameLoop);
}

// Inicializar
initEnemies();
gameLoop();