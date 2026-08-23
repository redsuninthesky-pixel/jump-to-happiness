let WORLD_WIDTH = 1650;
let WORLD_HEIGHT = 2560;

let grass;
let wind_zones;
let conveyer;
let platforms;
let wall;
let spikes;
let fake_sky;
let fake_spikes;
let fake_platform;
let button;
let checkpoint;
let invisible_platform;
let moving_platforms;
let goal;

const meteors = [];

const EMPTY_RECT = { x: 0, y: 0, width: 0, height: 0 };

function level1() {
    const W = 1650;
    const H = 2560;

    const grass = {
        x: 0,
        y: H - 30,
        width: W,
        height: 30,
        friction: 1,
    };

    const wind_zones = [
        { x: 600, y: H - 814, width: 300, height: 150, forceX: 2.5, forceY: -0.15, maxSpeedX: 8 },
    ];

    const conveyer = [
        { x: 1470, y: H - 814 - 135, width: 100, height: 20, dir: -1 },
        { x: 700, y: wind_zones[0].y - wind_zones[0].height - 90, width: 100, height: 20, dir: -1 },
        { x: 50, y: wind_zones[0].y - wind_zones[0].height - 150, width: 100, height: 20, dir: -1 },
    ];

    const platforms = [
        { width: 100, height: 20, x: 200, y: grass.y - grass.height - 30, friction: 1 },
        { width: 200, height: 20, x: 485, y: H - 134, friction: 1 },
        { width: 100, height: 20, x: 850, y: H - 174, friction: 1 },
        { width: 200, height: 20, x: 850, y: H - 354, friction: 1 },
        { width: 50, height: 20, x: 700, y: H - 344, friction: 0.01 },
        { width: 50, height: 20, x: 780, y: H - 454, friction: 0.08 },
        { width: 200, height: 20, x: 100, y: H - 524, friction: 0.5 },
        { width: 20, height: 10, x: 200, y: H - 674, friction: 1 },
        { width: 5, height: 2, x: 410, y: H - 724, friction: 1 },
        { width: 300, height: 20, x: wind_zones[0].x, y: wind_zones[0].y + wind_zones[0].height, friction: 1 },
        { width: 50, height: 20, x: wind_zones[0].x + wind_zones[0].width + 100, y: H - 714, friction: 1 },
        { width: 50, height: 20, x: wind_zones[0].x + wind_zones[0].width + 200, y: H - 764, friction: 1 },
        { width: 50, height: 20, x: wind_zones[0].x + wind_zones[0].width + 300, y: H - 814, friction: 1 },
        { width: 50, height: 20, x: wind_zones[0].x + wind_zones[0].width + 400, y: H - 864, friction: 1 },
        { width: 50, height: 20, x: wind_zones[0].x + wind_zones[0].width + 500, y: H - 814 - 115, friction: 1 },
    ];

    const wall = [
        { x: 200, y: platforms[0].y + platforms[0].height, width: 20, height: grass.y - (platforms[0].y + platforms[0].height) },
    ];

    const spikes = [
        { width: 50, height: 93, x: platforms[0].x + platforms[0].width / 3 - 27, y: platforms[0].y - 73 },
        { width: grass.width - 200, height: 15, x: 200, y: grass.y - 15 },
        { width: 75, height: 15, x: platforms[6].x + platforms[6].width + 20, y: platforms[6].y - platforms[6].height - 100 },
    ];

    const fake_sky = [
        { x: 525, y: platforms[1].y - 264, width: 130, height: 170 },
        { x: 250, y: platforms[6].y - 15, width: 30, height: 15 },
    ];

    const fake_spikes = [
        { x: 555, y: platforms[1].y - 93, width: 80, height: 93 },
    ];

    const fake_platform = [
        { x: 525, y: platforms[1].y - 304, width: 50, height: 20 }
    ]

    const button = [
        {
            x: platforms[2].x + platforms[2].width / 5 - 0.5,
            y: platforms[2].y - platforms[2].height - 8.7,
            width: 60,
            height: 30,
            teleport_coords: { x: 870, y: platforms[2].y - platforms[2].height - 8.7 - 200 },
        },
    ];

    const checkpoint = [
        { x: platforms[3].x + (platforms[3].width - 40) / 2, y: platforms[3].y - platforms[3].height - 20, width: 40, height: 40 },
        { x: platforms[6].x + (platforms[6].width - 40) / 2, y: platforms[6].y - platforms[6].height - 20, width: 40, height: 40 },
        { x: platforms[10].x + (platforms[10].width - 40) / 2, y: platforms[10].y - platforms[10].height - 20, width: 40, height: 40 },
        { x: 10, y: H - 70, height: 40, width: 40 },
    ];

    const invisible_platform = [
        { width: 0.25, height: 0.25, x: 680, y: H - 364 },
        { width: 20, height: 20, x: 650, y: H - 454 },
        { width: 10, height: 5, x: platforms[6].x, y: platforms[6].y - platforms[6].height - 30 },
        { width: 10, height: 5, x: platforms[6].x - 100, y: platforms[6].y - platforms[6].height - 85 },
    ];

    const moving_platforms = [
        { width: 15, height: 10, x: 600, y: H - 524, left: 350, right: 550},
    ];

    const goal = {
        x: conveyer[2].x + (conveyer[2].width - 40) / 2,
        y: conveyer[2].y - 40,
        width: 40,
        height: 40,
    };

    return {
        name: "Ground Floor",
        width: W,
        height: H,
        spawn: { x: 10, y: H - 70 },
        grass, wind_zones, conveyer, platforms, wall, spikes,
        fake_sky, fake_spikes, fake_platform, button, checkpoint,
        invisible_platform, moving_platforms, goal,
    };
}

function level2() {
    const W = 1650;
    const H = 2560;

    const grass = {
        x: 0,
        y: H - 30,
        width: W,
        height: 30,
        friction: 1,
    };

    const conveyer = [
        {x: 0, y: H - 375 - 200, width: 50, height: 10, dir: 1},
        {x: 510, y: H - 625, width: 10, height: 180, dir: 1},
        {x: 580, y: H - 725, width: 10, height: 240, dir: -1},
        {x: 650, y: H - 725, width: 10, height: 280, dir: 1},
        {x: 369 + 190 + 450 + 193 + 50 + 90, y: H - 10 - 70 - 50 - 50 - 100, width: 10, height: 100, dir: -1},
    ];

    const platforms = [
        {x: 369, y: H - 10 - 70, width: 100, height: 10, friction: 1},
        {x: 369 + 190 + 100, y: H - 10 - 70, width: 100, height: 10, friction: 1},
        {x: 369 + 190 + 100 + 100 + 100, y: H - 10 - 70, width: 100, height: 10, friction: 1},
        {x: 369 + 190 + 100 + 100 - 250, y: H - 10 - 70 - 200, width: 100, height: 10, friction: 1},
        {x: 100, y: H - 375, width: 110, height: 10, friction: 1},
        {x: 400, y: H - 625, width: 110, height: 10, friction: 1},
        {x: 510, y: H - 625 + 180, width: 150, height: 10, friction: 1},
        {x: 369 + 190 + 450 + 193 + 50, y: H - 10 - 70 - 50 - 50, width: 50, height: 10, friction: 1},
    ];

    const wall =  [
        
    ];

    const spikes = [
        {x: 50, y: H - 10 - 30, width: W, height: 10},
        {x: platforms[3].x + 40, y: platforms[3].y - 50, width: 50, height: 50},
        {x: 369 + 190 + 100 + 100 + 100 + 75, y: H - 10 - 70 - 300, width: 325, height: 10},
        {x: platforms[1].x + platforms[1].width + 100, y: platforms[1].y - 410, width: 10, height: 10},
    ];

    const fake_sky = [
        {x: platforms[4].x + (platforms[4].width - 40) / 2, y: platforms[4].y - 140, width: 40, height: 40}
    ];

    const fake_spikes = [
        {x: platforms[4].x + (platforms[4].width - 110) / 2 - 40, y: platforms[4].y - 40, width: 40, height: 50}
    ];

    const wind_zones = [
        { x: platforms[3].x - 250 - 50, y: platforms[3].y - 150, width: 250, height: 150, forceX: 2.5, forceY: -0.15, maxSpeedX: 8 },
    ];

    const fake_platform = [
        {x: 50, y: spikes[0].y - 10, width: 50, height: 10},
        {x: 369 + 190 + 450 + 193 + 100, y: H - 10 - 70 - 50 - 50, width: 50, height: 10, friction: 1},
    ];

    const button = [
        
    ];

    const checkpoint = [
        {x: platforms[1].x + (platforms[1].width - 40) / 2, y: platforms[1].y - 40, width: 40, height: 40},
        {x: platforms[4].x + (platforms[4].width - 40) / 2, y: platforms[4].y - 40, width: 40, height: 40},
        {x: 590, y: H - 725, width: 70, height: 40},
        {x: platforms[2].x + (platforms[2].width - 40) / 2, y: platforms[2].y - 40, width: 40, height: 40},
    ];

    const invisible_platform = [
        {x: 150, y: spikes[0].y - 10, width: 10, height: 10},
        {x: 200, y: spikes[0].y - 10, width: 10, height: 10},
        {x: 250, y: spikes[0].y - 10, width: 10, height: 10},
        {x: 300, y: spikes[0].y - 10, width: 10, height: 10},
        {x: platforms[1].x + platforms[1].width + 100, y: platforms[1].y - 400, width: 10, height: 400},
        {x: platforms[1].x + platforms[1].width + 50, y: platforms[1].y - 50, width: 10, height: 10},
        {x: platforms[1].x + platforms[1].width - 50, y: platforms[1].y - 100, width: 10, height: 10},
        {x: platforms[1].x + platforms[1].width - 100, y: platforms[1].y - 150, width: 10, height: 10},
        {x: 30, y: platforms[4].y, width: 10, height: 10},
        {x: 0, y: platforms[4].y - 40, width: 10, height: 10},
        {x: 70, y: platforms[4].y - 100, width: 10, height: 10},
        {x: 369 + 190 + 450, y: H - 10 - 70 - 50, width: 10, height: 10},
        {x: 369 + 190 + 450 + 58, y: H - 10 - 70 - 50 - 39, width: 10, height: 10},
        {x: 369 + 190 + 450 + 94, y: H - 10 - 70 - 50 + 39, width: 10, height: 10},
        {x: 369 + 190 + 450 + 193, y: H - 10 - 70 - 50, width: 10, height: 10},
        {x: 369 + 190 + 450 + 193, y: H - 10 - 70 - 50, width: 10, height: 10},
        {x: 369 + 190 + 450 + 193 + 100, y: H - 10 - 70, width: 150, height: 10},
    ];

    const moving_platforms = [
        {x: platforms[3].x - 300, y: platforms[3].y - 50, width: 10, height: 10, left: platforms[3].x - 300, right: platforms[3].x - 50}
    ];

    const goal = {
        x: invisible_platform[16].x + (invisible_platform[16].width - 40) / 2,
        y: invisible_platform[16].y - 40,
        width: 40,
        height: 40,
    };

    return {
        name: "Ground Floor",
        width: W,
        height: H,
        spawn: { x: 10, y: H - 70 },
        grass, wind_zones, conveyer, platforms, wall, spikes,
        fake_sky, fake_spikes, fake_platform, button, checkpoint,
        invisible_platform, moving_platforms, goal,
    };
}


const LEVELS = [level1, level2];

function loadLevel(index) {
    const L = LEVELS[index]();

    WORLD_WIDTH = L.width;
    WORLD_HEIGHT = L.height;

    grass              = L.grass              ?? { x: 0, y: L.height, width: L.width, height: 0, friction: 1 };
    wind_zones         = L.wind_zones         ?? [];
    conveyer           = L.conveyer           ?? [];
    platforms          = L.platforms          ?? [];
    wall               = L.wall               ?? [];
    spikes             = L.spikes             ?? [];
    fake_sky           = L.fake_sky           ?? [];
    fake_spikes        = L.fake_spikes        ?? [];
    fake_platform      = L.fake_platform      ?? { ...EMPTY_RECT };
    button             = L.button             ?? [];
    checkpoint         = L.checkpoint         ?? [];
    invisible_platform = L.invisible_platform ?? [];
    moving_platforms   = L.moving_platforms   ?? [];
    goal               = L.goal               ?? { ...EMPTY_RECT };

    meteors.length = 0;

    return L;
}
