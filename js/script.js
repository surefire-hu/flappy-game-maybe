const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const ROWS = 5;
const COLS = 9;
const CELL_SIZE = 80;
const ZOMBIE_SPAWN_INTERVAL = 5000;

canvas.width = COLS * CELL_SIZE;
canvas.height = ROWS * CELL_SIZE;

let plants = [];
let zombies = [];
let projectiles = [];
let score = 0;
let sunCount = 50; 
let gameOver = false;
let gamePaused = false;
let selectedPlant = null;

class Plant {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.health = 100;
        this.shootTimer = 0;
    }

    draw() {
        ctx.fillStyle = this.type === 'shooter' ? 'green' : 'yellow';
        ctx.beginPath();
        ctx.arc(this.x + CELL_SIZE / 2, this.y + CELL_SIZE / 2, CELL_SIZE / 3, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        if (this.type === 'shooter') {
            this.shootTimer++;
            if (this.shootTimer >= 60) {
                projectiles.push(new Projectile(this.x + CELL_SIZE, this.y + CELL_SIZE / 2));
                this.shootTimer = 0;
            }
        } else if (this.type === 'sunflower') {
        }
    }
}

class Zombie {
    constructor(row) {
        this.x = canvas.width;
        this.y = row * CELL_SIZE;
        this.speed = 0.5;
        this.health = 100;
    }

    draw() {
        ctx.fillStyle = 'purple';
        ctx.fillRect(this.x, this.y, CELL_SIZE, CELL_SIZE);
    }

    update() {
        this.x -= this.speed;
        if (this.x < 0) {
            gameOver = true;
        }
    }
}

class Sun {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 30;
        this.collected = false;
    }

    draw() {
        if (!this.collected) {
            ctx.fillStyle = 'yellow';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

class Projectile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 5;
    }

    draw() {
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        this.x += this.speed;
    }
}

function drawGrid() {
    ctx.strokeStyle = '#ccc';
    for (let i = 0; i <= ROWS; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(canvas.width, i * CELL_SIZE);
        ctx.stroke();
    }
    for (let j = 0; j <= COLS; j++) {
        ctx.beginPath();
        ctx.moveTo(j * CELL_SIZE, 0);
        ctx.lineTo(j * CELL_SIZE, canvas.height);
        ctx.stroke();
    }
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();

    plants.forEach(plant => plant.draw());
    zombies.forEach(zombie => zombie.draw());
    projectiles.forEach(projectile => projectile.draw());

    if (gameOver) {
        ctx.fillStyle = 'red';
        ctx.font = '48px Arial';
        ctx.fillText('Game Over!', canvas.width / 2 - 100, canvas.height / 2);
    }
}

function updateGame() {
    if (gameOver || gamePaused) return;

    plants.forEach(plant => plant.update());
    zombies.forEach(zombie => zombie.update());
    projectiles.forEach(projectile => projectile.update());

    // Collision detection
    for (let i = zombies.length - 1; i >= 0; i--) {
        for (let j = projectiles.length - 1; j >= 0; j--) {
            if (
                projectiles[j].x > zombies[i].x &&
                projectiles[j].x < zombies[i].x + CELL_SIZE &&
                projectiles[j].y > zombies[i].y &&
                projectiles[j].y < zombies[i].y + CELL_SIZE
            ) {
                zombies[i].health -= 20;
                projectiles.splice(j, 1);
                if (zombies[i].health <= 0) {
                    zombies.splice(i, 1);
                    score += 10;
                    sunCount += 50; 
                    updateScore();
                    updateResources();
                }
                break;
            }
        }
    }

    projectiles = projectiles.filter(projectile => projectile.x < canvas.width);
}

function spawnZombie() {
    if (gameOver || gamePaused) return;
    const randomRow = Math.floor(Math.random() * ROWS);
    zombies.push(new Zombie(randomRow));
}

function updateScore() {
    document.getElementById('score').textContent = score;
}

function updateResources() {
    document.getElementById('sun').textContent = sunCount;
}

function startGame() {
    gameOver = false;
    gamePaused = false;
    plants = [];
    zombies = [];
    projectiles = [];
    score = 0;
    sunCount = 50; // Usa sunCount invece di sun
    updateScore();
    updateResources();
    document.getElementById('start-btn').textContent = 'Riavvia';
    setInterval(spawnZombie, ZOMBIE_SPAWN_INTERVAL);
    gameLoop();
}

function togglePause() {
    gamePaused = !gamePaused;
    document.getElementById('pause-btn').textContent = gamePaused ? 'Riprendi' : 'Pausa';
}

function gameLoop() {
    updateGame();
    drawGame();
    requestAnimationFrame(gameLoop);
}

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Posizionamento delle piante
    if (selectedPlant) {
        const x = Math.floor(clickX / CELL_SIZE) * CELL_SIZE;
        const y = Math.floor(clickY / CELL_SIZE) * CELL_SIZE;

        if (sunCount >= selectedPlant.cost) {
            plants.push(new Plant(x, y, selectedPlant.type));
            sunCount -= selectedPlant.cost; // Usa sunCount invece di sun
            updateResources();
        }

        selectedPlant = null;
    }
});

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('pause-btn').addEventListener('click', togglePause);

document.querySelectorAll('.plant-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const cost = parseInt(btn.getAttribute('data-cost'));
        const type = btn.textContent.toLowerCase().includes('solare') ? 'sunflower' : 'shooter';
        selectedPlant = { cost, type };
    });
});

drawGame();