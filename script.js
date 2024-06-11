const MAP_WIDTH = 100;
const MAP_HEIGHT = 100;
const CELL_WIDTH = 32;
const CELL_HEIGHT = 32;
const engines = [];
const buildings = [];
const players = [];
const units = [];
const usedcells = [];
let inMovement = false;
let delta = 0;

class UsedCells_Highlight {
    x = 0;
    y = 0;
}

class buildingStatus {
    lumberCamp = 0;
    quarry = 0;
    bank = 0;
    barracks = 0;
}

let player = new Player();
let ai = new Player();
let building = new Building();
let ai_building = new Building();
let engine = new Engine();
let buildStatus = new buildingStatus();

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
        drawScenery();
    }


    if (inMovement == true) {
        drawUnits();
    }

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
                cost = 5;
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
                'transversable': type != 'hill',
                'cost': cost,
                'sprite': chosen_sprite,
                'buildingZone': false,
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
                    map[x][y].cost = Infinity; //Infinity
                }
                let list_of_images = textureMap.get('mountain');
                map[x][y].sprite = list_of_images[Math.floor(Math.random() * list_of_images.length)];
                map[x + 1][y].sprite;
            }
        }

    getCastle();

    setInterval(() => {
        GetResources();
        for (let i = 0; i < units.length; i++) {
            let unit = units[i]
            attack(unit.cell_x, unit.cell_y);
        }
        engine.build();
        if (ai.amount_soldier < 4) {
            engine.createUnits();
        }
        engine.move();
        if (player.amount_soldier > 1) {
            mergeUnits();
        }
    }, 1000);
}

function getCastle() {
    // Creation of the castle

    let x = Math.floor(Math.random() * (MAP_WIDTH / 10));
    let y = Math.floor(Math.random() * (MAP_HEIGHT / 10));

    placeBuildings('castle', x, y, 1, 4, 4, 'Castle1', true);

}

//function to generate resources 
function GetResources() {

    for (const array_building of buildings) {

        if (array_building.isPlayer == true) {
            let property_name = "amount_" + array_building.generates;
            player[property_name] += array_building.resources_pre_second;
        }
        if (array_building.isPlayer == false) {
            let property_name = "amount_" + array_building.generates;
            ai[property_name] += array_building.resources_pre_second;
            ai.isPlayer = false;
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

        let usedcell = new UsedCells_Highlight();
        if (map[x][y].type != 'occupied' || map[x][y].type != 'hill') {
            if (type == 'castle') {
                building.type = type;
                building.x = x;
                building.y = y;
                building.castle++;
                building.generates = 'food';
                building.hp = 10000;
                building.isPlayer = true;
                building.resources_pre_second = amount_per_second;
                building.width = width;
                building.height = height;
                building.placeOnMap();
                usedcell.x = x;
                usedcell.y = y;
                usedcells.push(usedcell);
                map[x][y].sprite = document.getElementById(sprite_id);
                buildings.push(building);
            } else {
                let bool = building.isInsideBuildZone(x, y)
                if (bool) {
                    switch (type) {
                        case 'lumberCamp':
                            buildStatus.lumberCamp++;
                            building = new Building();
                            building.lumberCamp++;
                            building.generates = 'wood';
                            building.hp = 500;
                            player.amount_food -= 10;
                            break;
                        case 'quarry':
                            buildStatus.quarry++;
                            building = new Building();
                            building.quarry++;
                            building.generates = 'stone';
                            building.hp = 500;
                            player.amount_food -= 10;
                            player.amount_wood -= 10;
                            break;
                        case 'bank':
                            buildStatus.bank++;
                            building = new Building();
                            building.bank++;
                            building.generates = 'gold';
                            building.hp = 500;
                            player.amount_wood -= 20;
                            player.amount_stone -= 20;
                            break;
                        case 'barracks':
                            buildStatus.barracks++;
                            building = new Building();
                            building.barracks++;
                            building.hp = 500;
                            player.amount_food -= 10;
                            player.amount_stone -= 15;
                            break;
                    }
                    building.isPlayer = true;
                    building.resources_pre_second = amount_per_second;
                    building.width = width;
                    building.height = height;
                    building.type = type;
                    building.x = x;
                    building.y = y;
                    building.placeOnMap();
                    usedcell.x = x;
                    usedcell.y = y;
                    usedcells.push(usedcell);
                    map[x][y].sprite = document.getElementById(sprite_id);
                    player.isPlayer = true;
                    buildings.push(building);
                    players.push(player);
                } else {
                    alert("Out of Building Zone");
                    document.getElementById("buildingMode").classList.remove("active");
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

        if (map[x][y].type != 'occupied' || map[x][y].type != 'hill') {
            if (ai_building.castle == 0 && type == 'castleAI') {

                ai_building.type = type;
                ai_building.x = x;
                ai_building.y = y;
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
                        ai_building.hp = 500;
                        ai.amount_food -= 10;
                        ai.amount_stone -= 10;
                        break;
                }

                ai_building.type = type;
                ai_building.x = x;
                ai_building.y = y;
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
                if (!visited[i][j] && minDistance > 0 && distances[i][j] < minDistance) {
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
//draw of the building mode that shows where the player is allowed to build
function drawBuildingMode(bool) {
    const ui_highlight = document.getElementById("ui_highlight");
    const ctx = ui_highlight.getContext("2d");
    if (bool) {
        for (let x = 0; x <= 20; x++)
            for (let y = 0; y <= 15; y++) {
                map[x][y].isInsideBuildZone = true;

                if (map[x][y].isInsideBuildZone) {
                    ctx.fillStyle = `rgba(0, 255, 0, 0.4)`;
                }

                if (map[x][y].type == 'occupied') {
                    ctx.fillStyle = `rgba(255, 100, 0, 0.5)`;
                }

                ctx.fillRect(x * CELL_WIDTH, y * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);

            }
        ui_highlight.style.display = "block";

    } else {
        ctx.clearRect(0, 0, 21 * CELL_WIDTH, 16 * CELL_HEIGHT);
        ui_highlight.style.display = "none"
    }

}

function drawBuildings(x, y) {
    const ui_map = document.getElementById("ui_map");
    let ctx = ui_map.getContext("2d");
    let sprite = map[x][y].sprite;
    ctx.drawImage(sprite, x * (CELL_WIDTH), y * (CELL_HEIGHT), sprite.naturalWidth, sprite.naturalHeight);
}

function moveUnits(x, y) {
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
            //this condition makes sure that the only units that moves with this function is the player´s unit and the AI´s dont
            if (unit.isPlayer && unit.currentCell_x == x && unit.currentCell_y == y) {
                //coords in grid
                unit.cell_x = cell_x;
                unit.cell_y = cell_y;
                //coords in pixels
                unit.target_x = cell_x * CELL_WIDTH;
                unit.target_y = cell_y * CELL_HEIGHT;
                console.log('move');
                inMovement = true;
                unit.updateCell(cell_x, cell_y);
            }
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

    for (const unit of units) {
        if (unit.isPlayer) {
            for (const building of buildings) {
                if (!building.isDestroyed && !building.isPlayer &&
                    building.x === target_x && building.y === target_y &&
                    unit.currentCell_x === target_x && unit.currentCell_y === target_y && building.type != '') {
                    console.log(building);
                    healthBarContainer.style.top = `${target_y * CELL_HEIGHT}px`;
                    healthBarContainer.style.left = `${(target_x * CELL_WIDTH) - 5}px`;
                    healthBar.style.visibility = 'visible';
                    healthBarContainer.style.visibility = 'visible';

                    // Check if the building is already under attack
                    if (!activeAttacks.has(building)) {
                        const attackInterval = setInterval(() => {
                            if (building.hp > 0) {
                                console.log("attacking");
                                engine.underSiege.x = target_x;
                                engine.underSiege.y = target_y;
                                building.hp -= unit.attack_damage;
                                if (building.type == 'castleAI') {
                                    maxHP = 10000;

                                } else {
                                    maxHP = 500;
                                }
                                let healthValue = Math.floor((building.hp * 100) / maxHP);
                                console.log(healthValue);
                                healthBar.style.width = healthValue + '%';

                                if (building.hp <= 0) {
                                    clearInterval(attackInterval);
                                    activeAttacks.delete(building, attackInterval);
                                    building.isDestroyed = true;
                                    map[target_x][target_y].sprite = null;
                                    engine[building.type]--;
                                    healthBar.style.width = `${100}%`;
                                    const ui_map = document.getElementById("ui_map");
                                    let ctx = ui_map.getContext("2d");
                                    ctx.clearRect(target_x * CELL_WIDTH, target_y * CELL_HEIGHT, 64, 64);
                                    drawTexture();
                                    drawScenery();

                                    healthBar.style.visibility = 'hidden';
                                    healthBarContainer.style.visibility = 'hidden';
                                    console.log("destroyed");
                                    if (building.type == 'castleAI') {
                                        console.log('You Won');
                                        document.getElementById("winLose").classList.add("active");
                                        document.body.style.overflow = "hidden";
                                        document.getElementById("win-Text").style.visibility = "visible";
                                        document.getElementById("playAgainBtn").style.visibility = "visible";
                                        document.getElementById("exit").style.visibility = "visible";
                                    }
                                }
                            }
                        }, 2000);

                        // Add the building to the map of active attacks

                        activeAttacks.set(building, attackInterval);
                    }
                }
            }
        }
    }
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
    drawBuildingMode(true);
    let canvas = document.getElementById("ui_map");
    canvas.addEventListener("click", function (e) {
        if (buildStatus.lumberCamp < 3) {
            if (player.amount_food >= 10) {
                let values = getCoordinates(canvas, e);
                let x = values[0];
                let y = values[1];
                if (map[x][y].type != 'occupied') {
                    placeBuildings('lumberCamp', x, y, 1, 2, 2, 'Lumber1', true);
                    showUnitCanvas(true);
                    drawBuildings(x, y);
                } else {
                    alert("Não podes construir aqui, zona ocupada por um edifício")
                }

            } else {
                alert("É necessário 10 de Comida");
            }
            document.getElementById("buildingMode").classList.remove("active");
            drawBuildingMode(false);
        } else {
            alert("Max: 3");
            document.getElementById("buildingMode").classList.remove("active");
            drawBuildingMode(false);
        }
    }, {
        once: true
    });
}

function placeQuarry() {
    showUnitCanvas(false);
    document.getElementById("buildingMode").classList.add("active");
    drawBuildingMode(true);
    const canvas = document.getElementById("ui_map");
    canvas.addEventListener("click", function (e) {
        if (buildStatus.quarry < 3) {
            if (player.amount_food >= 10 && player.amount_wood >= 10) {
                let values = getCoordinates(canvas, e);
                let x = values[0];
                let y = values[1];
                if (map[x][y].type != 'occupied') {
                    placeBuildings('quarry', x, y, 1, 2, 2, 'Quarry1', true);
                    showUnitCanvas(true);
                    drawBuildings(x, y);
                } else {
                    alert("Não podes construir aqui, zona ocupada por um edifício")
                }
            } else {
                alert("São necessários 10 de Comida e 10 de Madeira");
            }
            document.getElementById("buildingMode").classList.remove("active");
            drawBuildingMode(false);
        } else {
            alert("Max: 3");
            document.getElementById("buildingMode").classList.remove("active");
            drawBuildingMode(false);
        }
    }, {
        once: true
    });
}

function placeBank() {
    showUnitCanvas(false);
    document.getElementById("buildingMode").classList.add("active");
    drawBuildingMode(true);
    const canvas = document.getElementById("ui_map");
    canvas.addEventListener("click", function (e) {
        if (buildStatus.bank < 2) {
            if (player.amount_wood >= 20 && player.amount_stone >= 20) {
                let values = getCoordinates(canvas, e);
                let x = values[0];
                let y = values[1];
                if (map[x][y].type != 'occupied') {
                    placeBuildings('bank', x, y, 1, 2, 2, 'Bank1', true);
                    showUnitCanvas(true);
                    drawBuildings(x, y);
                } else {
                    alert("Não podes construir aqui, zona ocupada por um edifício")
                }
            } else {
                alert("São necessários 20 de Madeira e 20 de Pedra");
            }
            document.getElementById("buildingMode").classList.remove("active");
            drawBuildingMode(false);
        } else {
            alert("Max: 2");
            document.getElementById("buildingMode").classList.remove("active");
            drawBuildingMode(false);
        }
    }, {
        once: true
    });
}

function placeBarracks() {
    showUnitCanvas(false);
    document.getElementById("buildingMode").classList.add("active");
    drawBuildingMode(true);
    const canvas = document.getElementById("ui_map");
    canvas.addEventListener("click", function (e) {
        if (buildStatus.barracks < 3) {
            if (player.amount_food >= 10 && player.amount_stone >= 15) {
                let values = getCoordinates(canvas, e);
                let x = values[0];
                let y = values[1];
                if (map[x][y].type != 'occupied') {
                    placeBuildings('barracks', x, y, 1, 2, 2, 'Barracks1', true);
                    showUnitCanvas(true);
                    drawBuildings(x, y);
                } else {
                    alert("Não podes construir aqui, zona ocupada por um edifício")
                }
            } else {
                alert("São necessários 10 de Comida e 15 de Pedra")
            }
            document.getElementById("buildingMode").classList.remove("active");
            drawBuildingMode(false);
        } else {
            alert("Max: 3");
            document.getElementById("buildingMode").classList.remove("active");
            drawBuildingMode(false);
        }
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

//this function allows the player to click on the map and if the place the player clicked is a barrack a menu with info will open, and there the player can train infantry
let mouseCell_x;
let mouseCell_y;

function select() {
    const canvas = document.getElementById("ui_units");
    canvas.addEventListener("mousedown", e => {
        mouseCell_x = Math.floor(e.offsetX / CELL_WIDTH);
        mouseCell_y = Math.floor(e.offsetY / CELL_HEIGHT);

        for (let i = 0; i < buildings.length; i++) {
            let building = buildings[i];
            if (building.type == 'barracks' && building.isPlayer == true && mouseCell_x == building.x && mouseCell_y == building.y) {
                document.getElementById("buildingsWindow").classList.add("active");
            }
        }
    });
}
//this funciton allows the player to choose wich unit the players wants to move
function selectUnit() {
    if (player.amount_soldier > 0) {
        document.getElementById("ui_units").addEventListener('click', function (event) {
            document.getElementById("buildingsWindow").classList.remove("active");
            let x = Math.floor(event.offsetX / CELL_WIDTH);
            let y = Math.floor(event.offsetY / CELL_HEIGHT);
            for (let unit of units) {
                if (unit.isPlayer) {
                    console.log(x, y);
                    console.log(unit.currentCell_x, unit.currentCell_y);
                    if (x == unit.currentCell_x && y == unit.currentCell_y ||
                        x == unit.currentCell_x + 1 && y == unit.currentCell_y ||
                        x == unit.currentCell_x && y == unit.currentCell_y + 1 ||
                        x == unit.currentCell_x + 1 && y == unit.currentCell_y + 1) {
                        console.log('unit selected');
                        moveUnits(x, y);
                    }
                }
            }
        }, {
            once: true
        });
    }
}
//this function select what canvas is active, this allows the movement of the units to be drawn
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
//function to create a unit for the player
function createUnit() {
    document.getElementById("buildingsWindow").classList.remove("active");
    if (player.amount_food >= 10 && player.amount_gold >= 10) {
        let unit = new Unit();

        unit.type = "infantry";
        unit.x = mouseCell_x * CELL_WIDTH;
        unit.y = mouseCell_y * CELL_HEIGHT;
        unit.currentCell_x = mouseCell_x;
        unit.currentCell_y = mouseCell_y;
        unit.isPlayer = true;
        player.amount_food -= 10;
        player.amount_gold -= 10;
        player.amount_soldier++;
        player.isPlayer = true;
        unit.sprite = document.getElementById('Infantry1');

        units.push(unit);
        players.push(player);
        drawUnits();
    } else {
        alert('É necessário 10 de Comida e 10 de Ouro');
    }
}

//this function uses the isSameCell to verify if there is more than one unit in a cell and then merges it turning into an army
function mergeUnits() {
    let isSameCellBool_x;
    let isSameCellBool_y;

    let filteredUnits = units.filter(unit => unit.isPlayer === true &&
        unit.currentCell_x != 0 && unit.currentCell_y != 0);

    console.log(filteredUnits);
    isSameCellBool_x = isSameCell(filteredUnits, 'currentCell_x');
    isSameCellBool_y = isSameCell(filteredUnits, 'currentCell_y');
    if (isSameCellBool_x != false || isSameCellBool_y != false) {

        for (const unit of units) {
            for (const keys of units.keys()) {
                if (unit.currentCell_x == isSameCellBool_x && unit.currentCell_y == isSameCellBool_y) {
                    units.splice(keys, 2);
                    let unit = new Unit();
                    unit.type = "army";
                    unit.x = isSameCellBool_x * CELL_WIDTH;
                    unit.y = isSameCellBool_y * CELL_HEIGHT;
                    unit.currentCell_x = isSameCellBool_x;
                    unit.currentCell_y = isSameCellBool_y;
                    unit.sprite = document.getElementById('Army1');
                    units.push(unit);
                }
            }
        }

        //if (index !== -1 && index2 !== -1) {
        //units.splice(index, 1);
        //units.splice(index2, 1);
        console.log('sameCell_x' + isSameCellBool_x);
        console.log('sameCell_y' + isSameCellBool_y);
        /*let unit = new Unit();
        unit.type = "army";
        unit.x = ;
        unit.y = ;
        unit.currentCell_x = ;
        unit.currentCell_y = ;
        unit.sprite = document.getElementById('Army1');
        units.push(unit);*/
        //}
    }
}

//this function detects if there is more than one unit in a cell
function isSameCell(arr, prop) {
    const valueMap = new Map();
    for (const obj of arr) {
        if (valueMap.has(obj[prop])) {
            console.log(obj[prop]);
            return obj[prop];
        }
        valueMap.set(obj[prop], true);
    }
    return false;
}