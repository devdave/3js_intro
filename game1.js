




clamp = ping.m.clamp;

/**
GameTile doesn't know the size of the canvas
it's going to be so instead it knows what position it
is on a grid.
*/
GameTile = function(col, row, parent, fillStyle, index) {

    this.x = col;
    this.y = row;

    this.sx = 1;
    this.sy = 1;
    this.fillStyle = fillStyle;

    this.parent = parent;
    this.index = index;

    this.walls = [1,1,1,1];

    this.neighbors = null;

    this.geo_row = [
        {x: 0, y: -1},
        {x: 0, y: 1},
        {x: 1, y: 0},
        {x: -1, y: 0}
    ]
}

GameTile.NORTH = 0;
GameTile.SOUTH = 1;
GameTile.EAST  = 2;
GameTile.WEST  = 3;

GameTile.prototype = {
    constructor:GameTile
    , get northWall (){
        return this.walls[GameTile.NORTH];
    }
    , get southWall (){
        return this.walls[GameTile.SOUTH];
    }
    , get westWall () {
        return this.walls[GameTile.WEST];
    }
    , get eastWall () {
        return this.walls[GameTile.EAST];sssssssssssss
    }
    , get wallCount () {
        return this.walls.reduce(function(a,b){ return a + b});
    }
    , DIR2NAME: ['North','South','East','West']

    , render: function(ctx, scale_x, scale_y) {
                "use strict";
                var x = this.x * scale_x,
                    y = this.y * scale_y;

                ctx.rect(x, y, scale_x, scale_y);
            }
    , findNeighbors:
        function(ignoreWalls) {
            "use strict";
            var found = {count:0},
                delta,
                index,
                my_list = [],
                //NSEW
                oppositeDir = [
                    GameTile.SOUTH,
                    GameTile.NORTH,
                    GameTile.WEST,
                    GameTile.EAST
                ],
                testCell;


            for(var dir = 0; dir < this.walls.length; dir ++){
                //Don't add if there's a wall there
                if (this.walls[dir] == 1 && ignoreWalls != true) continue;
                //Stop if this isn't a nsew value

                //Get the delta/coord direction to look for

                delta = this.geo_row[dir];
                //If the new delta coord is greater then the grid, skip
                if (this.x + delta.x > this.parent.cols) continue;
                if (this.y + delta.y > this.parent.rows) continue;


                index = ping.Math.c2i(this.x + delta.x,
                                      this.y + delta.y,
                                      this.parent.width,
                                      this.parent.height );

                //One last sanity check
                if (index > this.parent.elements.length-1 || index < 0) {
                    continue;
                }
                var testCell = this.parent.elements[index];
                if (testCell == undefined) {
                    console.log("How did we get here?")
                    debugger;
                    continue;
                }
                found[dir] = testCell;

                found.count += 1;
                //Push the nsew value to my_list to
                //make it easier for other logic to iterate through it
                my_list.push(dir)


            }
            found['list'] = my_list;
            //Don't cache if we're ignoring walls!
            this.neighbors = found;

            return found;

        }
        , go:
        function(dir) {
            var delta;

            if (this.geo_rose[dir] == undefined){
                throw ping.Exception("I don't know how to go " + dir);
            }

            delta = this.geo_rose[dir];
            index = ping.Math.c2i(this.x + delta.x, this.y + delta.y );

            return this.parent.elements[index] || false;
        }
}


GameMap = function(max_width, max_height) {
    "use strict";

    this.width = max_width;
    this.height = max_height;
    this.grid = ping.q.Factory(this.width, this.height);
    this.elements = [];

    var row, col, myColor, debug, index = 0;

    for(col = 0; col < this.width; col++){
        for (row = 0; row < this.height; row++) {

            myColor = ((col + row) % 2 == 0)
                        ? "white" :
                        "lightgray";

            var tile = new GameTile(col, row, this, myColor, index);
            this.grid.insert(tile);
            this.elements.push(tile);
            index += 1
        }
    }
    for(var i = 0; i < this.elements.length; i++){
        this.elements[i].findNeighbors();
    }
    //debug = this.grid.getAll();
    //console.log(this.height * this.width, debug.length, debug.length == this.height * this.width);
}

/**
    width and height start at 1
    1x1 pixel @ origin would be 0,0,1,1
*/
GameMap.prototype.fetchTiles = function(box) {
    var x = Math.floor(box.x),
        y = Math.floor(box.y),
        width = Math.max(1, box['width'] || 1),
        height = Math.max(1, box['height'] || 1),
        cells = [],
        px = x, py = y,
        mx = x + width, my = y + height,
        coord;

    if ([x,y].indexOf(undefined) != -1) {
        throw new Error("Require (x,y) values to be provided, got " + [x,y] );
    }


    //@TODO this can be optimized by grabbing the low/high integer
    // values per row ahead of time.
    for(var px = x; px < mx; px ++) {
        for(var py = y; py < my; py++) {
            coord = ping.Math.c2i(px,py, this.width, this.height );
            if (coord < this.elements.length) {
                cells.push(this.elements[coord]);
            }
        }
    }
    return cells;
}


GameMap.prototype.render = function(ctx, offsetx, offsety, limit_x, limit_y) {
    "use strict";
    var scale = {
            width: ctx.canvas.width / this.width,
            height: ctx.canvas.height / this.height,
        },
        offsetx = offsetx || 0,
        offsety = offsety || 0,
        limit_x = limit_x || this.width,
        limit_y = limit_y || this.height,
        search_box = {x:offsetx, y:offsety, sx:limit_x, sy: limit_y},
        my_elements, debug_element;

        if (arguments.length == 1) {
            my_elements = this.elements;
        } else {
            my_elements = this.grid.findBox(search_box);
            debug_element = this.grid.getAll();
            console.log("found", my_elements.length);
        }



    for( var i = 0; i < my_elements.length; i++) {
        ctx.beginPath();
        drawCell(ctx, my_elements[i], scale);
        ctx.closePath;
    }

}

/**
*Draw the sides of a cell
*
* @param {nsIDOMCanvasRenderingContext2D} ctx target to draw too
* @param {GameTile} cell
* @param {number} cell.x start of cell
* @param {number} cell.y start of cell
* @param {number} cell.width
* @param {number} cell.height
* @param {boolean} cell.east has east wall
* @param {boolean} cell.w
* @param {boolean} cell.n
* @param {boolean} cell.s
  @param {number} scale_x How much to scale the tile
  @param {number scale_y How much to scale the tile
  @param {Object} adj
  @param {number} adj.x The real x coord
  @param {number} adj.y The real y coord
*/
function drawCell(ctx, cell, tile_scale, override_origin) {
    "use strict";

    var scale = {
            width: Math.floor(tile_scale.width),
            height: Math.floor(tile_scale.height)
        },
        dirs = ['e','w','n','s'],
        t,p,dir, origin = {x:0,y:0};

    if (arguments.length > 3) {
        origin = override_origin
        if ([origin.x, origin.y].indexOf(undefined) != -1) {
            throw new Error("Expected adj_origin to have x,y set got " + [origin.x, origin.y]);
        }
    } else{
        origin.x = Math.floor(cell.x * scale.width);
        origin.y = Math.floor(cell.y * scale.height);
    }


    ctx.save();
    ctx.beginPath();

    ctx.fillStyle = cell.fillStyle;
    ctx.fillRect(origin.x, origin.y, scale.width, scale.height);
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    //Shifting off makes the lines "crisper"
    //ctx.translate(0.5,0.5);

    for(var dir = 0; dir < cell.walls.length; dir++){
        if (cell.walls[dir] != 1) continue;

        ctx.beginPath();


        switch (dir) {
            case GameTile.NORTH:
                //origin to far upper right
                ctx.moveTo(
                    origin.x,
                    origin.y
                );
                ctx.lineTo(
                    origin.x + scale.width,
                    origin.y
                );
                break;
            case GameTile.SOUTH:
                //bottom left to bottom right
                ctx.moveTo(
                    origin.x,
                    origin.y + scale.height
                );
                ctx.lineTo(
                    origin.x + scale.width,
                    origin.y + scale.height );
                break;
            case GameTile.WEST:
                //origin to bottom left
                ctx.moveTo(
                    origin.x,
                    origin.y
                );
                ctx.lineTo(
                    origin.x,
                    origin.y + scale.height
                );
                break;
            case GameTile.EAST:
                //far right to bottom right
                ctx.moveTo(
                    origin.x + scale.width,
                    origin.y
                );
                ctx.lineTo(
                    origin.x + scale.width,
                    origin.y + scale.height
                );
                break;
        }


        ctx.closePath();
        ctx.stroke();
    }
    ctx.closePath();
    ctx.restore();

}
