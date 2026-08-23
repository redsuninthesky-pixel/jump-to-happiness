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

function move() {
    const friction = computeGroundFriction();
    applyHorizontalMovement(friction);
    let dx = player.velocityX;
    let dy = applyVerticalForces();
    player.ground = false;
    ({ dx, dy } = resolveCollisions(dx, dy));
    updateMeteors();
    if (state.redLight) {
        const movingHoriz = keys["a"] || keys["d"] || state.boosting > 0;
        if (movingHoriz || dy !== 0) {
            death();
            recordTrail();
            return;
        }
    }
    player.x += dx;
    player.y += dy;
    clampPlayerToWorld();
    checkHazards();
    checkLava();
    recordTrail();
}
