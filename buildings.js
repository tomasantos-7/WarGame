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
    isDestroyed = false;
    isPlayer = true;

    placeOnMap() {

        for (let x = this.x; x < this.x + this.width; x++)
            for (let y = this.y; y < this.y + this.height; y++) {
                map[x][y].type = 'occupied';
                map[x][y].bType = this.type;
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
    }

    isInsideBuildZone(x, y) {

        if (x <= 20 && y <= 15) {
            return true;
        } else {
            return false;
        }
    }
}