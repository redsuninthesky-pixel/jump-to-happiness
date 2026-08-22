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
    playTime: 10000,
    RestTime: 5000,

    started: false,
    frozen: false,
    crashCooldown: false,
};

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const camera = { x: 0, y: 0 };

const player = {
    x: 0,
    y: 0,
    height: 40,
    width: 20,
    gravity: 0.5,
    velocity: 0,
    velocityX: 0,
    speed: 5,
    ground: false,
};

const clones = [];

const keys = {};

window.addEventListener("error", e => {
    alert("ERROR: " + e.message + "\nFile: " + e.filename + "\nLine: " + e.lineno);
});

window.addEventListener("unhandledrejection", e => {
    alert("PROMISE ERROR: " + e.reason);
});

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

function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
    setTimeout(showUnresponsiveModal, 7000);
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

function makeMeteorShape() {
    const numPoints = randint(7, 10);
    const shape = [];

    for (let i = 0; i < numPoints; i++) {
        shape.push({
            angle: (i / numPoints) * Math.PI * 2,
            r: 0.7 + Math.random() * 0.3,
        });
    }

    return shape;
}

function MandatoryRest(){
    ctx.fillStyle = "rgba(255,255,255,0)";
    ctx.fillRect(0,0,canvas.width, canvas.height);
    ctx.font = "30px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Mandatory Rest Break", canvas.width / 2, canvas.height / 2);
}

function drawMeteor(m) {
    const cx = m.x + m.width / 2;
    const cy = m.y + m.height / 2;
    const rx = m.width / 2;
    const ry = m.height / 2;

    ctx.beginPath();
    m.shape.forEach((p, i) => {
        const px = cx + Math.cos(p.angle) * rx * p.r;
        const py = cy + Math.sin(p.angle) * ry * p.r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    });
    ctx.closePath();

    const grad = ctx.createRadialGradient(cx - rx * 0.3, cy - ry * 0.3, rx * 0.1, cx, cy, rx);
    grad.addColorStop(0, "#C97A3D");
    grad.addColorStop(0.6, "#8B4A1F");
    grad.addColorStop(1, "#4A2510");

    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = "#2E1608";
    ctx.lineWidth = 2;
    ctx.stroke();
}

function updateMeteors() {
    for (let i = meteors.length - 1; i >= 0; i--) {
        const meteor = meteors[i];
        meteor.x += meteor.dx;
        meteor.y += meteor.dy;

        if (meteor.y > WORLD_HEIGHT) {
            meteors.splice(i, 1);
        }
    }

    meteors.forEach(meteor => {
        if (collideRect(player, meteor)) death();
    });
}

function updateMovingPlatforms() {
    moving_platforms.forEach(platform => {
        platform.x += MP_SPEED * state.mpDirection;

        if (platform.x <= platform.left) {
            platform.x = platform.left;
            state.mpDirection = 1;
        }

        if (platform.x + platform.width >= platform.right) {
            platform.x = platform.right - platform.width;
            state.mpDirection = -1;
        }
    });
}

function computeGroundFriction() {
    if (!player.ground) return 1;

    const feetRect = { x: player.x, y: player.y + player.height - 2, width: player.width, height: 4 };
    let friction = 1;

    if (collideRect(feetRect, grass)) friction = grass.friction;

    platforms.forEach(platform => {
        if (collideRect(feetRect, platform)) friction = platform.friction;
    });

    moving_platforms.forEach(platform => {
        if (collideRect(feetRect, platform)) friction = 1;
    });

    return friction;
}

function applyHorizontalMovement(friction) {
    let left = "a";
    let right = "d";
    if (state.changeControls) {
        left = "d";
        right = "a";
    }

    let targetDx = 0;
    if (keys[left]) targetDx = -player.speed;
    if (keys[right]) targetDx = player.speed;

    if (state.boosting > 0) {
        player.velocityX = BOOST_SPEED * state.launchDir;
        state.boosting--;
    } else {
        player.velocityX = player.velocityX * (1 - friction) + targetDx * friction;
        if (targetDx === 0 && friction < 1) {
            player.velocityX *= (1 - friction * 0.5);
        }
    }
}

function applyVerticalForces() {
    if (state.jumpBuffered && player.ground) {
        player.velocity = -10;
        player.ground = false;
        state.jumpBuffered = false;
    } else if (!player.ground) {
        state.jumpBuffered = false;
    }

    player.velocity += player.gravity;

    wind_zones.forEach(zone => {
        if (!collideRect(player, zone)) return;

        player.x -= zone.forceX;

        if (zone.forceY !== undefined && player.velocity > 0) {
            player.velocity *= 0.92;
            if (player.velocity > 2) player.velocity = 2;
        }
    });

    return player.velocity;
}

function resolveCollisions(dx, dy) {
    const new_x_rect = { x: player.x + dx, y: player.y, width: player.width, height: player.height };
    const new_y_rect = { x: player.x, y: player.y + dy, width: player.width, height: player.height };
    const grassRect = { x: grass.x, y: grass.y, width: grass.width, height: grass.height };

    if (collideRect(new_y_rect, grassRect) && player.velocity > 0) {
        dy = grass.y - player.height - player.y;
        player.velocity = 0;
        player.ground = true;
    }

    if (platforms[5] && (collideRect(new_x_rect, platforms[5]) || collideRect(new_y_rect, platforms[5])) && state.invisMessageShown) {
        alert("From here, some platforms become invisible, have fun! :)");
        state.invisMessageShown = false;
    }

    platforms.forEach(platform => {
        const verticalHit = collideRect(new_y_rect, platform);

        if (collideRect(new_x_rect, platform) && !verticalHit) {
            dx = 0;
            player.velocityX = 0;
        }

        if (verticalHit) {
            if (player.velocity > 0) {
                dy = platform.y - player.height - player.y;
                player.velocity = 0;
                player.ground = true;
            } else {
                dy = platform.y + platform.height - player.y;
                player.velocity = 0;
            }
        }
    });

    conveyer.forEach(belt => {
        const willHitX = collideRect(new_x_rect, belt);
        const willHitY = collideRect(new_y_rect, belt);
        if (!willHitX && !willHitY) return;

        const xOverlapBefore = player.x < belt.x + belt.width && player.x + player.width > belt.x;
        const yOverlapBefore = player.y < belt.y + belt.height && player.y + player.height > belt.y;

        const sideHit = !xOverlapBefore && yOverlapBefore && willHitX;
        const verticalHit = !yOverlapBefore && xOverlapBefore && willHitY;

        if (sideHit && !state.onCooldown) {
            state.onCooldown = true;
            setTimeout(() => { state.onCooldown = false; }, BOOST_CD);
            state.launchDir = belt.dir;
            state.boosting = BOOST_TIME;
            player.velocity = BOOST_POP;
            dx = 0;
        } else if (sideHit) {
            dx = 0;
        }

        if (verticalHit) {
            if (player.velocity > 0) {
                dy = belt.y - player.height - player.y;
                player.velocity = 0;
                player.ground = true;
            } else {
                dy = belt.y + belt.height - player.y;
                player.velocity = 0;
            }
        }
    });

    invisible_platform.forEach(invis => {
        const verticalHit = collideRect(new_y_rect, invis);

        if (collideRect(new_x_rect, invis) && !verticalHit) {
            dx = 0;
            player.velocityX = 0;
        }

        if (verticalHit) {
            if (player.velocity > 0) {
                dy = invis.y - player.height - player.y;
                player.velocity = 0;
                player.ground = true;
            } else {
                dy = invis.y + invis.height - player.y;
                player.velocity = 0;
            }
        }
    });

    moving_platforms.forEach(platform => {
        const verticalHit = collideRect(new_y_rect, platform);

        if (collideRect(new_x_rect, platform) && !verticalHit) {
            dx = 0;
            player.velocityX = 0;
        }

        if (verticalHit) {
            if (player.velocity > 0) {
                dy = platform.y - player.height - player.y;
                player.velocity = 0;
                player.ground = true;
                player.x += MP_SPEED * state.mpDirection;
            } else {
                dy = platform.y + platform.height - player.y;
                player.velocity = 0;
            }
        }
    });

    button.forEach(b => {
        let hit = false;

        if (collideRect(new_x_rect, b)) {
            dx = 0;
            player.velocityX = 0;
            hit = true;
        }

        if (collideRect(new_y_rect, b)) {
            if (player.velocity > 0) {
                dy = b.y - player.height - player.y;
                player.velocity = 0;
                player.ground = true;
            } else {
                dy = b.y + b.height - player.y;
                player.velocity = 0;
            }
            hit = true;
        }

        if (hit) applyButtonEffect(b);
    });

    checkpoint.forEach((c, i) => {
        if (collideRect(new_x_rect, c) || collideRect(new_y_rect, c)) {
            state.latestCheckpoint = i;
        }
    });

    wall.forEach(w => {
        if (collideRect(new_x_rect, w)) {
            player.x = new_x_rect.x < w.x ? w.x - player.width : w.x + w.width;
            dx = 0;
            player.velocityX = 0;
        }

        if (collideRect(new_y_rect, w)) {
            if (player.velocity > 0) {
                dy = w.y - player.height - player.y;
                player.velocity = 0;
                player.ground = true;
            } else {
                dy = w.y + w.height - player.y;
                player.velocity = 0;
            }
        }
    });

    return { dx, dy };
}

function clampPlayerToWorld() {
    if (player.x < 0) {
        player.x = 0;
        player.velocityX = 0;
    }

    if (player.x + player.width > WORLD_WIDTH) {
        player.x = WORLD_WIDTH - player.width;
        player.velocityX = 0;
    }

    if (player.y < 0) {
        player.y = 0;
        player.velocity = 0;
    }

    if (player.y + player.height > WORLD_HEIGHT) {
        player.y = WORLD_HEIGHT - player.height;
        player.velocity = 0;
        player.ground = true;
    }
}

function checkHazards() {
    spikes.forEach(spike => {
        if (collideRect(player, spike)) {
            death();
            player.velocity = 0;
        }
    });

    fake_sky.forEach(zone => {
        if (collideRect(player, zone)) {
            death();
            player.velocity = 0;
        }
    });
}

function checkLava() {
    const lavaRect = { x: 0, y: state.lavaHeight, width: WORLD_WIDTH, height: WORLD_HEIGHT - state.lavaHeight };

    if (collideRect(player, lavaRect)) {
        death();
        player.velocity = 0;
    }
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

    draw();
}

function startGame() {
    document.getElementById("beware-panel").style.display = "none";
    document.getElementById("board").style.display = "block";
    state.started = true;
}

startLevel(0);
loop();
