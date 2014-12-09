(function() {


    var my_map = new GameMap(10, 10),
        canvas_map = document.getElementById("canvas_map"),
        ctx_map = canvas_map.getContext("2d"),

        canvas_view = document.getElementById("viewport"),
        ctx_view = canvas_view.getContext("2d");
    game_cols = my_map.width,
    game_rows = my_map.height,
    map_scalex = canvas_map.width / game_cols,
    map_scaley = canvas_map.height / game_rows,
    view_scalex = canvas_view.width / game_cols,
    view_scaley = canvas_view.height / game_rows,
    //How many tiles should we show?
    viewport_width = 3,
    viewport_height = 3, //This is 3 adjusted to count from 0
    player = {

        x: Math.floor(clamp(Math.random() * my_map.width, 0, my_map.width)),
        y: Math.floor(clamp(Math.random() * my_map.height, 0, my_map.height))

    };
    ping.maze.GenerateMaze(my_map);

    ctx_map.translate(0.5, 0.5);
    ctx_view.translate(0.5, 0.5);

    ping.Lib.initInput();

    function clearView() {
        ctx_view.beginPath();
        ctx_view.clearAll();
        ctx_view.closePath();
    }


    function renderCamera(ctx, grid, my_player, v_width, v_height) {
        /**

            if the player is on the left side ( y 0 ), show the player
            on the left side of the panel.

            if the player is at the top, put them on the top line of
            the view

            if player is on the right side (max y), show player on left
            side of view

            if player is on the bottom, put player on bottom.
        */

        var view = {
                width: ctx.canvas.width, //max x
                height: ctx.canvas.height, //max y
            },
            //search box;
            sbox = {
                x:clamp(0, my_player.x - 1, grid.width - 2),
                y:clamp(0, my_player.y -1, grid.height - 2),
                width:3,
                height:3
            },
            tile_dims = {
                width: view.width / 3,
                height: view.height / 3,

            };

        if (sbox.x + sbox.width > grid.width) {
            //given something like x9 + w3 == 12x or 2 more then what
            // is possible. pull the search box to the left until it fits
            sbox.x = sbox.x - ((sbox.x + sbox.width) - grid.width)
        }
        if (sbox.y + sbox.height > grid.height) {

            sbox.y = sbox.y - ((sbox.y + sbox.height) - grid.height);
        }



        var tiles = grid.fetchTiles(sbox);




        for (var i = 0; i < tiles.length; i++) {

            //Yank all of the coordinate to the 0,0 origin
            // regardless of their x, y value in the grid.
            view.x = clamp(0, tiles[i].x - sbox.x, grid.width) * tile_dims.width;

            view.y = clamp(0, tiles[i].y - sbox.y, grid.height) * tile_dims.height;

            drawCell(ctx,
                tiles[i],
                tile_dims, //.width, tile_dims.height,
                view);
        }


        var avatar = {x:0,y:0};

            if (player.x >= grid.width-1) {
                avatar.x = 2
            }
            else if (player.x == 0) {
                avatar.x = 0;
            }
            else {
                avatar.x = 1;
            }

            if (player.y >= grid.height-1) {
                avatar.y = 2;
            }
            else if (player.y == 0) {
                avatar.y = 0;
            } else {
                avatar.y = 1;
            }

            avatar.x = (avatar.x * (tile_dims.width)) + (tile_dims.width/2);
            avatar.y = (avatar.y * (tile_dims.height)) + (tile_dims.height/2);

            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = "blue";
            ctx.arc(avatar.x, avatar.y, 12, 0, Math.PI * 2, true );
            ctx.fill();
            ctx.restore();






    }

    function renderMap(ctx, grid, my_player) {
        //Figure out how wide and tall are elements are
        var tile_sx = ctx.canvas.width / grid.width,
            tile_sy = ctx.canvas.height / grid.height,
            px = my_player.x * tile_sx + (tile_sx / 2),
            py = my_player.y * tile_sy + (tile_sy / 2),
            x = clamp(px, 0, ctx.canvas.width - (tile_sx / 2)),
            y = clamp(py, 0, ctx.canvas.height - (tile_sy / 2)),
            start = (Math.PI / 180) * 0,
            end = (Math.PI / 180) * 360;

        ctx.save()
        grid.render(ctx);
        ctx.beginPath();
        ctx.fillStyle = "blue";

        ctx.arc(x, y, 5, start, end);
        ctx.fill();
        ctx.closePath();
        ctx.restore();

    }



    function gameLoop(move_x, move_y) {
        "use strict";

        player.x = clamp(player.x + move_x, 0, my_map.width);
        player.y = clamp(player.y + move_y, 0, my_map.height);

        //redrawView();
        renderCamera(ctx_view, my_map, player);
        renderMap(ctx_map, my_map, player);

        //setTimeout(gameLoop, 150);

    }





    function moveIt(direction) {
        switch (direction) {
            case "east":
                gameLoop(1, 0);
                break;
            case "west":
                gameLoop(-1, 0);
                break;
            case "north":
                gameLoop(0, -1);
                break;
            case "south":
                gameLoop(0, 1);
                break;
            default:
                alert("I don't know " + $(this).val)
        }
    }

    var intervalId;
    $("#controls button").mousedown(function(evt) {
        var dir = $(this).val();
        intervalId = setInterval(function() {
            moveIt(dir);
        }, 100);
    })

    $("#controls button").mouseup(function() {
        clearInterval(intervalId);
    })

    $("#canvas_map").height($("#canvas_map").width * 2.03);
    $("#viewport").height($("#viewport").width * 2.03);
    my_map.render(ctx_map);
    gameLoop(0, 0);

})();
