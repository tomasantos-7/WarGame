class Engine {

    passed = false;
    lumberCampAI = 0;
    quarryAI = 0;
    bankAI = 0;
    barracksAI = 0;
    castle_x = 0;
    castle_y = 0;

    underSiege = {
        'x': 0,
        'y': 0,
    }

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
                    drawBuildings(x, y);
                    this.saveCells(x, y);
                }
                break;
            case 1:
                if (this.quarryAI < 3 && ai.amount_food >= 10 && ai.amount_wood >= 10) {
                    placeBuildings('quarryAI', x, y, 1, 2, 2, 'Quarry1', false);
                    this.quarryAI++;
                    drawBuildings(x, y);
                    this.saveCells(x, y);
                }
                break;
            case 2:
                if (this.bankAI < 2 && ai.amount_wood >= 20 && ai.amount_stone >= 20) {
                    placeBuildings('bankAI', x, y, 2, 2, 2, 'Bank1', false);
                    this.bankAI++;
                    drawBuildings(x, y);
                    this.saveCells(x, y);
                }
                break;
            case 3:
                if (this.barracksAI < 3 && ai.amount_food >= 10 && ai.amount_stone >= 15) {
                    placeBuildings('barracksAI', x, y, 1, 2, 2, 'Barracks1', false);
                    this.barracksAI++;
                    drawBuildings(x, y);
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
                        this.castle_x = x;
                        this.castle_y = y;
                        drawBuildings(x, y);
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
        if (this.barracksAI > 0 && ai.amount_soldier < 4 && !ai.isPlayer) {
            if (ai.amount_food >= 10 && ai.amount_gold >= 10) {
                let unit = new Unit();
                unit.type = "einfantry";
                let x = this.castle_x + (Math.random() * (10 - 5) + 5);
                let y = this.castle_y + (Math.random() * (10 - 5) + 5);
                unit.x = Math.floor(x * CELL_WIDTH);
                unit.y = Math.floor(y * CELL_HEIGHT);
                unit.isPlayer = false;
                ai.amount_food -= 10;
                ai.amount_gold -= 10;
                ai.amount_soldier++;
                ai.isPlayer = false;

                unit.sprite = document.getElementById("eInfantry1");
                console.log(unit);
                units.push(unit);
                drawUnits();
            }
        }
    }

    move() {

        if (this.underSiege.x != 0 && this.underSiege.y != 0) {
            for (let i = 0; i < units.length; i++) {
                let unit = units[i];
                //this condition makes sure that the only units that moves with this function is the AI´s unit and the player´s dont
                if (!unit.isPlayer) {
                    //coords in grid
                    unit.cell_x = this.underSiege.x;
                    unit.cell_y = this.underSiege.y;
                    //coords in pixels
                    unit.target_x = this.underSiege.x * CELL_WIDTH;
                    unit.target_y = this.underSiege.y * CELL_HEIGHT;
                    console.log('move');
                    inMovement = true;
                    unit.updateCell(this.underSiege.x, this.underSiege.y);
                }
            }
        }
    }
}