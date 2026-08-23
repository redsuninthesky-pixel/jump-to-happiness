const GIMMICK = {
    playDuration: 1800,
    restDuration: 300,

    scrambleInterval: 1200,

    paywallInterval: 2400,
    paywallPayChance: 0.5,

    greenDuration: 900,
    redDuration: 300,

    lavaRiseSpeed: 0.05,

    shakeTime: 10,
    shakeDist: 6,

    shakeChance: 0.002,

    dimAmount: 0.4,
};

function updateRest() {
    if (state.resting) {
        state.restTime--;
        if (state.restTime <= 0) {
            state.resting = false;
            state.playTime = GIMMICK.playDuration;
        }
        return true;
    }

    state.playTime--;
    if (state.playTime <= 0) {
        state.resting = true;
        state.restTime = GIMMICK.restDuration;
    }
    return false;
}

function updateControlScramble() {
    if (state.counter > GIMMICK.scrambleInterval) {
        state.changeControls = !state.changeControls;
        state.counter = 0;
    }
    state.counter++;
}

function updatePaywall() {
    if (state.time > GIMMICK.paywallInterval) {
        state.time = 0;
        alert("pay up");
        if (Math.random() < GIMMICK.paywallPayChance) {
            alert("ty");
        } else {
            alert("you didn't pay");
            death();
        }
    }
    state.time++;
}

function updateRedLight() {
    if (state.redLight) {
        state.redLightTimer--;
        if (state.redLightTimer <= 0) {
            state.redLight = false;
            state.greenLightTimer = GIMMICK.greenDuration;
            state.redLightTimer = GIMMICK.redDuration;
        }
    } else {
        state.greenLightTimer--;
        if (state.greenLightTimer <= 0) {
            state.redLight = true;
            state.greenLightTimer = GIMMICK.greenDuration;
            state.redLightTimer = GIMMICK.redDuration;
        }
    }
}

function updateLava() {
    state.lavaHeight -= GIMMICK.lavaRiseSpeed;
}

function resetLava() {
    state.lavaHeight = WORLD_HEIGHT;
}

function shakeScreen() {
    if (!state.shaking) return;
    state.shakeTime--;
    if (state.shakeTime <= 0) {
        state.shakeTime = GIMMICK.shakeTime;
        state.shaking = false;
        state.shakeX = 0;
        state.shakeY = 0;
        return;
    }
    state.shakeX = randint(-GIMMICK.shakeDist, GIMMICK.shakeDist);
    state.shakeY = randint(-GIMMICK.shakeDist, GIMMICK.shakeDist);
}

function updateShake() {
    if (Math.random() < GIMMICK.shakeChance && !state.shaking) {
        state.shaking = true;
        state.shakeTime = 10;
    }
}

function updateDim() {
    if (state.dim) {
        state.dimTime--;
        if (state.dimTime <= 0) {
            state.dim = false;
            state.dimTime = randint(1, 300);
            state.dimTimer = randint(1, 300);
        }
    }
    else {
        state.dimTimer--;
        if (state.dimTimer <= 0) {
            state.dim = true;
            state.dimTimer = randint(1, 300);
            state.dimTime = randint(1, 300);
        }
    }
    
}
