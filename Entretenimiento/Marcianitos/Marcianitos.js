const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const pauseBtn = document.getElementById('pauseBtn');

// =====================
// CONFIG
// =====================
const CONFIG = {
  player: { w: 50, h: 30, speed: 8, color: '#0ff' },
  bullet: { w: 6, h: 14, speed: 12, color: '#ff0', cooldownMs: 170 },
  enemyBullet: { w: 6, h: 14, speed: 6.5, color: '#f55', cooldownMs: 650 },
  enemies: {
    rows: 5,
    cols: 11,
    w: 38,
    h: 28,
    gapX: 22,
    gapY: 18,
    startX: 70,
    startY: 70,
    stepX: 12,     // movimiento por “pasos”
    stepY: 22,     // bajada al tocar borde
    tickStartMs: 650, // intervalo inicial de movimiento
    tickMinMs: 90,    // intervalo mínimo (máx velocidad)
  },
  bunkers: {
    count: 4,
    blocksWide: 10,
    blocksHigh: 6,
    blockSize: 6,
    y: 460,
  }
};

// =====================
// STATE
// =====================
let isPaused = false;
let score = 0;
let lives = 3;

const keys = {};
let lastShotAt = 0;
let lastEnemyShotAt = 0;

const player = {
  x: canvas.width / 2 - CONFIG.player.w / 2,
  y: canvas.height - 70,
  w: CONFIG.player.w,
  h: CONFIG.player.h,
  speed: CONFIG.player.speed,
  color: CONFIG.player.color
};

let playerBullets = [];
let enemyBullets = [];

let enemies = [];
let enemyDir = 1; // 1 derecha, -1 izquierda
let enemyTickMs = CONFIG.enemies.tickStartMs;
let enemyTickAcc = 0;

let bunkers = [];

// =====================
// INPUT (bloquear scroll)
// =====================
window.addEventListener('keydown', (e) => {
  const block = ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '];
  if (block.includes(e.key)) e.preventDefault();
  keys[e.key] = true;
}, { passive: false });

window.addEventListener('keyup', (e) => {
  keys[e.key] = false;
}, { passive: true });

pauseBtn?.addEventListener('click', () => {
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? 'Reanudar' : 'Pausa';
});

// =====================
// HELPERS
// =====================
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

function rectsIntersect(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function setHud() {
  scoreElement.textContent = String(score);
  livesElement.textContent = String(lives);
}

function resetPositionsAfterLife() {
  player.x = canvas.width / 2 - player.w / 2;
  playerBullets = [];
  enemyBullets = [];
  enemyDir = 1;
}

function gameOver() {
  alert(`¡Game Over!\nPuntuación: ${score}`);
  score = 0;
  lives = 3;
  enemyTickMs = CONFIG.enemies.tickStartMs;
  initAll();
}

// =====================
// INIT
// =====================
function initEnemies() {
  enemies = [];
  const { rows, cols, w, h, gapX, gapY, startX, startY } = CONFIG.enemies;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      enemies.push({
        r, c,
        x: startX + c * (w + gapX),
        y: startY + r * (h + gapY),
        w, h,
        alive: true,
        // colores por fila para dar look retro
        color: (r === 0) ? '#ff0' : (r <= 2 ? '#f0f' : '#0f0')
      });
    }
  }
}

function initBunkers() {
  bunkers = [];
  const b = CONFIG.bunkers;
  const totalWidth = b.count * (b.blocksWide * b.blockSize) + (b.count - 1) * 70;
  let startX = (canvas.width - totalWidth) / 2;

  for (let i = 0; i < b.count; i++) {
    const bunkerX = startX + i * ((b.blocksWide * b.blockSize) + 70);
    const grid = [];
    for (let y = 0; y < b.blocksHigh; y++) {
      grid.push([]);
      for (let x = 0; x < b.blocksWide; x++) {
        // forma básica del bunker (hueco central arriba)
        let solid = true;
        if (y === 0 && (x === 4 || x === 5)) solid = false;
        if (y === 1 && (x === 4 || x === 5)) solid = false;
        grid[y].push(solid ? 3 : 0); // "vida" del bloque: 3 golpes
      }
    }
    bunkers.push({ x: bunkerX, y: b.y, grid });
  }
}

function initAll() {
  setHud();
  initEnemies();
  initBunkers();
  resetPositionsAfterLife();
}

initAll();

// =====================
// DRAW
// =====================
function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // fondo negro (opaco)
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.w, player.h);
  // cañón
  ctx.fillRect(player.x + player.w / 2 - 5, player.y - 14, 10, 18);
}

function drawEnemies() {
  enemies.forEach(e => {
    if (!e.alive) return;

    ctx.fillStyle = e.color;
    ctx.fillRect(e.x, e.y, e.w, e.h);

    // ojos
    ctx.fillStyle = '#000';
    ctx.fillRect(e.x + 8, e.y + 8, 6, 6);
    ctx.fillRect(e.x + e.w - 14, e.y + 8, 6, 6);
  });
}

function drawBullets() {
  // player
  ctx.fillStyle = CONFIG.bullet.color;
  for (const b of playerBullets) ctx.fillRect(b.x, b.y, b.w, b.h);

  // enemy
  ctx.fillStyle = CONFIG.enemyBullet.color;
  for (const b of enemyBullets) ctx.fillRect(b.x, b.y, b.w, b.h);
}

function drawBunkers() {
  const b = CONFIG.bunkers;
  for (const bunker of bunkers) {
    for (let gy = 0; gy < bunker.grid.length; gy++) {
      for (let gx = 0; gx < bunker.grid[gy].length; gx++) {
        const hp = bunker.grid[gy][gx];
        if (!hp) continue;

        // color según vida del bloque
        ctx.fillStyle = (hp === 3) ? '#0af' : (hp === 2 ? '#08f' : '#06c');
        const px = bunker.x + gx * b.blockSize;
        const py = bunker.y + gy * b.blockSize;
        ctx.fillRect(px, py, b.blockSize, b.blockSize);
      }
    }
  }
}

// =====================
// SHOOTING
// =====================
function shootPlayer() {
  const now = performance.now();
  if (now - lastShotAt < CONFIG.bullet.cooldownMs) return;
  lastShotAt = now;

  playerBullets.push({
    x: player.x + player.w / 2 - CONFIG.bullet.w / 2,
    y: player.y - 16,
    w: CONFIG.bullet.w,
    h: CONFIG.bullet.h,
    vy: -CONFIG.bullet.speed
  });
}

function shootEnemy() {
  const now = performance.now();
  if (now - lastEnemyShotAt < CONFIG.enemyBullet.cooldownMs) return;
  lastEnemyShotAt = now;

  // Elegir una columna aleatoria y disparar desde el enemigo más bajo vivo de esa columna
  const cols = CONFIG.enemies.cols;
  const colOrder = Array.from({ length: cols }, (_, i) => i).sort(() => Math.random() - 0.5);

  for (const c of colOrder) {
    let shooter = null;
    for (let r = CONFIG.enemies.rows - 1; r >= 0; r--) {
      const found = enemies.find(e => e.alive && e.c === c && e.r === r);
      if (found) { shooter = found; break; }
    }
    if (shooter) {
      enemyBullets.push({
        x: shooter.x + shooter.w / 2 - CONFIG.enemyBullet.w / 2,
        y: shooter.y + shooter.h + 2,
        w: CONFIG.enemyBullet.w,
        h: CONFIG.enemyBullet.h,
        vy: CONFIG.enemyBullet.speed
      });
      break;
    }
  }
}

// =====================
// UPDATE
// =====================
function updatePlayer() {
  if (keys['ArrowLeft']) player.x -= player.speed;
  if (keys['ArrowRight']) player.x += player.speed;
  player.x = clamp(player.x, 0, canvas.width - player.w);

  if (keys[' ']) shootPlayer();
}

function updateBullets(dt) {
  // mover
  for (let i = playerBullets.length - 1; i >= 0; i--) {
    const b = playerBullets[i];
    b.y += b.vy;
    if (b.y + b.h < 0) playerBullets.splice(i, 1);
  }

  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const b = enemyBullets[i];
    b.y += b.vy;
    if (b.y > canvas.height) enemyBullets.splice(i, 1);
  }
}

function currentEnemyBounds() {
  let minX = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const e of enemies) {
    if (!e.alive) continue;
    minX = Math.min(minX, e.x);
    maxX = Math.max(maxX, e.x + e.w);
    maxY = Math.max(maxY, e.y + e.h);
  }
  if (minX === Infinity) return null;
  return { minX, maxX, maxY };
}

function updateEnemies(dt) {
  enemyTickAcc += dt;

  if (enemyTickAcc < enemyTickMs) return;
  enemyTickAcc = 0;

  const bounds = currentEnemyBounds();
  if (!bounds) {
    // siguiente oleada
    score += 500;
    enemyTickMs = CONFIG.enemies.tickStartMs;
    initEnemies();
    initBunkers();
    resetPositionsAfterLife();
    setHud();
    return;
  }

  const { stepX, stepY } = CONFIG.enemies;

  // ¿tocaría el borde si damos un paso?
  const nextMinX = bounds.minX + stepX * enemyDir;
  const nextMaxX = bounds.maxX + stepX * enemyDir;

  let hitEdge = (nextMinX <= 10) || (nextMaxX >= canvas.width - 10);

  if (hitEdge) {
    // bajar y cambiar sentido
    enemyDir *= -1;
    for (const e of enemies) if (e.alive) e.y += stepY;
  } else {
    // moverse en X por pasos
    for (const e of enemies) if (e.alive) e.x += stepX * enemyDir;
  }

  // Si llegan abajo => pierdes vida
  const after = currentEnemyBounds();
  if (after && after.maxY >= player.y) {
    lives--;
    setHud();
    if (lives <= 0) return gameOver();
    resetPositionsAfterLife();
  }

  // Disparo enemigo “a ritmo”
  shootEnemy();

  // Acelerar según cuantos quedan (como el original)
  const alive = enemies.reduce((acc, e) => acc + (e.alive ? 1 : 0), 0);
  const total = CONFIG.enemies.rows * CONFIG.enemies.cols;
  const t = 1 - (alive / total); // 0..1
  enemyTickMs = Math.max(CONFIG.enemies.tickMinMs, CONFIG.enemies.tickStartMs - t * 560);
}

function damageBunkerAt(x, y) {
  const b = CONFIG.bunkers;
  for (const bunker of bunkers) {
    const localX = x - bunker.x;
    const localY = y - bunker.y;
    if (localX < 0 || localY < 0) continue;

    const gx = Math.floor(localX / b.blockSize);
    const gy = Math.floor(localY / b.blockSize);

    if (gy >= 0 && gy < bunker.grid.length && gx >= 0 && gx < bunker.grid[gy].length) {
      if (bunker.grid[gy][gx] > 0) {
        bunker.grid[gy][gx] -= 1;
        return true;
      }
    }
  }
  return false;
}

function checkCollisions() {
  // player bullets vs enemies
  for (let i = playerBullets.length - 1; i >= 0; i--) {
    const b = playerBullets[i];

    // bunkers primero
    if (damageBunkerAt(b.x + b.w / 2, b.y)) {
      playerBullets.splice(i, 1);
      continue;
    }

    let hit = false;
    for (const e of enemies) {
      if (!e.alive) continue;
      if (rectsIntersect({ x: b.x, y: b.y, w: b.w, h: b.h }, e)) {
        e.alive = false;
        hit = true;
        score += 100;
        break;
      }
    }
    if (hit) {
      playerBullets.splice(i, 1);
      setHud();
    }
  }

  // enemy bullets vs player / bunkers
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const b = enemyBullets[i];

    if (damageBunkerAt(b.x + b.w / 2, b.y + b.h)) {
      enemyBullets.splice(i, 1);
      continue;
    }

    if (rectsIntersect({ x: b.x, y: b.y, w: b.w, h: b.h }, { x: player.x, y: player.y, w: player.w, h: player.h })) {
      enemyBullets.splice(i, 1);
      lives--;
      setHud();
      if (lives <= 0) return gameOver();
      resetPositionsAfterLife();
    }
  }
}

// =====================
// LOOP
// =====================
let lastTime = 0;
function loop(t = 0) {
  const dt = t - lastTime;
  lastTime = t;

  if (!isPaused) {
    updatePlayer();
    updateEnemies(dt);
    updateBullets(dt);
    checkCollisions();
  }

  clear();
  drawBunkers();
  drawPlayer();
  drawEnemies();
  drawBullets();

  requestAnimationFrame(loop);
}

setHud();
requestAnimationFrame(loop);
