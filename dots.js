function GameState() {
    this.width = window.innerWidth,
    this.height = window.innerHeight;
    this.clock = new THREE.Clock();

    this.renderer = new THREE.WebGLRenderer();

    this.renderer.setSize( this.width, this.height );
    document.body.appendChild( this.renderer.domElement );

    this.scene = new THREE.Scene();

    //this.scene.add( new THREE.AxisHelper( 500 ) );

    this.camera = new THREE.PerspectiveCamera();


    this.build();

}

GameState.prototype.build = function(){
    this.buildCamera();
    this.buildParticles();
}


GameState.prototype.buildCamera = function(){
    //20 wide by 100 long
    this.camera = new THREE.PerspectiveCamera(
        45,
        this.width / this.height,
        1,
        7000
    );

    this.camera.up = new THREE.Vector3(0,1,0);
    this.camera.position.set(50,500,10);
    //this.camera.rotation.x += 100;

    this.light = new THREE.PointLight(0xDED718, 0.5, -1);
    this.scene.add(this.camera);
    this.scene.add(this.light);
}

GameState.prototype.buildParticles = function() {

    this.pMaterial = new THREE.PointCloudMaterial({
          color: 0x0000FF,
          size: 10,
          map: THREE.ImageUtils.loadTexture(
            "images/particle.png"
          ),
          blending: THREE.AdditiveBlending,
          transparent: true
        });


        //@TODO make this shit a sticky note!
        //+x -> left/right
        //y  -> up/down
        //z  -> forward/back
        // One wall equals
        //19
        //10 columns
        //190 particles?
        //10 walls?
        var particle
        this.particles = new THREE.Geometry();

        var adjustX = -1200;
            adjustY = 500;
            adjustz = 0;
        for(var w = 0; w < 200; w++){
            for (var z = 0; z < 25; z++) {
                for(var x = 0; x < 25; x ++ ){
                    particle = new THREE.Vector3(x*100 + adjustX,
                        z*100 - adjustY,
                        100 * w);
                    this.particles.vertices.push(particle);
                }

            }
        }
        this.particles.computeBoundingSphere();


        // create the particle system
        this.particleSystem = new THREE.ParticleSystem(
            this.particles,
            this.pMaterial);

        this.particleSystem.sortParticles = true;
        this.particleSystem.position.z = -15000;

        //this.particleSystem.scale.x = 0.6;
        // add it to the scene
        this.scene.add(this.particleSystem);

}


    var speed =   .5;
    var mySpeed = speed;
    var blueDir = 0.01;
    var redDir  = 0.01;
    var camReverse = false;
GameState.prototype.render = function(){
    requestAnimationFrame( this.render.bind(this) );
    this.renderer.render(this.scene, this.camera);

    var pCount = this.particles.vertices.length;
    //+x -> left/right
    //y  -> up/down
    //z  -> forward/back
    dir = 'z'




    this.particleSystem.position[dir] += mySpeed;



    if (this.particleSystem.position[dir] > -2000) {
        mySpeed = -mySpeed;
        speed = -.5;
        if (camReverse == false) {
            this.camera.rotation.x = 180 * (Math.PI/180);
            camReverse = true;
        }


        if(this.particleSystem.material.color.g < -4000){
            redDir = 0.01;
        } else if(this.particleSystem.material.color.g > 1) {
            redDir = -0.01;
        }
        this.particleSystem.material.color.g += redDir;

    }
    else if (this.particleSystem.position[dir] < -15000) {
        speed = .5
        mySpeed = -mySpeed;
        if (camReverse === true) {
            this.camera.rotation.x = 0;// * (Math.PI/180);
            camReverse = false;
        }

        if (this.particleSystem.material.color.r < 0) {
            blueDir = 0.01;
        } else if (this.particleSystem.material.color.r > 1) {
            blueDir = -0.01;
        }
        this.particleSystem.material.color.r += blueDir;

    }
    this.camera.rotation.z += .01;

    var tempSpeed = Math.abs(mySpeed + speed);
    if (tempSpeed > 60){
        mySpeed = ((speed < 0 ? -60 : 60));
    } else {
        mySpeed += speed;
    }


    console.log(this.particleSystem.position, mySpeed, speed);


    this.particleSystem.geometry.__dirtyVertices = true;
}
