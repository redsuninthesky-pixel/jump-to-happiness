const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const left_btn = document.getElementById("left-btn");
const right_btn = document.getElementById("right-btn");
const up_btn = document.getElementById("jump-btn");


function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (state.started) draw();
}

const state = {
    levelIndex: 0,
    spawn: { x: 0, y: 0 },

    currentLocations: [],
    jumpBuffered: false,

    meteorTimer: 90,
    meteorTime: 0,
    homeMeteorChance: 0.2,

    time: 0,
    counter: 0,
    changeControls: false,

    buttonCooldown: false,
    latestCheckpoint: null,
    invisMessageShown: true,

    boosting: 0,
    launchDir: 0,
    onCooldown: false,
    mpDirection: -1,

    redLight: false,
    redLightTimer: 300,
    greenLightTimer: 900,

    lavaHeight: 0,

    resting: false,
    playTime: 1800,
    restTime: 300,

    started: false,
    frozen: false,
    
    shaking: false,
    shakeTime: 10,
    shakeX: 0,
    shakeY: 0,

    dim: false,
    dimTime: randint(1, 300),
    dimTimer: randint(1, 300),

    crashCount: 0,
};

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const camera = { x: 0, y: 0 };

const player = {
    x: 0,
    y: 0,
    height: 40,
    width: 30,
    gravity: 0.5,
    velocity: 0,
    velocityX: 0,
    speed: 5,
    ground: false,
};

const clones = [];

const keys = {};

document.addEventListener("keydown", e => {
    keys[e.key] = true;
    if (e.key === " " || e.key === "w") {
        state.jumpBuffered = true;
        e.preventDefault();
    }
});

document.addEventListener("keyup", e => {
    keys[e.key] = false;
});

left_btn.addEventListener("touchstart", e => {
    e.preventDefault();
    keys["a"] = true;
});

left_btn.addEventListener("touchend", e => {
    e.preventDefault();
    keys["a"] = false;
});

right_btn.addEventListener("touchstart", e => {
    e.preventDefault();
    keys["d"] = true;
});

right_btn.addEventListener("touchend", e => {
    e.preventDefault();
    keys["d"] = false;
});

up_btn.addEventListener("touchstart", e => {
    keys[" "] = true;
    state.jumpBuffered = true;
    e.preventDefault();
});

function startLevel(index) {
    const L = loadLevel(index);

    state.levelIndex = index;
    state.spawn = L.spawn;

    state.latestCheckpoint = null;
    state.invisMessageShown = true;
    state.currentLocations = [];
    clones.length = 0;

    state.boosting = 0;
    state.launchDir = 0;
    state.onCooldown = false;
    state.mpDirection = -1;

    state.redLight = false;
    state.redLightTimer = GIMMICK.redDuration;
    state.greenLightTimer = GIMMICK.greenDuration;

    state.meteorTime = 0;
    state.time = 0;
    state.counter = 0;

    resetLava();
    respawn();
}

function respawn() {
    const spot = state.latestCheckpoint !== null
        ? checkpoint[state.latestCheckpoint]
        : state.spawn;

    player.x = spot.x;
    player.y = spot.y;
    player.velocityX = 0;
    player.velocity = 0;
    player.ground = false;
}

function showFinalScreen() {
    document.getElementById("board").style.display = "none";
    document.getElementById("finalScreen").style.display = "flex";

    const text = document.getElementById("finalText");
    const blackout = document.getElementById("blackout");

    void text.offsetWidth;
    text.style.transform = "scale(40)";

    setTimeout(() => {
        blackout.style.display = "block";
        void blackout.offsetWidth;
        blackout.style.opacity = "1";
    }, 1500);
}

function checkGoal() {
    if (goal.width === 0) return;
    if (!collideRect(player, goal)) return;

    const next = state.levelIndex + 1;
    if (next >= LEVELS.length) {
        triggerCrashSequence();
    } else {
        startLevel(next);
    }
}

function triggerCrashSequence() {
    if (state.frozen || state.crashCooldown) return;
    state.frozen = true;
    state.crashCount++;
    if (state.crashCount >= 3) {
        setTimeout(showFinalScreen, 7000);
    } else {
        setTimeout(showUnresponsiveModal, 7000);
    }
}

function showUnresponsiveModal() {
    document.getElementById("crashPageTitle").textContent = document.title;
    document.getElementById("crashPageUrl").textContent = location.href;
    document.getElementById("crashModal").style.display = "flex";
}

function fakeWait() {
    document.getElementById("crashModal").style.display = "none";
    document.getElementById("board").style.display = "none";
    document.getElementById("crashPage").style.display = "flex";
}

function fakeKill() {
    resetGame();
}

function resetGame() {
    document.getElementById("crashModal").style.display = "none";
    document.getElementById("crashPage").style.display = "none";
    document.getElementById("board").style.display = "block";
    state.frozen = false;
    state.crashCooldown = true;
    setTimeout(() => { state.crashCooldown = false; }, 1000);
}

function death() {
    if (state.currentLocations.length > 0) {
        clones.push({ locations: state.currentLocations, frames: 0 });
    }
    state.currentLocations = [];
    state.boosting = 0;
    resetLava();
    respawn();
}

function applyButtonEffect(b) {
    if (state.buttonCooldown) return;
    state.buttonCooldown = true;
    setTimeout(() => { state.buttonCooldown = false; }, 500);
    const chance = Math.floor(Math.random() * 3) + 1;
    if (chance === 1) {
        player.x = b.teleport_coords.x;
        player.y = b.teleport_coords.y;
    } else if (chance === 2) {
        death();
    } else if (platforms.length > 0) {
        player.x = platforms[0].x + 70;
        player.y = platforms[0].y - player.height;
    }
    player.velocity = 0;
    player.velocityX = 0;
}

function recordTrail() {
    state.currentLocations.push({ x: player.x, y: player.y });
    clones.forEach(clone => {
        clone.frames++;
        if (clone.frames > clone.locations.length) {
            clone.frames = 0;
        }
    });
}

function updateCamera() {
    camera.x = player.x - canvas.width / 2 + player.width / 2;
    camera.y = player.y - canvas.height / 2 + player.height / 2;
    camera.x = Math.max(0, Math.min(camera.x, WORLD_WIDTH - canvas.width));
    camera.y = Math.max(0, Math.min(camera.y, WORLD_HEIGHT - canvas.height));
}

function loop() {
    requestAnimationFrame(loop);

    if (!state.started || state.frozen) {
        return;
    }

    if (updateRest()) {
        draw();
        return;
    }

    updateControlScramble();
    updatePaywall();
    updateDim();

    updateMovingPlatforms();
    move();
    checkGoal();
    updateCamera();

    state.meteorTime++;
    if (state.meteorTime > state.meteorTimer) {
        state.meteorTime = 0;
        spawnMeteor();
    }

    updateRedLight();
    updateLava();
    updateShake();
    shakeScreen();

    draw();
}

function startGame() {
    document.getElementById("beware-panel").style.display = "none";
    document.getElementById("board").style.display = "block";
    state.started = true;
}

startLevel(0);
loop();
