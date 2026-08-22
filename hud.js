// drawing stuff
function MandatoryRest() {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Mandatory Rest Break", canvas.width / 2, canvas.height / 2);
    ctx.font = "20px Arial";
    ctx.fillText(Math.ceil(state.RestTime / 60) + "s", canvas.width / 2, canvas.height / 2 + 40);
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

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    wind_zones.forEach(zone => {
        ctx.fillStyle = "rgba(0, 206, 209, 0.15)";
        ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
    });

    ctx.fillStyle = "#FF6B00";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    ctx.fillStyle = "green";
    ctx.fillRect(grass.x, grass.y, grass.width, grass.height);

    ctx.fillStyle = "red";
    spikes.forEach(spike => {
        ctx.fillRect(spike.x, spike.y, spike.width, spike.height);
    });
    fake_spikes.forEach(s => ctx.fillRect(s.x, s.y, s.width, s.height));

    ctx.fillStyle = "#4A8FA8";
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    ctx.fillStyle = "#FF6B00";
    conveyer.forEach(belt => {
        ctx.fillRect(belt.x, belt.y, belt.width, belt.height);
    });

    ctx.fillStyle = "#4A8FA8";
    fake_platform.forEach((p) => {
        ctx.fillRect(p.x, p.y, p.width, p.height);
    })
    moving_platforms.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));

    ctx.fillStyle = "black";
    button.forEach(b => {
        ctx.fillRect(b.x, b.y, b.width, b.height);
    });

    ctx.fillStyle = "yellow";
    checkpoint.forEach(c => {
        ctx.fillRect(c.x, c.y, c.width, c.height);
    });

    ctx.fillStyle = "purple";
    ctx.fillRect(goal.x, goal.y, goal.width, goal.height);

    meteors.forEach(drawMeteor);

    ctx.fillStyle = "#FF6B00";
    ctx.globalAlpha = 0.1;
    clones.forEach(clone => {
        const idx = Math.min(clone.frames, clone.locations.length - 1);
        const pos = clone.locations[idx];
        if (pos) ctx.fillRect(pos.x, pos.y, player.width, player.height);
    });
    ctx.globalAlpha = 1;

    ctx.fillStyle = "#FF3300";
    ctx.fillRect(0, state.lavaHeight, WORLD_WIDTH, WORLD_HEIGHT - state.lavaHeight);

    ctx.restore();

    if (state.redLight) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "red";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
    }

    const isGreenLight = !state.redLight;
    const timerValue = state.redLight ? state.redLightTimer : state.greenLightTimer;
    const text = Math.ceil(timerValue / 60);
    if (isGreenLight && text <= 3 && text >= 1) {
        const framesSinceChange = text * 60 - timerValue;
        const popDuration = 15;
        const popScale = 1 + Math.max(0, 1 - framesSinceChange / popDuration) * 0.8;
        ctx.save();
        ctx.fillStyle = "white";
        ctx.font = `${Math.round(60 * popScale)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
        ctx.restore();
    } else {
        ctx.fillStyle = "white";
        ctx.font = "30px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, canvas.width / 2, 20);
    }

    if (state.resting) MandatoryRest();
}
