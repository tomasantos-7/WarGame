var map_size = 10;
var map = []
let cols, rows;
let scl = 0.1; // Scale of the noise
let noiseGrid = [];

function setup() {
  cols = 10; // Number of columns in the grid
  rows = 10; // Number of rows in the grid

  generateNoiseGrid();
}

function generateNoiseGrid() {
  for (let y = 0; y < rows; y++) {
    noiseGrid[y] = [];
    for (let x = 0; x < cols; x++) {
      // Calculate Perlin noise value for each coordinate
      noiseGrid[y][x] = noise(x * scl, y * scl);
    }
  }
    let dump_map = noiseGrid.map((inner_arr)=>{return '[' + inner_arr.join(',') + ']'; })
    document.body.innerText  = '[' + dump_map.join(',') + ']';
}
