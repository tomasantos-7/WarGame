const MAP_WIDTH = 100;
const MAP_HEIGHT = 100;
const CELL_WIDTH = 32;
const CELL_HEIGHT = 32;
const buildings = [];
const players = [];
const units = [];
let target_cell = [];



class Engine {



    build() {

        //CASTLE

        if (ai_building.castle < 1) {
            let x = Math.floor(Math.random() * (MAP_WIDTH) + 1);
            let y = Math.floor(Math.random() * (MAP_HEIGHT) + 1);

            if (x > building.castle_x + 1 && y > building.castle_y + 1 && map[x][y].type != 'hill') {
                placeBuildings('castleAI', x, y, 1, 4, 4, 'Castle1', false);

            } else {
                x = Math.floor(Math.random() * (MAP_WIDTH) + 1);
                y = Math.floor(Math.random() * (MAP_HEIGHT) + 1);
            }
        } else {
            //Buildings

            let rand_x = Math.floor(Math.random() * (MAP_WIDTH / 10));

            if (ai_building.lumberCamp == 0) {
                if (ai.amount_food > 10) {
                    ai.amount_food -= 10;
                    placeBuildings('lumberCampAI', ai_building.castle_x + rand_x, ai_building.castle_y + rand_x, 1, 2, 2, 'Lumber1', false);
                }
            }
            if (ai_building.quarry == 0) {
                if (ai.amount_food > 10 && ai.amount_wood > 10) {
                    ai.amount_food -= 10;
                    ai.amount_wood -= 10;
                    placeBuildings('quarryAI', ai_building.castle_x + 7, ai_building.castle_y + 3, 1, 2, 2, 'Quarry1', false);
                }
            }
            if (ai_building.bank == 0) {
                if (ai.amount_wood > 20 && ai.amount_stone > 20) {
                    ai.amount_wood -= 20;
                    ai.amount_stone -= 20;
                    placeBuildings('bankAI', ai_building.castle_x + rand_x, ai_building.castle_y + rand_x, 2, 2, 2, 'Bank1', false);
                }
            }
            if (ai_building.barracks == 0) {
                if (ai.amount_food > 10 && ai.amount_stone > 15) {
                    ai.amount_food -= 10;
                    ai.amount_stone -= 10;
                    placeBuildings('barracksAI', ai_building.castle_x + rand_x, ai_building.castle_y + rand_x, 1, 2, 2, 'Barracks1', false);
                }
            }
        }
    }

    move() {

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
    castle_x = 0;
    castle_y = 0;
    isPlayer = true;

    placeOnMap() {


        for (let x = this.x; x < this.x + this.width; x++)
            for (let y = this.y; y < this.y + this.height; y++) {
                map[x][y].type = 'occupied';
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

        map[this.x][this.y].type = this.type;
    }

    isInsideBuildZone() {
        for (let x = 0; x < Math.floor(0.375 * CELL_WIDTH); x++)
            for (let y = 0; y < Math.floor(0.375 * CELL_WIDTH); y++) {
                let delta_x = x - this.castle_x;
                let delta_y = y - this.castle_y;
                let distance = Math.sqrt(Math.pow(delta_x, 2) + Math.pow(delta_y, 2));
                if (distance < 12) {
                    return true;
                } else {
                    return false;
                }
            }
    }
}


class Player {
    amount_food = 0;
    amount_wood = 0;
    amount_stone = 0;
    amount_gold = 0;
    amount_soldier = 0;
    soldier_x = 0;
    soldier_y = 0;
    soldier_hp = 200;
    soldier_atck = 100;
}


class Unit {
    type = 'infantry';
    sprite = null;
    speed = 100; //speed for 32 px per second
    selected = true;
    //current position in pixels
    x = 0;
    y = 0;
    //current cell 
    currentCell_x = 0;
    currentCell_y = 0;
    //target position in pixels
    target_x = 0;
    target_y = 0;
    //target cell coords
    cell_x = this.target_x / CELL_WIDTH;
    cell_y = this.target_y / CELL_HEIGHT;


    //method to make the calculations for the units movement
    move(elpased) {


        this.currentCell_x = Math.floor(this.x / CELL_WIDTH);
        this.currentCell_y = Math.floor(this.y / CELL_HEIGHT);

        //calculate the amount of pixels to travel using the target position and the units current position do create the distance beteween them
        let delta_x = this.target_x - this.x;
        let delta_y = this.target_y - this.y;
        let distance = Math.sqrt(Math.pow(delta_x, 2) + Math.pow(delta_y, 2));

        if (distance < 1) { //if the distance is lower than one there is no need to move the unit because its too close
            return;
        }
        //
        let normalized_x = delta_x / distance;
        let normalized_y = delta_y / distance;
        //calculate the amount of PX we will travel in X milliseconds, we will travel at 32px per second
        let amount_to_travel = (elpased * this.speed) / 1000;
        //get the cost for travelling in the current terrain | plains = faster, hills = lower 
        let cost = map[Math.floor(this.x / CELL_WIDTH)][Math.floor(this.y / CELL_HEIGHT)].cost;
        //calculate the amount of px we will travel with terrain penalties
        this.x += (amount_to_travel * normalized_x) / cost;
        this.y += (amount_to_travel * normalized_y) / cost;
    }
}

let player = new Player();
let ai = new Player();
let building = new Building();
let ai_building = new Building();
let engine = new Engine();

let drawPath = false;

//cria um array de arrays, com o tamanho (MAP_WIDTH x MAP_HEIGHT) tudo inicializado a 0;
const map = new Array(MAP_WIDTH).fill(0).map(() => new Array(MAP_HEIGHT).fill(0));
const textureMap = new Map();

function setup() {
    //make html reflect hour variables co we have only 1 place to alter
    const ui_map = document.getElementById("ui_map");
    ui_map.setAttribute("width", MAP_WIDTH * CELL_WIDTH);
    ui_map.setAttribute("height", MAP_HEIGHT * CELL_HEIGHT);
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
            if (!unit.selected)
                continue;
            //coords in grid
            unit.cell_x = cell_x;
            unit.cell_y = cell_y;
            //coords in pixels
            unit.target_x = cell_x * CELL_WIDTH;
            unit.target_y = cell_y * CELL_HEIGHT;

            console.log("Grid X:" + unit.cell_x + " Y: " + unit.cell_y +
                " Pixels X: " + unit.target_x + " Y: " + unit.target_y +
                " Caslte X: " + building.castle_x + " Castle Y: " + building.castle_y +
                " Current Cell X: " + unit.currentCell_x + " Current Cell Y: " + unit.currentCell_y);
            console.log(units);

            pathfinding(map, unit.currentCell_x, unit.currentCell_y, unit.cell_x, unit.cell_y)

        }
    })

    //load into variables
    textureMap.set('tree', document.getElementById('trees').children);
    textureMap.set('hill', document.getElementById('hills').children);
    textureMap.set('pine', document.getElementById('pines').children);
    textureMap.set('rock', document.getElementById('rocks').children);
    textureMap.set('castle', document.getElementById('castles').children);
    textureMap.set('infantries', document.getElementById('infantries').children);

    initializeTerrain();
    requestAnimationFrame(drawFrame);
}
let previous_ts = null;

function drawFrame(timestamp) {

    let delta = 0;
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
        drawScenery();
    }
    drawUnits();
    //drawGrayscale();
    requestAnimationFrame(drawFrame);

    previous_ts = timestamp;
}
//** terrain generation functions
function initializeTerrain() {

    let canvas = document.getElementById("ui_map");

    //imaginando que o terreno está tudo a nivel da agua, a cada iteração vamos elevar uma pequena ilha de forma redonda, num local aleatório 
    for (let i = 0; i < 100; i++) {
        let center_x = Math.floor(Math.random() * MAP_WIDTH);
        let center_y = Math.floor(Math.random() * MAP_HEIGHT);
        elevateTerrain(0.1, center_x, center_y, 10)
    }
    for (let x = 0; x < MAP_WIDTH; x++)
        for (let y = 0; y < MAP_WIDTH; y++) {
            let height = map[x][y];
            let type = 'plain';
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
                'transversable': type != 'hill', // adicionar buildings para fazer com que não seja possivel passar por dentro deless
                'cost': cost,
                'sprite': chosen_sprite,
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
    /*document.getElementById("foodAI").textContent = "Comida AI = " + ai.amount_food;
    document.getElementById("woodAI").textContent = "Madeira AI = " + ai.amount_wood;
    document.getElementById("stoneAI").textContent = "Pedra AI = " + ai.amount_stone;
    document.getElementById("goldAI").textContent = "Ouro AI = " + ai.amount_gold;*/
}

function placeBuildings(type, x, y, amount_per_second, width, height, sprite_id, isPlayer) {

    if (isPlayer) {
        building.type = type;
        building.x = x;
        building.y = y;

        switch (type) {
            case 'castle':
                building.castle++;
                building.generates = 'food';
                building.hp = 10000;
                break;
            case 'lumberCamp':
                building = new Building();
                building.lumberCamp++;
                building.generates = 'wood';
                building.hp = 500;
                break;
            case 'quarry':
                building = new Building();
                building.quarry++;
                building.generates = 'stone';
                building.hp = 500;
                break;
            case 'bank':
                building = new Building();
                building.bank++;
                building.generates = 'gold';
                building.hp = 500;
                break;
            case 'barracks':
                building = new Building();
                building.barracks++;
                building.generates = 'soldier';
                building.hp = 500;
                break;
        }
        building.isPlayer = isPlayer;
        building.resources_pre_second = amount_per_second;
        building.width = width;
        building.height = height;

        if (map[x][y].type != 'occupied' && map[x][y].type != 'hill') {
            if (type == 'castle') {
                building.placeOnMap();
                map[x][y].sprite = document.getElementById(sprite_id);
                buildings.push(building);
            } else {
                let bool = building.isInsideBuildZone()
                if (bool) {
                    building.placeOnMap();
                    map[x][y].sprite = document.getElementById(sprite_id);
                    buildings.push(building);
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

        switch (type) {
            case 'castleAI':
                ai_building.castle++;
                ai_building.generates = 'food';
                ai_building.hp = 10000;
                break;
            case 'lumberCampAI':
                ai_building = new Building();
                ai_building.lumberCamp++;
                ai_building.generates = 'wood';
                ai_building.hp = 500;
                break;
            case 'quarryAI':
                ai_building = new Building();
                ai_building.quarry++;
                ai_building.generates = 'stone';
                ai_building.hp = 500;
                break;
            case 'bankAI':
                ai_building = new Building();
                ai_building.bank++;
                ai_building.generates = 'gold';
                ai_building.hp = 500;
                break;
            case 'barracksAI':
                ai_building = new Building();
                ai_building.barracks++;
                ai_building.generates = 'soldier';
                ai_building.hp = 500;
                break;
        }

        ai_building.isPlayer = isPlayer;
        ai_building.resources_pre_second = amount_per_second;
        ai_building.width = width;
        ai_building.height = height;

        if (map[x][y].type != 'occupied' && map[x][y].type != 'hill') {
            if (type == 'castleAI') {
                ai_building.placeOnMap();
                map[x][y].sprite = document.getElementById(sprite_id);
                buildings.push(ai_building);
            } else {
                let bool = ai_building.isInsideBuildZone();

                if (bool) {
                    ai_building.placeOnMap();
                    map[x][y].sprite = document.getElementById(sprite_id);
                    buildings.push(ai_building);
                } else {
                    bool = ai_building.isInsideBuildZone();
                }
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
    let closestNode = 0;
    let node = 0
    let cost = 0;
    let acumulatedCost = 0;
    let distance = [];
    let unvisited = [];
    let visited = [];
    let blocked = [];
    let startPoint = [];
    let endPoint = [];
    let path = [];


    startPoint.push(x, y);
    endPoint.push(x_end, y_end);


    for (let x = 0; x < MAP_WIDTH; x++) {
        for (let y = 0; y < MAP_HEIGHT; y++) {
            node = [x][y];
            if (node === startPoint) {
                distance[node] = 0;
            } else {
                cost = map[x][y].cost;
                distance[node] = cost;
            }
        }
    }
    unvisited.push(node);


    while (unvisited.length != 0) {
        for (let node of unvisited) {
            if (distance[node] < distance[closestNode]) {
                closestNode = node;
                acumulatedCost = distance[closestNode] + distance[node]; 
            }
        }

        for (let neighbor of map[closestNode]) {
            let newDistance = acumulatedCost + distance[neighbor];
            if (newDistance < distance[neighbor]) {
                distance[neighbor] = newDistance;
                visited[neighbor] = closestNode;
            }
        }
        unvisited.shift(closestNode);
        path.push(node);
    }

    path.reverse();

    console.log("distance: " + distance);
    console.log("unvisited: " + unvisited);
    console.log("visited: " + visited);
    console.log("blocked: " + blocked);
    console.log("startPoint: " + startPoint);
    console.log("endPoint: " + endPoint);
    console.log("closestNode: " + closestNode);
    console.log("path: " + path);
    console.log("cost: " + cost);
    console.log("acumulatedCost: " + acumulatedCost);
}

function UserClicked() {
    /*
    const canvas = document.getElementById("ui_map");
    const ctx = canvas.getContext("2d");
    canvas.addEventListener("mousedown", function (e) {
        let values = getCoordinates(canvas, e);
        let x = values[0];
        let y = values[1];
        if (x != player.soldier_x && y != player.soldier_y) {
            console.log(moveUnits(map, player.soldier_x, player.soldier_y, x, y));
            drawPath = true;
        }
        //placeBuildings('lumberCamp', x, y, 1, 2, 2, 'Lumber1', true);
    });
*/
}


function getCoordinates(canvas, event) {

    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    x = Math.floor(x / CELL_WIDTH);
    y = Math.floor(y / CELL_HEIGHT);
    return [x, y];
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
    /*
        for (let x = 0; x < MAP_WIDTH * CELL_WIDTH; x += 32)
            for (let y = 0; y < MAP_WIDTH * CELL_WIDTH; y += 32) {
                ctx.strokeStyle = "rgb(0 0 0 / 20%)";
                ctx.strokeRect(x, y, 32, 32);
            }
    */


}

function drawScenery() {
    const canvas = document.getElementById("ui_map");
    const ctx = canvas.getContext("2d");
    for (let x = 0; x < MAP_WIDTH; x++)
        for (let y = 0; y < MAP_WIDTH; y++) {
            let sprite = map[x][y]['sprite'];
            let type = map[x][y]['type'];

            if (!sprite) {
                continue;
            } else {

                ctx.drawImage(sprite, x * (CELL_WIDTH), y * (CELL_HEIGHT), sprite.naturalWidth, sprite.naturalHeight);
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

    if (map[x + building.castle_x][y + building.castle_y].type != 'occupied')
        ctx.fillStyle = `rgb(0 255 0 / ${map[x][y].elevation * 100}%)`;
}

function drawUnits() {

    const canvas = document.getElementById("ui_units");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < units.length; i++) {
        let unit = units[i];
        //unit gets drawn centered in cell
        let draw_x = unit.x - unit.sprite.naturalWidth / 2 + CELL_WIDTH / 2;
        let draw_y = unit.y - unit.sprite.naturalHeight / 2 + CELL_HEIGHT / 2;
        ctx.drawImage(unit.sprite, unit.x, unit.y, unit.sprite.naturalWidth, unit.sprite.naturalHeight);
    }
}