//var camera = new THREE.PerspectiveCamera( 45,
//    window.innerWidth / window.innerHeight,
//    0.1,
//    1000
//);

function GameState() {
    this.width = window.innerWidth,
    this.height = window.innerHeight;
    this.clock = new THREE.Clock();

    this.renderer = new THREE.WebGLRenderer();

    this.renderer.setSize( this.width, this.height );
    document.body.appendChild( this.renderer.domElement );

    this.scene = new THREE.Scene();

    this.scene.add( new THREE.AxisHelper( 500 ) );

    this.loader = new THREE.TGALoader();

    //Actual game map logic now
    this.map = new GameMap(30,30);
    ping.maze.GenerateMaze(this.map);

    this.mini_ctx = document.getElementById("minimap").getContext("2d");




    this.build();

}

GameState.prototype.build = function() {
    this.buildCamera();
    this.drawWireGrid();
    //this.setLight();
    this.setSpotLight()
    this.buildGrid();

    //this.camera.matrix.set.apply(this.camera.matrix,
    //[-0.46561816334724426, 1.5722249058214288e-9, 0.8849857449531555, 0, 0.6066539883613586, 0.7280765771865845, 0.3191792666912079, 0, -0.6443374156951904, 0.6854957938194275, -0.339005708694458, 0, -792.3116455078125, 958.680908203125, -527.8226928710938, 1]
    //);
    //this.camera.position.y = 1750;
    //this.camera.position.x = 900;
    //this.camera.position.z = 900;
    this.control = new THREE.FirstPersonControls(this.camera);
    this.control.movementSpeed = 200;
    this.control.lookSpeed = 0.075;
    this.control.constrainVertical = true;

}



GameState.prototype.buildCamera = function() {
    //this.camera = new THREE.OrthographicCamera(
    //    this.width / - 2,
    //    this.width / 2,
    //    this.height / 2,
    //    this.height / - 2,
    //    .01,
    //    1000 );

    this.camera = new THREE.PerspectiveCamera(
        45,
        this.width / this.height,
        1,
        2000
    );

    this.camera.up = new THREE.Vector3(0,1,0);
    this.camera.position.set(0,100,10);
    this.camera.lookAt(this.scene.position);
    this.scene.add( this.camera );

}

GameState.prototype.setControlls = function(){
    this.controls = new THREE.FirstPersonControls(this.camera, this.renderer.domElement);
}




// grid
GameState.prototype.drawWireGrid = function () {
    var geometry = new THREE.PlaneGeometry( 5000, 5000, 10, 10 );
    var material = new THREE.MeshBasicMaterial(
        {
            wireframe: true,
            opacity: 0.5,
            transparent: true
        }
    );

    this.grid = new THREE.Mesh( geometry, material );
    this.grid.rotation.order = 'YXZ';
    this.grid.rotation.y = - Math.PI / 2;
    this.grid.rotation.x = - Math.PI / 2;
    this.grid.position.z = -1;
    this.scene.add( this.grid );
}


GameState.prototype.setSpotLight = function() {
    this.spotLight = new THREE.SpotLight(
        0xDED718, //Color
        0.8, //intensity
        -10,
        30
    );
    this.spotLight.position.z = 15;
    this.spotLight.position.y = 5;
    this.spotLight.target = this.camera;
    this.camera.add(this.spotLight);
}

GameState.prototype.setLight = function() {
    this.pointLight = new THREE.PointLight(0xDED718, 0.5, -1);
    //this.flashLight = new THREE.SpotLight(0xFFFFFF);

    //// set its position
    //this.pointLight.position.x = 10;
    //this.pointLight.position.y = 50;
    //this.pointLight.position.z = 130;

    //this.flashLight.position = this.camera.position;
    // add to the scene
    this.camera.add(this.pointLight);



}




GameState.prototype.buildGrid = function() {

    var SQUARE_SIZE = 200;

    var floorTexture =
            this.loader.load("textures/katsbits-rock3set4/stone4_e.tga")
        , floorMaterial =
            new THREE.MeshPhongMaterial( { color: 0xffffff, map: floorTexture } )

        , blackMaterial =
        new THREE.MeshLambertMaterial(
            {
                color: 0x000000
            }
        )

        , whiteMaterial =
        new THREE.MeshLambertMaterial(
            {
                color: 0xFFFFFF
            }
        )
        , redMaterial = new THREE.MeshLambertMaterial({color:0xFF0000})
        , greenMaterial = new THREE.MeshLambertMaterial({color:0x006600})
        , northMaterial = new THREE.MeshLambertMaterial({color:0x000066})
        , yellowMaterial = new THREE.MeshLambertMaterial({color:0xFFFF00})

        , geometry = new THREE.BoxGeometry( SQUARE_SIZE, 5, SQUARE_SIZE )
        , northWallGeo = new THREE.BoxGeometry( SQUARE_SIZE, SQUARE_SIZE, 5 )
        , eastWallGeo  = new THREE.BoxGeometry( SQUARE_SIZE, SQUARE_SIZE , 5 )
        , adjustX = 0
        , adjustY = 0
        , northWall, southWall, eastWall, westWall;



        this.gridMap = [];

        for(var pos = 0; pos < this.map.elements.length; pos++){
            var myCell = this.map.elements[pos];

            //@todo add a use texture flag
            if (true) {
                myColor = floorMaterial;
            } else {
                myColor = ((myCell.x + myCell.y) % 2 == 0)
                    ? whiteMaterial
                    : blackMaterial;
            }




            var cube = new THREE.Mesh( geometry, myColor );
            cube.position.set(
                (SQUARE_SIZE * myCell.x) + adjustX,
                1,
                (SQUARE_SIZE * myCell.y) + adjustY

            );

            this.scene.add(cube);
            this.gridMap.push(cube);

            if (myCell.northWall) {
                northWall = new THREE.Mesh( northWallGeo, whiteMaterial);
                northWall.position.set(
                    (SQUARE_SIZE * myCell.x) + adjustX,
                    (SQUARE_SIZE/2),
                    (SQUARE_SIZE * myCell.y) + adjustY - (SQUARE_SIZE/2)
                    );

            }
            if (myCell.southWall) {
                southWall = new THREE.Mesh(northWallGeo, whiteMaterial);
                southWall.position.set(
                    (SQUARE_SIZE * myCell.x) + adjustX,
                    (SQUARE_SIZE/2),
                    (SQUARE_SIZE * myCell.y) + adjustY + (SQUARE_SIZE/2)
                    );

                this.scene.add(southWall);
            }
            if (myCell.eastWall) {
                eastWall = new THREE.Mesh( eastWallGeo, whiteMaterial);
                eastWall.position.set(
                    (SQUARE_SIZE * myCell.x) + (SQUARE_SIZE/2),
                    (SQUARE_SIZE/2),
                    (SQUARE_SIZE * myCell.y)
                    );
                //eastWall.rotation.applyEuler(new THREE.Vector3(1,0,0));
                eastWall.rotation.y = (90 * Math.PI) / 180;
                this.scene.add(eastWall);
                console.log(myCell, myCell.walls);
            }
            if (myCell.westWall) {
                //westWall = new THREE.Mesh( eastWallGeo, greenMaterial);
                //westWall.position.set(
                //    (SQUARE_SIZE * myCell.x) + adjustX + (SQUARE_SIZE/2),
                //    (SQUARE_SIZE/2),
                //    (SQUARE_SIZE * myCell.y) + adjustY - SQUARE_SIZE
                //)
                //westWall.rotation.y = (90 * Math.PI) / 180;
                ////this.scene.add(westWall);
            }




        }

}




//camera.lookAt(grid.position);

function KeyState(){

    this.setup();
}

KeyState.prototype = {
    constructor: KeyState,
    keys:{
        up: false,
        down: false,
        left: false,
        right: false,
        q: false,
        e: false,
        w: false,
        s: false,
        a: false,
        d: false,
        l: false
    },
    state: {
        locked: false
    },
    step:1,

    setup: function(){
        window.addEventListener("keydown", function(evt){
            var myState = true;
            switch(event.keyCode){
                case 37: this.keys.left  = myState; break;
                case 38: this.keys.up    = myState; break;
                case 39: this.keys.right = myState; break;
                case 40: this.keys.down  = myState; break;
                case 65: this.keys.a     = myState; break;
                case 68: this.keys.d     = myState; break;
                case 83: this.keys.s     = myState; break;
                case 87: this.keys.w     = myState; break;
                case 76: this.keys.l     = myState; break;
            }

            if (this.keys.l) {
                this.state.locked = !this.state.locked
            }
        }.bind(this));
        window.addEventListener("keyup", function(evt) {
            var myState = false;
            switch(event.keyCode){
                case 37: this.keys.left  = myState; break;
                case 38: this.keys.up    = myState; break;
                case 39: this.keys.right = myState; break;
                case 40: this.keys.down  = myState; break;
                case 65: this.keys.a     = myState; break;
                case 68: this.keys.d     = myState; break;
                case 83: this.keys.s     = myState; break;
                case 87: this.keys.w     = myState; break;
                case 76: this.keys.l     = myState; break;
            }
        }.bind(this))


    }





}




var kState = new KeyState();
GameState.prototype.render = function() {
    requestAnimationFrame( this.render.bind(this) );
    if (kState.state.locked) {
        return;
    }
    if (typeof this.control != "undefined") {
        var delta = this.clock.getDelta();
        this.control.update(delta); // Move camera
        //@TODO find a better way to lock this
        this.camera.position.y = 100;
    }



    this.renderer.render( this.scene, this.camera );
    //this.adjust();

    document.getElementById("campos").innerHTML =
        JSON.stringify(
            {
                position: this.camera.position
                , rotation: this.camera.rotation
            }, false, 4);

    this.map.render(this.mini_ctx);



}

var myState = new GameState();
//control(myState);
myState.render();
