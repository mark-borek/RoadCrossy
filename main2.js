/*MARK BOREK
2019
ROAD CROSSY
*/

'use strict'; 

//   GLOBALS ==========================================================================//
var scene, renderer, player, camera;
//array that holds the assignments of either road or grass -- necessary for generating them later
var lanes = [];
// variable to that is created when the playerObject function is run. Allows for the players position to be used by other functions
var player;
// true when the player movement is complete and false when its incomplete
var done = true; 
// Because the vehicle collision function is run when each frame is rendered a global is needed to determine each time the player collides with a car
var hitCount = 0;
// Array that holds all the vehicles and to be used to in the collisionVehicle function to test for collisions between the player and vehicles
var collidableVehicle = [];
// Array which holds all of the truck objects and will be used to animate the trucks 
var trucksArray = [];
// Array which holds all of the car objects and will be used to animate the cars  
var carsArray = [];
//colors for the vehicles
var vehicleColors = ['red','blue','lightgreen','yellow','black'];
// Array for the trees
var treeMatrix = [];




function main(){
    
    //var stats = initStats();
    var carsArray = [];
    //creates the scene and gives it a skyblue background
    scene = new THREE.Scene();
    scene.background =  new THREE.Color('green');
    
    //renders the scene in the browser
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;
    document.body.appendChild(renderer.domElement);
    
    //creates the camera and sets its initial placement
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0,300, -310);
    camera.rotation.set(60*Math.PI/180, -180*Math.PI/180, 0);
    camera.updateProjectionMatrix();
    
    // light sources
    var light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(-100, -100, 200);
    light.castShadow = true;
    //light.shadowDarkness = 0.75;
    scene.add(light);
    
    var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    scene.add(hemiLight);
    
    var backLight = new THREE.DirectionalLight(0xffffff, .75);
    backLight.position.set(200, 200,0);
    backLight.castShadow = true;
    scene.add(backLight);
    
    // score display
    var score = document.createElement('div');
    score.style.position = 'absolute';
    score.style.width = 7+'%';//100 + 'px';
    score.style.height = 7+'%';//50 + 'px';
    score.style.backgroundColor = "white";
    score.style.top = 0 + '%';
    score.style.left = 2 + '%';
    score.style.fontSize = 300 + '%';
    score.style.fontFamily = 'Sans-serif';
    document.body.appendChild(score);      
    
    
    
    //function that is used to generate an array with road and grass randomly assigned. It is used later in when the road and grass are actually created. 
    function generateLaneArray(size){
        for(let x= 0; x < size; x++){
            if((Math.floor((Math.random() * 2) + 1)) === 1)
                lanes[x] = 'road';
            else
                lanes[x] = 'grass';
        }
        return lanes;
    }
    
     //function that uses the lanes[] to call the grass() and road() functions, which are placed in the scene
   function lane(){
       let count = 0;
        lanes.forEach(function(x){
            if(x === 'road'){
                let stripOfRoad = new road(count);
                count++;
            }
            else{
               let stripOfGrass = new grass(count);
                count++;
            }
        });
        
 }   
    
    
    generateLaneArray(800);  
    lane();
    playerObject();
    carAnimate();
    truckAnimate();

    
    function animate(){
        requestAnimationFrame(animate);
        TWEEN.update();
        //stats.update();
        setUpKeyControls();
        score.innerHTML = `${Math.floor(player.position.z / 80) + 2}`;
        renderer.render(scene, camera);
        runOver();
        
    }
    animate();
    
}

    //function that generates a strip of road and either one or 2 trucks for that lane 
   class road{
       
       constructor(x){
           //playable road 
            const highway = new THREE.Mesh(
                new THREE.BoxGeometry(800,1,80,1),
                new THREE.MeshPhongMaterial({color: 'gray'})
            );        

           //out of bounds road
            const bound = new THREE.Mesh(
                new THREE.BoxGeometry(2300,1,80,1),
                new THREE.MeshPhongMaterial({color: 'darkgrey'})
            );       

            var vehicleRand = Math.floor((Math.random() * 10) + 1);
            let  i = 0;
            if(vehicleRand % 2 === 0){
                trucksArray.push(this.truck((Math.random()*900)+1,x*80));
                i++;
            }
            else{
                carsArray.push(this.car((Math.random()*900)+1,x*80));
                i++;
            }

            bound.position.set(0,-1,x*80);
            highway.position.set(0,0,x*80);
            scene.add(bound);
            scene.add(highway);
           }
       
        //function to create the wheels of cars or trucks 
        truckWheel() {
                const t_wheel = new THREE.Mesh( 
                new THREE.BoxGeometry( 24, 24, 56), 
                new THREE.MeshLambertMaterial( { color: 0x333333, flatShading: true } ) 
                );
                return t_wheel;
            }

        carWheel() {
                const c_wheel = new THREE.Mesh( 
                new THREE.BoxGeometry( 20, 20, 15), 
                new THREE.MeshLambertMaterial( { color: 0x333333, flatShading: true } ) 
                );
                return c_wheel;
            }



        //function to create a truck    
        truck(x,z) {
            const trucker = new THREE.Group();
            const color = vehicleColors[Math.floor(Math.random() * vehicleColors.length)];


            const base = new THREE.Mesh(
                new THREE.BoxGeometry( 200, 10, 40 ), 
                new THREE.MeshLambertMaterial( { color: 0xb4c6fc, flatShading: true } )
            );
            base.position.z = 20;
            collidableVehicle.push(base);
            trucker.add(base);

            const cargo = new THREE.Mesh(
              new THREE.BoxGeometry( 150, 80, 60 ), 
              new THREE.MeshPhongMaterial( { color: 0xb4c6fc, flatShading: true } )
            );

            cargo.position.set(30,30,20);
              cargo.castShadow = true;
            cargo.receiveShadow = true;
            collidableVehicle.push(cargo);
            trucker.add(cargo);

            const cabin = new THREE.Mesh(
              new THREE.BoxGeometry( 50, 60, 50 ), 
              [
                new THREE.MeshPhongMaterial( { color, flatShading: true } ), // back
                new THREE.MeshPhongMaterial( { color, flatShading: true}) ,
                new THREE.MeshPhongMaterial( { color, flatShading: true } ),
                new THREE.MeshPhongMaterial( { color, flatShading: true } ),
                new THREE.MeshPhongMaterial( { color, flatShading: true } ), // top
                new THREE.MeshPhongMaterial( { color, flatShading: true } ) // bottom
              ]
            );
            cabin.position.set(-80,20,20); 
            collidableVehicle.push(cabin);
            trucker.add(cabin);


            const frontWheel = this.truckWheel();
            frontWheel.position.set(-76,-20,20);
            collidableVehicle.push(frontWheel);
            trucker.add(frontWheel);

            const middleWheel = this.truckWheel();
            middleWheel.position.set(-20,-20,20);
            collidableVehicle.push(middleWheel);
            trucker.add(middleWheel);

            const backWheel = this.truckWheel();
            backWheel.position.set(60,-20,20);
            collidableVehicle.push(backWheel);
            trucker.add(backWheel);


            trucker.position.set(x,20,z);
            

            scene.add(trucker);


            return trucker;

          } 

            //function that creates car
        car(x,z) {
              const car = new THREE.Group();
              const color = vehicleColors[Math.floor(Math.random() * vehicleColors.length)];

              const frame = new THREE.Mesh(
                new THREE.BoxBufferGeometry(100,20,50 ), 
                new THREE.MeshPhongMaterial( { color, flatShading: true } )
              );
              frame.position.y = 10;
              frame.castShadow = true;
              frame.receiveShadow = true;
              collidableVehicle.push(frame);
              car.add(frame);

              const cabin = new THREE.Mesh(
                new THREE.BoxBufferGeometry( 60, 24, 35), 
                [
                  new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true}),
                  new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true}),
                  new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true}),
                  new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true}),
                  new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true } ), // top
                  new THREE.MeshPhongMaterial( { color: 0xcccccc, flatShading: true } ) // bottom
                ]
              );

              cabin.position.set(-10,20,0);
              //cabin.castShadow = true;
              //cabin.receiveShadow = true;
              collidableVehicle.push(cabin);
              car.add( cabin );

              const backLeftWheel = this.carWheel();
              backLeftWheel.position.set(-36,5,-20);
              car.add( backLeftWheel );

              const backRightWheel = this.carWheel();
              backRightWheel.position.set(-36,5,20);
              car.add(backRightWheel);

              const frontLeftWheel = this.carWheel();
              frontLeftWheel.position.set(36, 5, -20);
                //collidableVehicle.push(frontLeftWheel);
              car.add( frontLeftWheel );

              const frontRightWheel = this.carWheel();
              frontRightWheel.position.set(36, 5, 20);
                //collidableVehicle.push(frontRightWheel);
              car.add( frontRightWheel );

              //car.castShadow = true;
              //car.receiveShadow = false;

              car.position.set(x,20,z);
                //collidableVehicle.push(car);
              scene.add(car);

              return car;  
            }
       
       
    }
    
    //generates a strip of grass with trees 
   class grass{
       
       
       constructor(x){
               const green = new THREE.Mesh(
                 new THREE.BoxGeometry(800,10,80,1), 
                 new THREE.MeshLambertMaterial({color: 'green'})
            );

            const out = new THREE.Mesh(
                new THREE.BoxGeometry(2000,10,80,1),
                new THREE.MeshLambertMaterial({color: 'darkgreen'})
            );

            //number of trees in one strip
            var treeCount = Math.floor((Math.random() * 3) + 1);
           //number of trees total
            var treeNumber = 0;
            treeMatrix[x] = [];
            let innerArray = [];

            for(treeCount; treeCount >0; treeCount--){

                var treeGrid =Math.floor((Math.random()*8) + 1);
                if(treeCount % 3 ==0){
                   innerArray.push(this.tree((400 - treeGrid*100),x*80)); 
                }
                else{
                   innerArray.push(this.tree((-400 + treeGrid*100),x*80));
                } 

            }
            treeMatrix[x].push(innerArray);

            green.position.set(0,0,x*80);
            out.position.set(0,-1,x*80);
            scene.add(out);
            scene.add(green);
       }
       // function that creates trees -- made up of a trunk and a leaf
       tree(x,z){
                const treeMesh = new THREE.Group();

                const trunk = new THREE.Mesh(
                    new THREE.CubeGeometry(25,60,25),
                    new THREE.MeshLambertMaterial({color: 0x9A6169})
                ); 
                trunk.position.set(x,10, z);
                trunk.castShadow = true;
                trunk.receiveShadow = true;
                treeMesh.add(trunk);

                const leaf = new THREE.Mesh(
                    new THREE.CubeGeometry(50,50,50,2,2,2),
                     new THREE.MeshLambertMaterial({wireframe: false, color: 'lightgreen'})
                );
                leaf.position.set(x,50,z);
                leaf.castShadow = true;
                leaf.receiveShadow = true;
                treeMesh.add(leaf);

                const cage = new THREE.Mesh(
                    new THREE.CubeGeometry(70,80,70,5,5,5),
                    new THREE.MeshLambertMaterial({wireframe: true, visible:false})
                );
                cage.position.set(x,50,z);
                treeMesh.add(cage);
                scene.add(cage);

                scene.add(treeMesh);
                return cage;

            }
        
   }


        
        //animation loop for the trucks
    function truckAnimate(){

           function truckTween(x,time){
                    var start = {x: 800}; 
                    var end =   {x: -800};
                    var truckForward = new TWEEN.Tween(start)
                    .to(end,time)
                    .repeat(Infinity)
                    .start();

                truckForward.onUpdate(function(){
                    trucksArray[x].position.x = start.x;
                }); 
            }

            for(let i = 0; i < trucksArray.length; i++){    
                var rand = Math.floor(Math.random()*(8000-5000+1)+5000);
                truckTween(i, rand);

            }
        }
    // animation loop for the cars    
    function  carAnimate(){
      
            function carTween(x,time){
                    var start = {x: -800}; 
                    var end =   {x: 800};
                    var carForward = new TWEEN.Tween(start)
                    .to(end,time)
                    .repeat(Infinity)
                    .start();

                carForward.onUpdate(function(){
                    carsArray[x].position.x = start.x;
                }); 
            }

            for(let i = 0; i < carsArray.length; i++){    
                var rand = Math.floor(Math.random()*(5000-1000+1)+1000);
                carTween(i, rand);

            }


        }

    
    //function that creates the character the player 
    function playerObject(){
            
                var textureLoader = new THREE.TextureLoader();
                
                player = new  THREE.Mesh(
                    new THREE.BoxGeometry(30,30,50,50,50,50),
                    //new THREE.MeshLambertMaterial({visible : true, color: 'gray', wireframe: true})
                    new THREE.MeshLambertMaterial({map: textureLoader.load('cow.jpg')})
                );   
        
        
                player.position.set(0,20,-160);
                player.name = 'player';
                player.castShadow = true;
                player.receiveShadow = true;
                scene.add(player);
                return player;
    }
    
    // player movement animation functions below (right, left, up, and back)
    function right(){
                var playerPosition = new THREE.Vector3();
                playerPosition.setFromMatrixPosition(player.matrixWorld);

                var start = {x:playerPosition.x, y:0, z:playerPosition.z};
                var end = {x : (playerPosition.x-80), y:0, z:playerPosition.z};
                var tweenR = new TWEEN.Tween(start)
                .to(end, 150)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();

                var bool = false;
                done = false;

                tweenR.onUpdate(function(){
                    let z = start.z / 80;        
                    if(z >= 0){
                            if(lanes[z] === 'grass'){
                                for(let i = 0; i < treeMatrix[z][0].length; i++){
                                    if(Math.abs(end.x - treeMatrix[z][0][i].position.x) < 50){
                                        tweenR.stop();
                                        bool = true;
                                        done = true;
                                    }

                                } 
                                if(!bool){
                                    player.position.x = start.x; 
                                }
                            }
                            else{
                                player.position.x = start.x;
                            }
                        }
                        else{
                            player.position.x = start.x;
                        }


                });

                tweenR.onComplete(function(){
                    done = true;
                });
             

            }



    function left(){
                let playerPosition = new THREE.Vector3();
                playerPosition.setFromMatrixPosition(player.matrixWorld);


                let start = {x:playerPosition.x, y:0, z:playerPosition.z};
                let end = {x : (playerPosition.x+80), y:10, z:playerPosition.z};
                //let end = {x : fakePosition.x, y: 0, z :0};
                let tweenL = new TWEEN.Tween(start)
                .to(end, 150)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();

                var bool = false;
                done = false;

                tweenL.onUpdate(function(){
                    let z = start.z / 80;
                     if(z >= 0){
                         if(lanes[z] === 'grass'){
                            for(let i = 0; i < treeMatrix[z][0].length; i++){
                                if(Math.abs(end.x - treeMatrix[z][0][i].position.x) < 50){
                                    tweenL.stop();
                                    bool = true;
                                    done = true;
                                }

                            } 
                            if(!bool){
                                player.position.x = start.x; 
                            }
                        }
                        else{
                            player.position.x = start.x;
                        }

                     }
                     else{
                         player.position.x = start.x;
                     }

                });

               tweenL.onComplete(function(){
                   done = true;
               });
            }

    function up(){
                var playerPosition = new THREE.Vector3();
                playerPosition.setFromMatrixPosition(player.matrixWorld);

                var camStart = {x:0, y:300, z:(playerPosition.z - 200)};
                var camEnd = {x :0, y:300, z:(playerPosition.z - 180)};
                var tweenCam = new TWEEN.Tween(camStart)
                .to(camEnd, 2000)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();

                var start = {x:playerPosition.x, y:0, z:playerPosition.z};
                var end = {x :playerPosition.x, y:0, z:(playerPosition.z + 80)};
                var tweenUp = new TWEEN.Tween(start)
                .to(end, 150)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();

                var bool = false;
                done = false;
                let camStop = 0;


                tweenUp.onUpdate(function(){
                    let z = end.z / 80;
                    if(z >= 0){
                        if(lanes[z] === 'grass'){
                            for(let i = 0; i < treeMatrix[z][0].length; i++){
                                if(Math.abs(end.x - treeMatrix[z][0][i].position.x) < 50){
                                    tweenUp.stop();
                                    //tweenCam.stop();
                                    bool = true;
                                    done = true;
                                }

                            } 
                            if(!bool){
                                player.position.z = start.z; 
                            }
                        }
                        else{
                            player.position.z = start.z;
                        }
                    }
                    else{
                       player.position.z = start.z;
                    }            
                });

                 tweenCam.onUpdate(function(){
                        camera.position.z = camStart.z; 
                });

                tweenUp.onComplete(function(){
                    done = true;
                });

            }

    function  back(){
                var playerPosition = new THREE.Vector3();
                playerPosition.setFromMatrixPosition(player.matrixWorld);


                var start = {x:playerPosition.x, y:0, z:playerPosition.z};
                var end = {x :playerPosition.x, y:0, z:(playerPosition.z - 80)};
                var tweenBack = new TWEEN.Tween(start)
                .to(end,150)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();

                var camStart = {x:0, y:300, z:(playerPosition.z - 180)};
                var camEnd = {x :0, y:300, z:(playerPosition.z - 200)};
                var tweenCamera = new TWEEN.Tween(camStart)
                .to(camEnd, 5000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();

                var bool = false;
                done = false;

                tweenBack.onUpdate(function(){
                        let z = end.z / 80;
                         if(z >= 0){
                             if(lanes[z] === 'grass'){
                                for(let i = 0; i < treeMatrix[z][0].length; i++){
                                    if(Math.abs(end.x - treeMatrix[z][0][i].position.x) < 50){
                                        tweenBack.stop();
                                        bool = true;
                                        done = true;
                                    }

                                } 
                                if(!bool){
                                    player.position.z = start.z; 
                                }
                            }
                            else{
                                player.position.z = start.z;
                            }
                         }
                        else{
                                player.position.z = start.z;
                        }           
                });

                tweenCamera.onUpdate(function(){
                    //if(!bool){
                        camera.position.z = camStart.z;
                    //}
                });

                tweenBack.onComplete(function(){
                    done = true;
                });



            }

    //function which tests for collisions between the player object and vehicles (which are contained in the collidableVehicle array)
    function collisionVehicle(){
            for(var vertexIndex = 0; vertexIndex < player.geometry.vertices.length; vertexIndex++){
                    var localVertex = player.geometry.vertices[vertexIndex].clone();
                    var globalVertex = localVertex.applyMatrix4(player.matrix);
                    var directionVector = globalVertex.sub(player.position);

                    var ray = new THREE.Raycaster(player.position, directionVector.clone().normalize() );
                    var collisionResults = ray.intersectObjects(collidableVehicle);
                    if(collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()){

                        return true;
                    }
                        return false;
                }
        }
    
    // sets up the key controls for the player movement using the arrow keys
    function setUpKeyControls(){
                    var bool;
                    document.onkeyup = function(e){                   
                           if(player.position.x == 320){
                                switch(e.keyCode){
                             //up arrow
                             case 38:
                                    up();
                                    break;  

                            //right arrow
                            case 39:
                                right();
                                break;
                            //down arrow
                            case 40:       
                                back();
                                break;

                            }
                           }
                        else if(player.position.x == -320){
                              switch(e.keyCode){
                            //left arrow                        
                            case 37:     
                                left();
                                break;
                            //up arrow
                            case 38:
                                up();
                                break;  

                            //down arrow
                            case 40:
                                back();
                                break;
                            }
                        }
                        else if((player.position.x < 320 && player.position.x > -320) || (player.position.x ==0))  {

                        switch (e.keyCode){
                               //left arrow                        
                            case 37:
                                if(done)
                                    left();
                                break;
                            //up arrow
                            case 38:
                                if(done)
                                    up();
                                break;

                            //right arrow
                            case 39:
                                if(done)
                                    right();
                                break;
                            //down arrow
                            case 40:
                                if(done)
                                    back();
                                break;
                            }

                        } 


                    }
                }

    // function which displays an alert when the player object has collided with a car/truck object
    // uses the hisCount variable to display this alert only once and then reloads the page
    function  runOver(){
                if(collisionVehicle()){
                    hitCount++;
                }
                if(hitCount == 1){
                   setTimeout(function(){
                       console.log(Math.floor(player.position.z / 80));
                       alert("MOOOOOOVE OUT OF THE WAY A LITTLE QUICKER NEXT TIME. YOU'RE SCORE WAS " + (Math.floor(player.position.z / 80)+2));
                       location.reload();
                   }, 20);

                }  

            }
    // function which displays the fps statistics -- not used in final version
    function initStats(type){
        var panelType = (typeof type !== 'undefined' && type) && (!isNaN(type)) ? parseInt(type) : 0;
        var stats = new Stats();
        
        stats.showPanel(panelType);
        document.body.appendChild(stats.dom);
        
        return stats;
        
    }
  

 main();