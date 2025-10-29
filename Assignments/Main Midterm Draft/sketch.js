let wasp;
let xLoc, yLoc, rotation;

let obstacleXLocs = []
let obstacleYLocs = []
let obstacleDs = []

let numObstacles = 20
let crossedObstacle = false;
let pCrossedObstacle = false; 
let font
let count = 0;

let g
let sadImage;
let b

// Simple game state: MENU -> PLAYING -> GAMEOVER

// Player speed control
const PLAYER_SPEED = 6.0;
let gameState = "MENU";

// Velocities for moving obstacles
let obstacleVx = []
let obstacleVy = []

// Timer
let startTime = 0;

// Obstacle speed
const OBSTACLE_SPEED_MIN = 8.0;
const OBSTACLE_SPEED_MAX = 12.0;

function preload(){
  wasp = loadImage("wasp.png")
  angleMode(DEGREES)
  font = loadFont('font.TTF');
  
  
  sadImage = loadImage("sadface.png");


}

function setup(){
  createCanvas(windowWidth,windowHeight);

  textFont(font);
  textSize(36);
  textAlign(CENTER, CENTER);
  
  noFill()
  stroke(255)

  g = createGraphics(width, height);
  g.background(255,100,0)
  
  b = createGraphics(width, height);
  b.background(0,0,0)

  for(let i = 0; i<numObstacles; i++){
    obstacleXLocs[i] = random(width)
    obstacleYLocs[i] = random(height)
    obstacleDs[i] = random(10,100)

    // Initialize velocities within configured speed range
    let vx = random([-1, 1]) * random(OBSTACLE_SPEED_MIN, OBSTACLE_SPEED_MAX);
    let vy = random([-1, 1]) * random(OBSTACLE_SPEED_MIN, OBSTACLE_SPEED_MAX);
    obstacleVx[i] = vx;
    obstacleVy[i] = vy;
  }

  

  xLoc = width/8
  yLoc = height/2
  rotation = 0

}


function draw(){
  
  
  // Start menu screen

  if (gameState === "MENU") {
    background(50);
    fill(255);
    textSize(64);
    text("Wasp Dodge", width/2, height/2 - 120);
    textSize(28);
    text("Avoid the circles. Hit 4 and it's game over!", width/2, height/2 - 60);
    textSize(32);
    text("Press SPACE or CLICK to start", width/2, height/2 + 20);
    textSize(20);
    text("Use arrow keys to move", width/2, height/2 + 60);
    return; 
  }

  crossedObstacle = false;

  background(50)
 
  for(let i = 0; i<numObstacles; i++){
    // Update positions
    obstacleXLocs[i] += obstacleVx[i]
    obstacleYLocs[i] += obstacleVy[i]


    // Bounce off walls, keep radius inside
    const r = obstacleDs[i] / 2
    if (obstacleXLocs[i] < r) { obstacleXLocs[i] = r; obstacleVx[i] *= -1 }
    if (obstacleXLocs[i] > width - r) { obstacleXLocs[i] = width - r; obstacleVx[i] *= -1 }
    if (obstacleYLocs[i] < r) { obstacleYLocs[i] = r; obstacleVy[i] *= -1 }
    if (obstacleYLocs[i] > height - r) { obstacleYLocs[i] = height - r; obstacleVy[i] *= -1 }

    obstacle(obstacleXLocs[i], obstacleYLocs[i], obstacleDs[i])
  }
  moveWasp()
  displayWasp(xLoc, yLoc, rotation);

  // HUD: survival time
  push();
  fill(255);
  noStroke();
  textSize(24);
  textAlign(LEFT, TOP);
  const seconds = (millis() - startTime) / 1000;
  text(`Time: ${seconds.toFixed(1)} s`, 20, 20);
  pop();

  if(crossedObstacle == true){
    imageMode(CORNER);
    textSize(30)
    fill(255)
    image(g,0,0)
    text("obstacle!", width/2, 100)
    noFill()
  }




  if(pCrossedObstacle == false && crossedObstacle == true){
    count++
    print(count)
  }
 
  if(count>3){
    imageMode(CORNER);
    textSize(30)
    fill(255)
    image(b,0,0)
   
    // Display sad image
    if(sadImage){
      imageMode(CENTER);
      image(sadImage, width/2, height/2, 400, 400);
    }

    textFont(font);
    fill(255, 0, 0); // Red text 
    textSize(48);
    text("GAME OVER!!", width/2, height/2 - 250)


    // Show final survival time
    const finalSeconds = (millis() - startTime) / 1000;
    textSize(32);
    fill(255);
    text(`Time survived: ${finalSeconds.toFixed(1)} s`, width/2, height/2 + 200)
    textSize(28);
    text("Press R or CLICK to restart", width/2, height/2 + 250)
    gameState = "GAMEOVER";
    noLoop()
  }

  pCrossedObstacle = crossedObstacle;
}





function obstacle(x, y, d){
  ellipse(x, y, d)
  if(dist(xLoc,yLoc, x,y) < d/2){
    crossedObstacle = true;  
 }
 

 

}

function moveWasp(){
    if(keyIsDown(RIGHT_ARROW) === true){
      xLoc+=PLAYER_SPEED;
      rotation = 0
    }
    if(keyIsDown(LEFT_ARROW) === true){
      xLoc-=PLAYER_SPEED;
      rotation = 180
    }
      if(keyIsDown(UP_ARROW) === true){
      yLoc-=PLAYER_SPEED;
      rotation = 270
    }
    if(keyIsDown(DOWN_ARROW) === true){
      yLoc+=PLAYER_SPEED;
      rotation = 90
    }

    if(keyIsDown(RIGHT_ARROW) === true && keyIsDown(UP_ARROW) === true){
      rotation = -45
    }

    if(keyIsDown(RIGHT_ARROW) === true && keyIsDown(DOWN_ARROW) === true){
      rotation =  45
    }

    if(keyIsDown(LEFT_ARROW) === true && keyIsDown(UP_ARROW) === true){
      rotation = -135
    }
    if(keyIsDown(LEFT_ARROW) === true && keyIsDown(DOWN_ARROW) === true){
      rotation = - 225
    }

}
function displayWasp(x, y, r){

  imageMode(CENTER);



  // pass the x, y coordinates and the rotation in the argument
  push()
  translate(x, y);
  rotate(57+r)
  image(wasp,0 ,0 ,100,100)
  pop()
  
}


function mousePressed(){
  if (gameState === "MENU") {
    startGame();
  } else if (gameState === "GAMEOVER") {
    restartGame();
  }
}

function keyPressed(){
  if (gameState === "MENU" && (key === ' ' || keyCode === ENTER)) {
    startGame();
  } else if (gameState === "GAMEOVER" && (key === 'r' || key === 'R' || keyCode === ENTER)) {
    restartGame();
  }
}




function startGame(){
  resetGame();
  gameState = "PLAYING";
  startTime = millis();
  loop();
}



function restartGame(){
  resetGame();
  gameState = "PLAYING";
  startTime = millis();
  loop();
}

function resetGame(){
  // Reset player state
  xLoc = width/8;
  yLoc = height/2;
  rotation = 0;



  // Reset collisions/counters
  count = 0;
  crossedObstacle = false;
  pCrossedObstacle = false;



  // Re-roll obstacles
  for(let i = 0; i<numObstacles; i++){
    obstacleXLocs[i] = random(width)
    obstacleYLocs[i] = random(height)
    obstacleDs[i] = random(10,100)

    // reset velocities too (use same speed policy)
    let vx = random([-1, 1]) * random(OBSTACLE_SPEED_MIN, OBSTACLE_SPEED_MAX);
    let vy = random([-1, 1]) * random(OBSTACLE_SPEED_MIN, OBSTACLE_SPEED_MAX);
    obstacleVx[i] = vx;
    obstacleVy[i] = vy;
  }
}


