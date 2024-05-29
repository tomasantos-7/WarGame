const MAP_WIDTH = 100;
const MAP_HEIGHT = 100;
const CELL_WIDTH = 32;
const CELL_HEIGHT = 32;
const engines = [];
const buildings = [];
const players = [];
const units = [];
let target_cell = [];
let inMovement = false;
let delta = 0;



class Engine {

    passed = false;
    lumberCampAI = 0;
    quarryAI = 0;
    bankAI = 0;
    barracksAI = 0;

    USEDCELL = class {
        x = 0;
        y = 0;
    }
    usedCellArray = [];

    //this functions saves the cells already used by another structures in a array of objects
    saveCells(x, y) {
        let cellsToSave = [{
                x: x,
                y: y
            },
            {
                x: x + 1,
                y: y
            },
            {
                x: x,
                y: y + 1
            },
            {
                x: x + 1,
                y: y + 1
            }
        ];

        for (let cell of cellsToSave) {
            let usedCell = new this.USEDCELL();
            usedCell.x = cell.x;
            usedCell.y = cell.y;
            this.usedCellArray.push(usedCell);
        }
    }

    //this function makes the random selection of actions to build the AI's structures
    spawnBuildings(x, y) {
        let rand = Math.floor(Math.random() * 4);
        switch (rand) {
            case 0:
                if (this.lumberCampAI < 3 && ai.amount_food >= 10) {
                    placeBuildings('lumberCampAI', x, y, 1, 2, 2, 'Lumber1', false);
                    this.lumberCampAI++;
                    this.saveCells(x, y);
                }
                break;
            case 1:
                if (this.quarryAI < 3 && ai.amount_food >= 10 && ai.amount_wood >= 10) {
                    placeBuildings('quarryAI', x, y, 1, 2, 2, 'Quarry1', false);
                    this.quarryAI++;
                    this.saveCells(x, y);
                }
                break;
            case 2:
                if (this.bankAI < 2 && ai.amount_wood >= 20 && ai.amount_stone >= 20) {
                    placeBuildings('bankAI', x, y, 2, 2, 2, 'Bank1', false);
                    this.bankAI++;
                    this.saveCells(x, y);
                }
                break;
            case 3:
                if (this.barracksAI < 3 && ai.amount_food >= 10 && ai.amount_stone >= 15) {
                    placeBuildings('barracksAI', x, y, 1, 2, 2, 'Barracks1', false);
                    this.barracksAI++;
                    this.saveCells(x, y);
                }
                break;
        }
    }
    //funtion that identifies if the cells are available for placement of new buildings
    isCellAvailable(x, y) {
        for (let usedCell of this.usedCellArray) {
            // if one of the following expressions are true the function returns false, so the building cannot be placed in that cell
            if (
                (x === usedCell.x && y === usedCell.y) ||
                (x + 1 === usedCell.x && y === usedCell.y) ||
                (x === usedCell.x && y + 1 === usedCell.y) ||
                (x + 1 === usedCell.x && y + 1 === usedCell.y)
            ) {
                return false;
            }
        }
        return true;
    }
    //main building function
    build() {
        // CASTLE
        for (let i = 0; i < buildings.length; i++) {
            let ai_building = buildings[i];

            while (!this.passed) {
                let x = Math.floor(Math.random() * MAP_WIDTH);
                let y = Math.floor(Math.random() * MAP_HEIGHT);

                if (x > 60 && x < 70 && y < 80 && y > 60) {
                    if (x > building.castle_x + 1 && y > building.castle_y + 1 && map[x][y].type != 'hill' && map[x][y].type != 'mountain') {
                        placeBuildings('castleAI', x, y, 1, 4, 4, 'Castle1', false);
                        this.passed = true;
                    }
                }
            }

            // Buildings
            if (!ai_building.isPlayer) {
                let rand_x = Math.floor(Math.random() * 10);
                let rand_y = Math.floor(Math.random() * 10);
                let x = ai_building.castle_x + rand_x;
                let y = ai_building.castle_y + rand_y;

                if (x > 60 && x < 100 && y < 100 && y > 10 && map[x][y].type != 'occupied') {
                    if (this.isCellAvailable(x, y)) {
                        this.spawnBuildings(x, y);
                    }
                }
            }
        }
    }

    createUnits() {
        if (this.barracksAI > 0) {
            if (ai.amount_food >= 10 && ai.amount_gold >= 10) {
                ai.amount_soldier++;
                ai.amount_food -= 10;
                ai.amount_gold -= 10;
            }
        }
    }

    move() {
        for (let i = 0; i < units.length; i++) {
            let unit = units[i];
            unit.move(delta);
        }

        let oUnit = new Unit();
        let list_of_images = textureMap.get("infantries");
        oUnit.isPlayer = false;
        if (list_of_images) {
            let chosen_index = Math.floor(Math.random() * list_of_images.length);
            oUnit.sprite = list_of_images[chosen_index];
        }
        units.push(oUnit);

    }

    attack() {

    }

}

class Building {
    type = 'none';
    castle = 0;
    lumberCamp = 0;
    quarry = 0;
    bank = 0;
    barracks = 0;
    generates = 'none';
    resources_pre_second = 0;
    x = 0;
    y = 0;
    width = 1;
    height = 1;
    hp = 0;
    damageQueue = 0;
    castle_x = 0;
    castle_y = 0;
    isDestroyed = false;
    isPlayer = true;

    placeOnMap() {

        for (let x = this.x; x < this.x + this.width; x++)
            for (let y = this.y; y < this.y + this.height; y++) {
                map[x][y].type = 'occupied';
                map[x][y].bType = this.type;
                map[x][y].sprite = null;
            }


        if (this.type == 'castle') {
            this.castle_x = this.x;
            this.castle_y = this.y;
        }
        if (this.type == 'castleAI') {
            ai_building.castle_x = this.x;
            ai_building.castle_y = this.y;
        }

        //map[this.x][this.y].type = this.type;
    }

    isInsideBuildZone(x, y) {
        let delta_x = x - this.castle_x;
        let delta_y = y - this.castle_y
        let distance = Math.sqrt(Math.pow(delta_x, 2) + Math.pow(delta_y, 2));
        if (distance < 12) {
            return true;
        } else {
            return false;
        }
    }
}

class Player {
    amount_food = 0;
    amount_wood = 0;
    amount_stone = 0;
    amount_gold = 0;
    amount_soldier = 0;
    isPlayer = true;

}

class Unit {
    type = 'infantry';
    sprite = null;
    speed = 100; //speed for 32 px per second
    //current position in pixels
    x = 0;
    y = 0;
    //current cell 
    currentCell_x = building.castle_x;
    currentCell_y = building.castle_y;
    //target position in pixels
    target_x = 0;
    target_y = 0;
    //target cell coords
    cell_x = 0;
    cell_y = 0;
    //status of units
    hp = 200;
    attack_damage = 100;
    isDestroyed = false;

    isPlayer = true;

    move(elapsed) {
        this.currentCell_x = Math.floor(this.x / CELL_WIDTH);
        this.currentCell_y = Math.floor(this.y / CELL_HEIGHT);

        //calculate the amount of pixels to travel using the target position and the units current position do create the distance beteween them
        let delta_x = this.target_x - this.x;
        let delta_y = this.target_y - this.y;
        let distance = Math.sqrt(Math.pow(delta_x, 2) + Math.pow(delta_y, 2));
        if (distance < 1) //if the distance is lower than one there is no need to move the unit because its too close
            return
        //turn this into a vector between 0 and 1 pointing in the right direction
        let normalized_x = delta_x / distance;
        let normalized_y = delta_y / distance;
        //calculate the amount of PX we will travel in X milliseconds, we will travel at 32px per second
        let amount_traveled = (elapsed * this.speed) / 1000;
        //get the cost for travelling in the current terrain | plains = faster, hills = slower 
        let cost = map[Math.floor(this.x / CELL_WIDTH)][Math.floor(this.y / CELL_HEIGHT)].cost;
        //calculate the amount of px we will travel with terrain penalties
        let path = pathfinding(map, this.currentCell_x, this.currentCell_y, this.cell_x, this.cell_y);

        for (let i = 0; i < path.length; i++) {
            let path_x = path[i].x / CELL_WIDTH;
            let path_y = path[i].y / CELL_WIDTH;
            this.x += (path_x * normalized_x) / cost;
            this.y += (path_y * normalized_y) / cost;

        }
        //inMovement = false;
    }


}

let player = new Player();
let ai = new Player();
let building = new Building();
let ai_building = new Building();
let engine = new Engine();

//cria um array de arrays, com o tamanho (MAP_WIDTH x MAP_HEIGHT) tudo inicializado a 0;
const map = new Array(MAP_WIDTH).fill(0).map(() => new Array(MAP_HEIGHT).fill(0));
const textureMap = new Map();

function setup() {
    //make html reflect our variables so we only have 1 place to alter
    const ui_map = document.getElementById("ui_map");
    ui_map.setAttribute("width", MAP_WIDTH * CELL_WIDTH);
    ui_map.setAttribute("height", MAP_HEIGHT * CELL_HEIGHT);
    //load into variables
    textureMap.set('tree', document.getElementById('trees').children);
    textureMap.set('hill', document.getElementById('hills').children);
    textureMap.set('pine', document.getElementById('pines').children);
    textureMap.set('rock', document.getElementById('rocks').children);
    textureMap.set('mountain', document.getElementById('mountains').children);
    textureMap.set('castle', document.getElementById('castles').children);
    textureMap.set('infantries', document.getElementById('infantries').children);

    initializeTerrain();
    requestAnimationFrame(drawFrame);
}
let previous_ts = null;

function drawFrame(timestamp) {
    if (previous_ts) {
        delta = timestamp - previous_ts;
        let fps = 1000 / delta;
        document.title = `${Math.floor(fps)}fps`;

    }
    //make the units movement 
    for (let i = 0; i < units.length; i++) {
        let unit = units[i];
        unit.move(delta);
    }

    if (!previous_ts) //first frame load the textures and the general scenery 
    {
        drawTexture();
        //drawGrayscale();
    }

    drawScenery();
    if (inMovement == true) {
        drawUnits();
    }

    //drawUnits(); // Causa problemas com a drawScenery, não permite o desenho de construções
    requestAnimationFrame(drawFrame);

    previous_ts = timestamp;
}
// terrain generation functions
function initializeTerrain() {

    let type;
    //imaginando que o terreno está tudo a nivel da agua, a cada iteração vamos elevar uma pequena ilha de forma redonda, num local aleatório 
    for (let i = 0; i < 100; i++) {
        let center_x = Math.floor(Math.random() * MAP_WIDTH);
        let center_y = Math.floor(Math.random() * MAP_HEIGHT);
        elevateTerrain(0.1, center_x, center_y, 10)
    }
    for (let x = 0; x < MAP_WIDTH; x++)
        for (let y = 0; y < MAP_WIDTH; y++) {
            let height = map[x][y];
            type = 'plain';
            let cost = 1;
            if (0.3 <= height && height < 0.4) {
                type = 'tree';
                cost = 1.5;
            } else if (0.5 <= height && height < 0.6) {
                type = 'pine';
                cost = 1.5;
            } else if (0.6 <= height && height < 0.7) {
                type = 'rock';
                cost = 2;
            } else if (0.7 <= height) {
                type = 'hill';
                cost = Infinity;
            }

            let list_of_images = textureMap.get(type);
            let chosen_sprite = null;
            if (list_of_images) {
                let chosen_index = Math.floor(Math.random() * list_of_images.length);
                chosen_sprite = list_of_images[chosen_index];
            }

            map[x][y] = {
                'elevation': height,
                'type': type,
                'bType': 'none',
                'transversable': type != 'hill', // adicionar buildings para fazer com que não seja possivel passar por dentro deless
                'cost': cost,
                'sprite': chosen_sprite,
            }
        }

    //paint some mountains in the middle of the hills
    //first mark the hills enclosed by other hills
    for (let x = 1; x < MAP_WIDTH - 1; x++)
        for (let y = 1; y < MAP_HEIGHT - 1; y++) {
            if (map[x][y].type == 'hill' &&
                map[x - 1][y].type == 'hill' &&
                map[x + 1][y].type == 'hill' &&
                map[x][y + 1].type == 'hill' &&
                map[x][y - 1].type == 'hill') {
                map[x][y].enclosed = true;
            }

        }
    //upgrade pairs of enclosed hills into mountains
    for (let x = 1; x < MAP_WIDTH - 1; x++)
        for (let y = 1; y < MAP_HEIGHT - 1; y++) {
            if (
                map[x][y].type == 'hill' &&
                map[x][y].enclosed &&
                map[x + 1][y].type == 'hill' &&
                map[x + 1][y].enclosed
            ) {
                map[x][y].type = 'mountain';
                map[x + 1][y].type = 'mountain';
                if (map[x][y].type == 'mountain') {
                    map[x][y].cost = 0; //Infinity
                }
                let list_of_images = textureMap.get('mountain');
                map[x][y].sprite = list_of_images[Math.floor(Math.random() * list_of_images.length)];
                map[x + 1][y].sprite;
            }
        }

    getCastle();
    //spawnUnits(building.castle_x + 5, building.castle_y + 5, 'Infantry2');
    //Choose the sprite for the untis
    let oUnit = new Unit();
    let list_of_images = textureMap.get("infantries");
    let chosen_sprite = null;
    if (list_of_images) {
        let chosen_index = Math.floor(Math.random() * list_of_images.length);
        oUnit.sprite = list_of_images[chosen_index];
    }
    units.push(oUnit);

    //função de intervalo a cada segundo gera 1 de resources


    setInterval(() => {
        GetResources();
        for (let i = 0; i < units.length; i++) {
            let unit = units[i]
            attack(unit.cell_x, unit.cell_y);
        }
        engine.build();
    }, 1000);
}

function getCastle() {
    // Criação do castelo

    let x = Math.floor(Math.random() * (MAP_WIDTH / 10));
    let y = Math.floor(Math.random() * (MAP_HEIGHT / 10));

    placeBuildings('castle', x, y, 1, 4, 4, 'Castle1', true);

}

//função para gerar resources ao longo do tempo
function GetResources() {

    for (const array_building of buildings) {

        if (array_building.isPlayer == true) {
            let property_name = "amount_" + array_building.generates;
            player[property_name] += array_building.resources_pre_second;
        }
        if (array_building.isPlayer == false) {
            let property_name = "amount_" + array_building.generates;
            ai[property_name] += array_building.resources_pre_second;
        }
    }

    document.getElementById("foodstatus").textContent = player.amount_food;
    document.getElementById("woodstatus").textContent = player.amount_wood;
    document.getElementById("stonestatus").textContent = player.amount_stone;
    document.getElementById("goldstatus").textContent = player.amount_gold;
    /*
        document.getElementById("foodAI").textContent = ai.amount_food;
        document.getElementById("woodAI").textContent = ai.amount_wood;
        document.getElementById("stoneAI").textContent = ai.amount_stone;
    document.getElementById("goldAI").textContent = ai.amount_gold;*/
}

function placeBuildings(type, x, y, amount_per_second, width, height, sprite_id, isPlayer) {

    if (isPlayer) {
        building.type = type;
        building.x = x;
        building.y = y;

        if (map[x][y].type != 'occupied' || map[x][y].type != 'hill') {
            if (type == 'castle') {
                building.castle++;
                building.generates = 'food';
                building.hp = 10000;
                building.isPlayer = true;
                building.resources_pre_second = amount_per_second;
                building.width = width;
                building.height = height;
                building.placeOnMap();
                map[x][y].sprite = document.getElementById(sprite_id);
                buildings.push(building);
            } else {
                let bool = building.isInsideBuildZone(x, y)
                if (bool) {
                    switch (type) {
                        case 'lumberCamp':
                            building = new Building();
                            building.lumberCamp++;
                            building.generates = 'wood';
                            building.hp = 500;
                            player.amount_food -= 10;
                            break;
                        case 'quarry':
                            building = new Building();
                            building.quarry++;
                            building.generates = 'stone';
                            building.hp = 500;
                            player.amount_food -= 10;
                            player.amount_wood -= 10;
                            break;
                        case 'bank':
                            building = new Building();
                            building.bank++;
                            building.generates = 'gold';
                            building.hp = 500;
                            player.amount_wood -= 20;
                            player.amount_stone -= 20;
                            break;
                        case 'barracks':
                            building = new Building();
                            building.barracks++;
                            building.generates = 'soldier';
                            building.hp = 500;
                            player.amount_food -= 10;
                            player.amount_stone -= 15;
                            break;
                    }
                    building.isPlayer = true;
                    building.resources_pre_second = amount_per_second;
                    building.width = width;
                    building.height = height;
                    building.placeOnMap();
                    map[x][y].sprite = document.getElementById(sprite_id);
                    player.isPlayer = true;
                    buildings.push(building);
                    players.push(player);
                } else {
                    alert("Out of Building Zone")
                }
            }

        } else {
            if (type == 'castle') {
                return;
            } else {
                alert("Coloca num espaço disponivel");
            }

        }

    } else {
        ai_building.type = type;
        ai_building.x = x;
        ai_building.y = y;

        if (map[x][y].type != 'occupied' || map[x][y].type != 'hill') {
            if (ai_building.castle == 0 && type == 'castleAI') {

                ai_building.castle++;
                ai_building.generates = 'food';
                ai_building.hp = 10000;
                ai_building.isPlayer = false;
                ai_building.resources_pre_second = amount_per_second;
                ai_building.width = width;
                ai_building.height = height;
                ai_building.placeOnMap();
                map[x][y].sprite = document.getElementById(sprite_id);
                buildings.push(ai_building);

            } else {
                switch (type) {
                    case 'lumberCampAI':
                        ai_building = new Building();
                        ai_building.lumberCamp++;
                        ai_building.generates = 'wood';
                        ai_building.hp = 500;
                        ai.amount_food -= 10;
                        break;
                    case 'quarryAI':
                        ai_building = new Building();
                        ai_building.quarry++;
                        ai_building.generates = 'stone';
                        ai_building.hp = 500;
                        ai.amount_food -= 10;
                        ai.amount_wood -= 10;
                        break;
                    case 'bankAI':
                        ai_building = new Building();
                        ai_building.bank++;
                        ai_building.generates = 'gold';
                        ai_building.hp = 500;
                        ai.amount_wood -= 20;
                        ai.amount_stone -= 20;
                        break;
                    case 'barracksAI':
                        ai_building = new Building();
                        ai_building.barracks++;
                        ai_building.generates = 'soldier';
                        ai_building.hp = 500;
                        ai.amount_food -= 10;
                        ai.amount_stone -= 10;
                        break;
                }

                ai_building.isPlayer = false;
                ai_building.resources_pre_second = amount_per_second;
                ai_building.width = width;
                ai_building.height = height;
                ai_building.placeOnMap();
                map[x][y].sprite = document.getElementById(sprite_id);
                buildings.push(ai_building);
                ai.isPlayer = false;
                players.push(ai);
            }
        } else {
            return;
        }
    }
}

function spawnUnits(x, y, sprite_id) {
    if (player.amount_soldier > 0) {
        if (map[x][y].type == 'plain') {
            map[x][y].sprite = document.getElementById(sprite_id);
            player.soldier_x = x;
            player.soldier_y = y;
            for (let x = player.soldier_x; x < player.soldier_x + 2; x++)
                for (let y = player.soldier_y; y < player.soldier_y + 2; y++) {
                    map[x][y].type = 'unit';
                }
            players.push(player);
        }
    }
}

function pathfinding(map, x, y, x_end, y_end) {

    let visited = new Array(MAP_WIDTH).fill(false).map(() => new Array(MAP_HEIGHT).fill(false));
    let distances = new Array(MAP_WIDTH).fill(Infinity).map(() => new Array(MAP_HEIGHT).fill(Infinity));
    let previous = new Array(MAP_WIDTH).fill(null).map(() => new Array(MAP_HEIGHT).fill(null));

    let startPoint = {
        'x': x,
        'y': y
    };
    let endPoint = {
        'x': x_end,
        'y': y_end
    };

    let currentNode = {
        'x': startPoint.x,
        'y': startPoint.y,
        'cost': 0
    };

    while (!(currentNode.x === endPoint.x && currentNode.y === endPoint.y)) {
        visited[currentNode.x][currentNode.y] = true;

        // update neighbors' distances
        const neighbors = getNeighbors(map, currentNode.x, currentNode.y);
        for (const neighbor of neighbors) {
            const {
                'x': nx,
                'y': ny,
                'cost': cost
            } = neighbor;
            if (!visited[nx][ny]) {
                const newDistance = currentNode.cost + cost;
                if (newDistance < distances[nx][ny]) {
                    distances[nx][ny] = newDistance;
                    previous[nx][ny] = {
                        'x': currentNode.x,
                        'y': currentNode.y
                    };
                }
            }
        }

        // find the closest unvisited node
        let minDistance = Infinity;
        for (let i = 0; i < MAP_WIDTH; i++) {
            for (let j = 0; j < MAP_HEIGHT; j++) {
                if (!visited[i][j] && distances[i][j] < minDistance) {
                    minDistance = distances[i][j];
                    currentNode = {
                        'x': i,
                        'y': j,
                        'cost': minDistance
                    };
                }
            }
        }

        // no unvisited nodes left or endpoint unreachable
        if (!currentNode) {
            return null; // no path found
        }
    }

    // reconstruct path
    let path = [];
    let current = endPoint;
    while (current) {
        path.unshift(current);
        current = previous[current.x][current.y];
    }

    return path;
}

function getNeighbors(map, x, y) {
    const neighbors = [];
    const directions = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ]; // adjacent cells

    for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < map.length && ny >= 0 && ny < map[0].length) {
            neighbors.push({
                'x': nx,
                'y': ny,
                'cost': map[nx][ny].cost
            });
        }
    }

    return neighbors;
}

function elevateTerrain(amount, center_x, center_y, radius) {

    for (let x = 0; x < MAP_WIDTH; x++)
        for (let y = 0; y < MAP_WIDTH; y++) {
            //distancia ao centro do circulo com o teorema de pitágoras
            let delta_x = x - center_x;
            let delta_y = y - center_y;
            let distance = Math.sqrt(Math.pow(delta_x, 2) + Math.pow(delta_y, 2));
            if (distance > radius) //esta celula está fora do circulo
                continue;
            map[x][y] += amount;
        }
}

function drawTexture() {

    const canvas = document.getElementById("ui_map");
    const ctx = canvas.getContext("2d");

    const texture = document.getElementById("texture"); //get the texture image
    ctx.fillStyle = ctx.createPattern(texture, "repeat"); //set as fill
    ctx.fillRect(0, 0, MAP_WIDTH * CELL_WIDTH, MAP_HEIGHT * CELL_HEIGHT);
    // desenhar a grelha de modo mais suave
    ctx.beginPath();
    ctx.strokeStyle = "#B5914A7F";
    ctx.setLineDash([8, 4]);
    for (let x = 0; x < MAP_WIDTH * CELL_WIDTH; x += 32) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, MAP_HEIGHT * CELL_HEIGHT);
    }
    for (let y = 0; y < MAP_HEIGHT * CELL_HEIGHT; y += 32) {
        ctx.moveTo(0, y);
        ctx.lineTo(MAP_WIDTH * CELL_WIDTH, y);

    }
    ctx.stroke();


}

function drawScenery() {
    const canvas = document.getElementById("ui_map");
    const ctx = canvas.getContext("2d");
    for (let x = 0; x < MAP_WIDTH; x++)
        for (let y = 0; y < MAP_WIDTH; y++) {
            let sprite = map[x][y].sprite;

            if (!sprite) {
                continue;
            } else {
                for (let i = 0; i < buildings.length; i++) {
                    let building = buildings[i];
                    if (!building.isDestroyed) {
                        ctx.drawImage(sprite, x * (CELL_WIDTH), y * (CELL_HEIGHT), sprite.naturalWidth, sprite.naturalHeight);
                    }
                }
            }
        }
}

function drawGrayscale() {

    const canvas = document.getElementById("ui_map");
    const ctx = canvas.getContext("2d");
    for (let x = 0; x < MAP_WIDTH; x++)
        for (let y = 0; y < MAP_WIDTH; y++) {
            if (map[x][y].transversable)
                ctx.fillStyle = `rgb(0 0 0 / ${map[x][y].elevation * 100}%)`;
            else
                ctx.fillStyle = `rgb(255 0 0 / ${map[x][y].elevation * 100}%)`;

            if (map[x][y].type == 'occupied')
                ctx.fillStyle = `rgb(255 100 0 / ${map[x][y].elevation * 100}%)`;

            if (map[x][y].type == 'unit') {
                ctx.fillStyle = `rgb(255 0 0 / ${map[x][y].elevation * 100}%)`;

            }

            ctx.fillRect(x * CELL_WIDTH, y * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
        }
}

function moveUnits() {
    //create a new canvas to load only the movement of units
    const ui_units = document.getElementById("ui_units");
    ui_units.setAttribute("width", MAP_WIDTH * CELL_WIDTH);
    ui_units.setAttribute("height", MAP_HEIGHT * CELL_HEIGHT);
    ui_units.addEventListener('click', function (event) {

        //get the coords of the destination
        let mouse_x = event.offsetX;
        let mouse_y = event.offsetY;
        //conversion of the cells to px
        let cell_x = Math.floor(mouse_x / CELL_WIDTH);
        let cell_y = Math.floor(mouse_y / CELL_HEIGHT);
        for (let i = 0; i < units.length; i++) {
            let unit = units[i];
            //coords in grid
            unit.cell_x = cell_x;
            unit.cell_y = cell_y;
            //coords in pixels
            unit.target_x = cell_x * CELL_WIDTH;
            unit.target_y = cell_y * CELL_HEIGHT;
            console.log('move');
            inMovement = true;

        }
    }, {
        once: true
    });
}

function drawUnits() {

    const canvas = document.getElementById("ui_units");
    ui_units.setAttribute("width", MAP_WIDTH * CELL_WIDTH);
    ui_units.setAttribute("height", MAP_HEIGHT * CELL_HEIGHT);
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < units.length; i++) {
        let unit = units[i];
        if (!unit.isDestroyed) {
            //unit gets drawn centered in cell
            //let draw_x = unit.x - unit.sprite.naturalWidth / 2 + CELL_WIDTH / 2;
            //let draw_y = unit.y - unit.sprite.naturalHeight / 2 + CELL_HEIGHT / 2;
            ctx.drawImage(unit.sprite, unit.x, unit.y, unit.sprite.naturalWidth, unit.sprite.naturalHeight);
        }
    }
}


const activeAttacks = new Map();

function attack(target_x, target_y) {
    let maxHP = 500;
    let healthBar = document.getElementById("healthBar");
    let healthBarContainer = document.getElementById("healthBar-container");

    units.forEach(unit => {
        if (unit.isPlayer) {
            buildings.forEach(building => {
                if (!building.isDestroyed && !building.isPlayer &&
                    building.x === target_x && building.y === target_y &&
                    unit.currentCell_x === target_x && unit.currentCell_y === target_y) {

                    healthBarContainer.style.top = `${target_y * CELL_HEIGHT}px`;
                    healthBarContainer.style.left = `${(target_x * CELL_WIDTH) - 5}px`;
                    healthBar.style.visibility = 'visible';
                    healthBarContainer.style.visibility = 'visible';
                    // Initialize damageQueue if it doesn't exist
                    if (!building.damageQueue) {
                        building.damageQueue = 0;
                    }

                    // Add unit's damage to the building's damageQueue
                    building.damageQueue += unit.attack_damage;

                    // Check if the building is already under attack
                    if (!activeAttacks.has(building)) {
                        const attackInterval = setInterval(() => {
                            if (building.hp > 0) {
                                console.log("attacking");

                                // Apply accumulated damage
                                let damageToApply = building.damageQueue;
                                building.hp -= damageToApply;
                                building.damageQueue -= damageToApply;

                                let healthValue = Math.floor((building.hp * 100) / maxHP);
                                console.log(healthValue);
                                healthBar.style.width = healthValue + '%';

                                if (building.hp <= 0) {
                                    clearInterval(attackInterval);
                                    activeAttacks.delete(building);
                                    building.isDestroyed = true;
                                    map[target_x][target_y].sprite = null;
                                    engine[building.type]--;

                                    const ui_map = document.getElementById("ui_map");
                                    let ctx = ui_map.getContext("2d");
                                    ctx.clearRect(target_x * CELL_WIDTH, target_y * CELL_HEIGHT, 64, 64);
                                    drawTexture();
                                    healthBar.style.visibility = 'hidden';
                                    healthBarContainer.style.visibility = 'hidden';
                                    console.log("destroyed");
                                }
                            }
                        }, 2000);

                        // Add the building to the map of active attacks
                        activeAttacks.set(building, attackInterval);
                    }
                }
            });
        }
    });
}

function remove(type, x, y) {
    for (let i = 0; i < buildings.length; i++) {
        let building = buildings[i];
        if (building.x == x && building.y == y) {
            map[x][y].sprite = null;
            building[type]--;
            buildings.push(building);
        }

    }
    /*
    for (let i = 0; i < units.length; i++) {
        let unit = units[i];
        if (unit.currentCell_x == x && unit.currentCell_y == y) {
            unit.sprite = null;
            player.amount_soldier--;
        }
    }*/

}

function drawPath() {
    for (let i = 0; i < units.length; i++) {
        let unit = units[i];
        let path = pathfinding(map, unit.currentCell_x, unit.currentCell_y, unit.cell_x, unit.cell_y);
        let path2 = path.shift();
        ctx.beginPath();
        ctx.strokeStyle = "white";
        ctx.setLineDash([]);
        ctx.moveTo(unit.currentCell_x, unit.currentCell_y);
        ctx.lineTo(path2.x, path2.y);
        ctx.stroke();
    }
}

function showButtons() {
    for (let i = 1; i <= 4; i++) {
        if (document.getElementById("menuMembers" + i).style.display == "none") {
            document.getElementById("menuMembers" + i).style.display = "inline-block";
        } else {
            document.getElementById("menuMembers" + i).style.display = "none";
        }
    }
}

function placeLumbermill() {
    showUnitCanvas(false);
    document.getElementById("buildingMode").classList.add("active");
    //document.getElementById("buildingsWindow").classList.add("active");
    let canvas = document.getElementById("ui_map");
    canvas.addEventListener("click", function (e) {
        if (player.amount_food >= 10) {
            let values = getCoordinates(canvas, e);
            let x = values[0];
            let y = values[1];

            placeBuildings('lumberCamp', x, y, 1, 2, 2, 'Lumber1', true);
            showUnitCanvas(true);

        } else {
            alert("É necessário 10 de Comida");
        }
        document.getElementById("buildingMode").classList.remove("active");
        //document.getElementById("buildingsWindow").classList.remove("active");
    }, {
        once: true
    });
}

function placeQuarry() {
    showUnitCanvas(false);
    document.getElementById("buildingMode").classList.add("active");
    const canvas = document.getElementById("ui_map");
    canvas.addEventListener("click", function (e) {
        if (player.amount_food >= 10 && player.amount_wood >= 10) {
            let values = getCoordinates(canvas, e);
            let x = values[0];
            let y = values[1];
            placeBuildings('quarry', x, y, 1, 2, 2, 'Quarry1', true);
            showUnitCanvas(true);
        } else {
            alert("São necessários 10 de Comida e 10 de Madeira");
        }
        document.getElementById("buildingMode").classList.remove("active");
    }, {
        once: true
    });
}

function placeBank() {
    showUnitCanvas(false);
    document.getElementById("buildingMode").classList.add("active");
    const canvas = document.getElementById("ui_map");
    canvas.addEventListener("click", function (e) {
        if (player.amount_wood >= 20 && player.amount_stone >= 20) {
            let values = getCoordinates(canvas, e);
            let x = values[0];
            let y = values[1];
            placeBuildings('bank', x, y, 1, 2, 2, 'Bank1', true);
            showUnitCanvas(true);
        } else {
            alert("São necessários 20 de Madeira e 20 de Pedra");
        }
        document.getElementById("buildingMode").classList.remove("active");
    }, {
        once: true
    });
}

function placeBarracks() {
    showUnitCanvas(false);
    document.getElementById("buildingMode").classList.add("active");
    const canvas = document.getElementById("ui_map");
    canvas.addEventListener("click", function (e) {
        if (player.amount_food >= 10 && player.amount_stone >= 15) {
            let values = getCoordinates(canvas, e);
            let x = values[0];
            let y = values[1];
            placeBuildings('barracks', x, y, 1, 2, 2, 'Barracks1', true);
            showUnitCanvas(true);
        } else {
            alert("São necessários 10 de Comida e 15 de Pedra")
        }
        document.getElementById("buildingMode").classList.remove("active");
    }, {
        once: true
    });
}

function getCoordinates(canvas, event) {

    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    x = Math.floor(x / CELL_WIDTH);
    y = Math.floor(y / CELL_HEIGHT);
    return [x, y];
}

function select() {
    const canvas = document.getElementById("ui_units")
    canvas.addEventListener("mousedown", e => {
        console.log("activated")
        let mouseCell_x = Math.floor(e.offsetX / CELL_WIDTH);
        let mouseCell_y = Math.floor(e.offsetY / CELL_HEIGHT);

        for (let i = 0; i < buildings.length; i++) {
            let building = buildings[i];
            if (building.type == 'barracks' && building.isPlayer == true && mouseCell_x == building.x && mouseCell_y == building.y) {
                console.log("done")
                document.getElementById("buildingsWindow").classList.add("active");
            }
        }
    });
}

function selectUnit() {
    /*
    const canvas = document.getElementById("ui_units");
    ui_units.setAttribute("width", MAP_WIDTH * CELL_WIDTH);
    ui_units.setAttribute("height", MAP_HEIGHT * CELL_HEIGHT);
    console.log('listener added')
    canvas.addEventListener('click', function (event) {
        let x = Math.floor(event.offsetX / CELL_WIDTH);
        let y = Math.floor(event.offsetY / CELL_HEIGHT);
        console.log(x, y);
        for (let i = 0; i < units.length; i++) {
            let unit = units[i];
            console.log('unit.currentCell_x: ' + unit.currentCell_x);
            console.log('unit.currentCell_y: ' + unit.currentCell_y);
            if (x === unit.currentCell_x && y === unit.currentCell_y) {
                console.log('unit selected');
                moveUnits();
            }
        }

    }, {
        once: true
    });*/
    moveUnits();
}

function showUnitCanvas(showCanvas) {
    const ui_units = document.getElementById("ui_units");
    ui_units.setAttribute("width", MAP_WIDTH * CELL_WIDTH);
    ui_units.setAttribute("height", MAP_HEIGHT * CELL_HEIGHT);
    if (showCanvas) {
        ui_units.style.display = 'block';
        select();
    } else {
        ui_units.style.display = 'none';
    }
}

function createUnit() {
    player.amount_soldier++;
    player.isPlayer = true;
    drawUnits();
}