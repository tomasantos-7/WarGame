function draw(){
  const canvas = document.getElementById("canvas1");

// CANVAS SETUP E DESENHO DO GRID

  if (canvas.getContext) {
    const ctx = canvas.getContext("2d");

    for (let x = 0; x < 1600; x+=100) {
      for (let y = 0; y < 800; y+=100) {

        ctx.strokeRect(x, y, 200, 200);
        ctx.font = "20px serif";
        ctx.fillText(x, x, y);

        

      }
    }
    //Teste, Icons no grid
    const img = new Image();
    img.addEventListener("load", () =>{
        ctx.drawImage(img, 110, 125, 80, 60);
    });
    img.src = "assets/mountains.png";
  }
}

window.addEventListener("load", draw);
