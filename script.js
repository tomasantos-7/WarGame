const MAP_WIDTH = 100;
const MAP_HEIGHT = 100;
const CELL_WIDTH = 32;
const CELL_HEIGHT = 32;
const buildings = [];
const players = [];

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
    amount_soldier = 1;
    soldier_x = 0;
    soldier_y = 0;
    soldier_hp = 200;
    soldier_atck = 100;
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
    const canvas = document.getElementById("ui_map");
    canvas.setAttribute("width", MAP_WIDTH * CELL_WIDTH);
    canvas.setAttribute("height", MAP_HEIGHT * CELL_HEIGHT);
    //load into variables
    textureMap.set('tree', document.getElementById('trees').children);
    textureMap.set('hill', document.getElementById('hills').children);
    textureMap.set('pine', document.getElementById('pines').children);
    textureMap.set('rock', document.getElementById('rocks').children);
    textureMap.set('castle', document.getElementById('castles').children);

    initializeTerrain();
    requestAnimationFrame(drawFrame);
}
let previous_ts = null;

function drawFrame(timestamp) {

    if (previous_ts) {
        let delta = timestamp - previous_ts;
        let fps = 1000 / delta;
        document.title = fps;

    }
    previous_ts = timestamp;
    drawTexture();
    drawScenery();
    UserClicked();
    //drawGrayscale();
    requestAnimationFrame(drawFrame);
}
//** terrain generation functions
function initializeTerrain() {
    let type;

    //imaginando que o terreno está tudo a nivel da agua, a cada iteração vamos elevar uma pequena ilha de forma redonda, num local aleatório 
    for (let i = 0; i < 100; i++) {

        let center_x = Math.floor(Math.random() * MAP_WIDTH);
        let center_y = Math.floor(Math.random() * MAP_HEIGHT);
        elevateTerrain(0.1, center_x, center_y, 10);
    }
    /* texture map
            0.0 < plains < 0.3
            0.3 < trees < 0.4
            0.4 < plains < 0.5
            0.5 < pines < 0.6
            0.6 < plains < 0.7
            0.7 < hills < 1.0
            */
    for (let x = 0; x < MAP_WIDTH; x++)
        for (let y = 0; y < MAP_WIDTH; y++) {

            let height = map[x][y];
            type = 'plain';
            if (0.3 <= height && height < 0.4)
                type = 'tree';
            else if (0.5 <= height && height < 0.6)
                type = 'pine';
            else if (0.6 <= height && height < 0.7)
                type = 'rock';
            else if (0.7 <= height)
                type = 'hill';


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
                'sprite': chosen_sprite,
            }
        }

    getCastle();
    spawnUnits(building.castle_x + 5, building.castle_y + 5, 'Infantry2');
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
            alert("Coloca num espaço disponivel");
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

function moveUnits(map, x, y, x_end, y_end) {
    let distances = {};
    let previous = {};
    let unvisited = new Set();
    let startPoint = [];
    let endPoint = [];

    startPoint.push(x, y);
    endPoint.push(x_end, y_end);

    for (let node of map) {
        distances[node] = node === startPoint ? 0 : Infinity;
        unvisited.add(node);
    }

    while (unvisited.size) {
        let closestNode = null;
        for (let node of unvisited) {
            if (!closestNode || distances[node] < distances[closestNode]) {
                closestNode = node;
            }
        }

        if (distances[closestNode] === Infinity) break;
        if (closestNode === endPoint) break;

        for (let neighbor in map[closestNode]) {
            let newDistance = distances[closestNode + map[closestNode][neighbor]];
            if (newDistance < distances[neighbor]) {
                distances[neighbor] = newDistance;
                previous[neighbor] = closestNode;
            }
        }
        unvisited.delete(closestNode);
    }

    let path = [],
        node = endPoint;
    while (node) {
        path.push(node);
        node = previous[node];
    }
    return path.reverse();
}

function UserClicked() {
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

            let sprite = map[x][y].sprite;
            if (!sprite) {
                continue;
            } else {

                ctx.drawImage(sprite, x * (CELL_WIDTH), y * (CELL_HEIGHT), sprite.naturalWidth, sprite.naturalHeight);
            }
            if (drawPath) {
                //desenhar path
            }
        }
}
//**debug draw
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
    /*
            if(map[x+building.castle_x][y+building.castle_y].type != 'occupied')
                ctx.fillStyle = `rgb(0 255 0 / ${map[x][y].elevation * 100}%)`;*/
}