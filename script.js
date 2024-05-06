const MAP_WIDTH = 100;
const MAP_HEIGHT = 100;
const CELL_WIDTH = 32;
const CELL_HEIGHT = 32;
const buildings = [];
const players = [];


class Building {
    type = 'none';
    player = true;
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

    placeOnMap() {

        for (let x = this.x; x < this.x + this.width; x++)
            for (let y = this.y; y < this.y + this.height; y++) {
                map[x][y].type = 'occupied';
                map[x][y].sprite = null;

            }
        this.castle_x = this.x;
        this.castle_y = this.y;
        map[this.x][this.y].type = this.type;
    }

    isInsideBuildZone() {
        for (let x = this.x; x < this.x + this.width; x++)
            for (let y = this.y; y < this.y + this.height; y++) {
                let center_x = Math.floor(Math.random() * CELL_WIDTH);
                let center_y = Math.floor(Math.random() * CELL_HEIGHT);

                for (this.castle_x = 0; this.castle_x < this.castle_x * CELL_WIDTH; this.castle_x++)
                    for (this.castle_y = 0; this.castle_y < center_y * CELL_WIDTH; this.castle_y++) {
                        let delta_x = this.castle_x - center_x;
                        let delta_y = this.castle_y - center_y;
                        let distance = Math.sqrt(Math.pow(delta_x, 2) + Math.pow(delta_y, 2));
                        if (distance > 10) {
                            return true;
                        } else {
                            return false;
                        }
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
}

let player = new Player();
let ai = new Player();
let building = new Building();




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
    drawGrayscale();
    requestAnimationFrame(drawFrame);
}
//** terrain generation functions
function initializeTerrain() {
    let type;

    //imaginando que o terreno está tudo a nivel da agua, a cada iteração vamos elevar uma pequena ilha de forma redonda, num local aleatório 
    for (let i = 0; i < 100; i++) {

        let center_x = Math.floor(Math.random() * MAP_WIDTH);
        let center_y = Math.floor(Math.random() * MAP_HEIGHT);
        elevateTerrain(0.1, center_x, center_y, 10)
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
    //função de intervalo a cada segundo gera 1 de resources

    setInterval(() => {
        GetResources();
    }, 1000);
}

function getCastle() {
    // Criação do castelo

    let x = Math.floor(Math.random() * (MAP_WIDTH / 10));
    let y = Math.floor(Math.random() * (MAP_HEIGHT / 10));

    placeBuildings('castle', x, y, 1, 4, 4, true, 'Castle1');
    BZMAP_SIZE = 12;
}

//função para gerar resources ao longo do tempo
function GetResources() {

    for (const array_building of buildings) {

        let property_name = "amount_" + array_building.generates;
        player[property_name] += array_building.resources_pre_second
    }
    document.getElementById("food").textContent = "Comida = " + player.amount_food;
    document.getElementById("wood").textContent = "Madeira = " + player.amount_wood;
    document.getElementById("stone").textContent = "Pedra = " + player.amount_stone;
    document.getElementById("gold").textContent = "Ouro = " + player.amount_gold;
}

function placeBuildings(type, x, y, amount_per_second, width, height, isPlayer, sprite_id) {


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

    building.resources_pre_second = amount_per_second;
    building.width = width;
    building.height = height;
    building.player = isPlayer;

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


}


function userClicked() {
    let canvas = document.getElementById("ui_map");
    canvas.addEventListener("mousedown", function (e) {
        let values = buildingsPlacement(canvas, e);
        let x = values[0];
        let y = values[1];

        placeBuildings('lumberCamp', x, y, 1, 2, 2, true, 'Lumber1');
    });
}


function buildingsPlacement(canvas, event) {

    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    x = Math.floor(x / CELL_WIDTH);
    y = Math.floor(y / CELL_HEIGHT);
    return [x, y];
}

function buildingZone(castle_x, castle_y, center_x, center_y, radius) {

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

    for (let x = 0; x < MAP_WIDTH * CELL_WIDTH; x += 32)
        for (let y = 0; y < MAP_WIDTH * CELL_WIDTH; y += 32) {
            ctx.strokeStyle = "rgb(0 0 0 / 20%)";
            ctx.strokeRect(x, y, 32, 32);
        }


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

            ctx.fillRect(x * CELL_WIDTH, y * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
        }
    /*
            if(map[x+building.castle_x][y+building.castle_y].type != 'occupied')
                ctx.fillStyle = `rgb(0 255 0 / ${map[x][y].elevation * 100}%)`;*/
}