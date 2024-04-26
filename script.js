class TerrainType{
  constructor(minHeight, maxHeight, Image){
    this.minHeight = minHeight;
    this.maxHeight = maxHeight;
    this.Image = Image;
  }
}

// Tipos de Terreno
let plainsTerrain;
let hillsTerrain;
let mountainsTerrain;
//let terrainImage;


let cols, rows;
let scl = 0.1; // escala de "noise"
let noiseGrid = [];

function setup() {
  createCanvas(2000, 650);
  noiseDetail(9, 0.5)
  cols = 10; // nº de colunas do array
  rows = 10; // nº de linhas do array
  // atribuição dos valores de "noise" para cada tipo de terreno
  plainsTerrain = new TerrainType(0, 0.4);
  hillsTerrain = new TerrainType(0.4, 0.7);
  mountainsTerrain = new TerrainType(0.7, 1);

  generateNoiseGrid();
}

function generateNoiseGrid() {
  for (let y = 0; y < rows; y++) {
    noiseGrid[y] = [];
    for (let x = 0; x < cols; x++) {
      // Calcular o valor de Perlin noise para cada coordenada
      noiseGrid[y][x] = noise(x * scl, y * scl);
      noisevalue = noise(x * scl, y * scl);

      if (noisevalue < plainsTerrain.maxHeight) {
        console.log('plains');
      }else if (noisevalue < hillsTerrain.maxHeight) {
        console.log('hills');
      }else{
        console.log('mountains');
      }
      //set(x, y, terrainImage);
    }
  }
  updatePixels();
  let dump_map = noiseGrid.map((inner_arr)=>{return '[' + inner_arr.join(',') + ']'; })
  document.body.innerText  = '[' + dump_map.join(',') + ']';
}

