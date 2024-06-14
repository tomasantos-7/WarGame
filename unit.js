class Unit {
    type = 'infantry';
    sprite = null;
    speed = 100; //speed for 32 px per second
    //current position in pixels
    x = 0;
    y = 0;
    //current cell 
    currentCell_x = Math.floor(this.x / CELL_WIDTH);
    currentCell_y = Math.floor(this.y / CELL_HEIGHT);
    //target position in pixels
    target_x = 0;
    target_y = 0;
    //target cell coords
    cell_x = 0;
    cell_y = 0;
    //status of units
    hp = 200;
    attack_damage = 100;
    currentUnitsinArmy = 0;
    maxPerArmy = 6;
    isDestroyed = false;

    isPlayer = true;

    move(elapsed) {


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
        let x = Math.floor(this.x / CELL_WIDTH);
        let y = Math.floor(this.y / CELL_HEIGHT);
        let cost = map[x][y].cost;
        //calculate the amount of px we will travel with terrain penalties
        let path = pathfinding(map, this.currentCell_x, this.currentCell_y, this.cell_x, this.cell_y);

        for (let i = 0; i < path.length; i++) {
            let path_x = path[i].x / CELL_WIDTH;
            let path_y = path[i].y / CELL_WIDTH;
            this.x += (path_x * normalized_x) / cost;
            this.y += (path_y * normalized_y) / cost;
        }
    }
    //function that updates the variables to the current cell or the target cell
    updateCell(x, y) {
        this.currentCell_x = x;
        this.currentCell_y = y;
        //coords in grid
        this.cell_x = x;
        this.cell_y = y;
        //coords in pixels
        this.target_x = x * CELL_WIDTH;
        this.target_y = y * CELL_HEIGHT;
    }

}