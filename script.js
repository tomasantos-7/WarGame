class TerrainType{
  constructor(minHeight, maxHeight, Image){
    this.minHeight = minHeight;
    this.maxHeight = maxHeight;
    this.Image = Image;
  }
}

// Tipos de Terreno
let plainsTerrain;
let forestTerrain;
let mountainsTerrain;
let plainsTerrainImage;
let forestTerrainImage;
let mountainsTerrainImage;

let terrainImage;

let cols, rows;
let zoomFactor = 100; // escala de "noise"
let noiseGrid = [];

function preload()
{
  plainsTerrainImage = loadImage('assets/plains.png');
  forestTerrainImage = loadImage('assets/forest.png');
  mountainsTerrainImage = loadImage('assets/mountains.png');
}

function setup() {
  createCanvas(1580, 650);
  //createCanvas(600, 600);
  noiseDetail(1, 0.5);
  cols = 10; // nº de colunas do array
  rows = 10; // nº de linhas do array
  // atribuição dos valores de "noise" para cada tipo de terreno
  plainsTerrain = new TerrainType(0.2, 0.4, plainsTerrainImage);
  forestTerrain = new TerrainType(0.4, 0.7, forestTerrainImage);
  mountainsTerrain = new TerrainType(0.7, 0.75, mountainsTerrainImage);
}


function draw() {

  for (x = 0; x < width; x++) {
    //noiseGrid[y] = [];
    for (y = 0; y < height; y++) {
      // Calcular o valor de Perlin noise para cada coordenada
      //noiseGrid[y][x] = noise(x * scl, y * scl);
      const noisevalue = noise(x / zoomFactor, y / zoomFactor);

      if (noisevalue < plainsTerrain.maxHeight) {
        console.log('plains');
        //set(x, y, plainsTerrainImage);
      }
      if (noisevalue >= plainsTerrain.maxHeight && noisevalue < forestTerrain.maxHeight) {
        console.log('forest');
        set(x, y, forestTerrainImage);
      }
      if (noisevalue >= forestTerrain.maxHeight && noisevalue < mountainsTerrain.maxHeight){
        console.log('mountains');
        set(x, y, mountainsTerrainImage);  
      }
      
    }
  }

  updatePixels();
  //let dump_map = noiseGrid.map((inner_arr)=>{return '[' + inner_arr.join(',') + ']'; })
  //document.body.innerText  = '[' + dump_map.join(',') + ']';
  
}