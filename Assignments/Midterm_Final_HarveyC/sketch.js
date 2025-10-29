  // Course: MTEC 1201 — Midterm Project
  // Harvey Chowdhury
  // Instructions:
  //   • Move the wasp with the ARROW KEYS (or WASD) to dodge the circles.
  //   • Press SPACE or CLICK to start. Press R to restart at any time.
  //   • You have 4 lives. Colliding with a circle removes 1 life.
  //   • Survive as long as you can. Score = seconds survived.
  // Copyright belongs to Harvey Chowdhury.


// images, sounds, and font we try to load
let waspImg, sadImg, hitSfx, uiFont;

let player = {
  x: 0, y: 0, r: 28, speed: 5, rot: 0,
  vx: 0, vy: 0
};

// arrays for moving circles and tiny background dots
let obstacles = [];
let sparkles = [];
let maxObstacles = 12; // how many circles at once

// keeps track of which screen we are on
let state = "MENU"; // start on menu
let lives = 4; // hearts we have
let score = 0; // seconds survived
let startTime = 0; // when the run started

// after we get hit, we are safe for a short time so we don't lose all lives at once
const HIT_COOLDOWN = 1000; // 1 second after hit
let lastHitAt = -Infinity; // last hit time

// adjust circle movement speed
const OBSTACLE_SPEED_MULT = 4; // speed boost for circles

function preload(){
  // load files before the game starts
  try { waspImg = loadImage("wasp.png"); } catch(e){}
  try { sadImg  = loadImage("sadface.png"); } catch(e){}
  try { hitSfx  = loadSound("gameover.mp3"); } catch(e){}
  try { uiFont  = loadFont("font.TTF"); } catch(e){}
}

function setup(){
  // set up the canvas and some default styles
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  imageMode(CENTER);
  noCursor(); // hide mouse cursor
  if(uiFont) textFont(uiFont); // use custom font if found
  // make the background stars and start values
  initSparkles();
  resetGame();
}

function windowResized(){
  // keep the canvas full screen and rebuild stars when window size changes
  resizeCanvas(windowWidth, windowHeight); // match window size
  initSparkles();
}

function draw(){
  // main loop: runs every frame
  drawBackground();
  if(state === "MENU"){
    // show title and a little preview
    drawMenu();
  }else if(state === "PLAY"){
    // update everything and then draw it
    updatePlayer();
    updateObstacles();
    handleCollisions();
    drawPlayer();
    drawHUD();
  }else if(state === "GAMEOVER"){
    // show game over text
    drawGameOver();
  }
}

function drawBackground(){
  // draw a dark background and some slow moving dots
  background(16,16,20); // dark background
  for(let s of sparkles){
    s.x += s.vx;
    s.y += s.vy;
    if(s.x < -10) s.x = width + 10;
    if(s.x > width + 10) s.x = -10;
    if(s.y < -10) s.y = height + 10;
    if(s.y > height + 10) s.y = -10;
    noStroke();
    fill(255, 255, 255, s.a);
    circle(s.x, s.y, s.d);
  }
}

function initSparkles(){
  // create many tiny dots with random positions and tiny movement
  sparkles = [];
  for(let i=0;i<120;i++){ // 120 dots
    sparkles.push({
      x: random(width),
      y: random(height),
      d: random(1,3),
      a: random(30,120),
      vx: random(-0.2,0.2),
      vy: random(-0.2,0.2)
    });
  }
}

function drawMenu(){
  // simple menu
  fill(255);
  textSize(46);
  text("Wasp Dodge+", width/2, height/2 - 140);
  textSize(22);
  text("Avoid the circles. Hit 4 and it's game over.", width/2, height/2 - 90);
  text("Move with ARROWS or WASD. SPACE/CLICK to start.", width/2, height/2 - 60);
  text("Press R to restart at any time.", width/2, height/2 - 30);

  // move the player (ghost = true so we don't actually change its position)
  updatePlayer(true);
  // move and draw obstacles so we can see them in the menu
  updateObstacles(false);
  drawPlayer(160);
  drawHUD(true);
}

function drawGameOver(){
  drawHUD();
  textSize(48);
  fill(255);
  text("GAME OVER", width/2, height/2 - 80);
  textSize(24);
  text(`Final Score: ${nf(score,1,2)} sec`, width/2, height/2 - 40);
  text("Press R to try again", width/2, height/2 + 10);
  if(sadImg){
    tint(255,140);
    image(sadImg, width/2, height/2 + 120, 96, 96);
    noTint();
  }
}

function resetGame(){
  // put everything back to the start
  player.x = width/2;
  player.y = height*0.7;
  player.vx = player.vy = 0;
  obstacles = [];
  // add a bunch of circles to begin with
  for(let i=0;i<maxObstacles;i++) spawnObstacle(true); // pre-fill from offscreen
  lives = 4;
  score = 0;
  startTime = millis();
  if(state !== "MENU") state = "PLAY"; // keep playing if we reset mid-game
}

function updatePlayer(ghost=false){
  // read keyboard and move the player, keep inside the screen
  let dx = (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) - (keyIsDown(65) || keyIsDown(LEFT_ARROW)); // right - left
  let dy = (keyIsDown(83) || keyIsDown(DOWN_ARROW)) - (keyIsDown(87) || keyIsDown(UP_ARROW));   // down - up
  player.vx = dx * player.speed;
  player.vy = dy * player.speed;
  if(!ghost){
    player.x = constrain(player.x + player.vx, player.r, width - player.r); // keep inside left/right
    player.y = constrain(player.y + player.vy, player.r, height - player.r); // keep inside top/bottom
  }
  // rotate to face the mouse
  // player.rot = atan2(mouseY - player.y, mouseX - player.x);
}

function drawPlayer(alpha=255){
  // draw the wasp where the player is
  push();
  translate(player.x, player.y);
  rotate(player.rot);
  let a = alpha;
  // quick blink when we are invincible after a hit
  if(state === "PLAY" && millis() - lastHitAt < HIT_COOLDOWN){
    if(frameCount % 6 < 3){
      a = Math.min(alpha, 120);
    }
  }
  tint(255, a);
  if(waspImg){
    image(waspImg, 0, 0, player.r*3, player.r*2.4);
  } else {
    noStroke();
    fill(255,220,0, a);
    ellipse(0,0, player.r*2, player.r*1.4);
    fill(40,40,60, a);
    triangle(0,0, -player.r*1.3,-player.r*0.4, -player.r*1.3, player.r*0.4);
  }
  noTint();
  pop();
}

function spawnObstacle(offscreen=false){
  // make a circle with random size, position, and speed
  const edge = floor(random(4)); // pick side to spawn from
  let r = random(14, 36);
  let x = random(width), y = random(height);
  let vx = random(-2.2, 2.2) * OBSTACLE_SPEED_MULT, vy = random(-2.2, 2.2) * OBSTACLE_SPEED_MULT; // random speed
  if(offscreen){
    // sometimes start just outside the screen so they fly in
    if(edge === 0){ x = random(width); y = -r*2; vy = random(0.6, 2.0) * OBSTACLE_SPEED_MULT; }  // from top
    if(edge === 1){ x = width + r*2; y = random(height); vx = random(-2.0,-0.6) * OBSTACLE_SPEED_MULT; } // from right
    if(edge === 2){ x = random(width); y = height + r*2; vy = random(-2.0,-0.6) * OBSTACLE_SPEED_MULT; } // from bottom
    if(edge === 3){ x = -r*2; y = random(height); vx = random(0.6, 2.0) * OBSTACLE_SPEED_MULT; }  // from left
  }
  obstacles.push({x, y, r, vx, vy});
}

function updateObstacles(ghost=false){
  // keep adding circles until we have the max amount
  while(obstacles.length < maxObstacles) spawnObstacle(true);
  for(let o of obstacles){
    // move them
    if(!ghost){ o.x += o.vx; o.y += o.vy; }
    // bounce when they try to leave the screen
    if(o.x < o.r && o.vx < 0) o.vx *= -1; // flip X
    if(o.x > width - o.r && o.vx > 0) o.vx *= -1;
    if(o.y < o.r && o.vy < 0) o.vy *= -1;
    if(o.y > height - o.r && o.vy > 0) o.vy *= -1; // flip Y
    // draw the circle with a white outline so it's easy to see
    stroke(255, 230);
    strokeWeight(1);
    noFill();
    circle(o.x, o.y, o.r*2 + 2);
    noStroke();
    fill(100,150,255, 160);
    circle(o.x, o.y, o.r*2);
  }
  // every so often give them a tiny random nudge so they feel alive
  if(frameCount % 30 === 0){ // a small random nudge sometimes
    for(let o of obstacles){
      o.vx += random(-0.15, 0.15);
      o.vy += random(-0.15, 0.15);
      o.vx = constrain(o.vx, -2.5 * OBSTACLE_SPEED_MULT, 2.5 * OBSTACLE_SPEED_MULT);
      o.vy = constrain(o.vy, -2.5 * OBSTACLE_SPEED_MULT, 2.5 * OBSTACLE_SPEED_MULT);
    }
  }
}

function handleCollisions(){
  // check if the player is touching any circle
  if(state !== "PLAY") return;

  const now = millis();
  const invincible = (now - lastHitAt) < HIT_COOLDOWN; // still safe

  // only count one hit per cooldown so we don't lose several lives at once
  if(!invincible){
    for(let o of obstacles){
      let d = dist(player.x, player.y, o.x, o.y); // distance between centers
      if(d < player.r + o.r){ // circles touching
        lives = max(0, lives - 1); // lose 1 life
        lastHitAt = now; // start cooldown
        if(hitSfx){ try{ hitSfx.play(); }catch(e){} }
        // push the player away a bit so it feels like knockback
        // player.x = constrain(player.x + (player.x - o.x)*0.6, player.r, width - player.r);
        // player.y = constrain(player.y + (player.y - o.y)*0.6, player.r, height - player.r);
        
        // also move the circle away a little
        o.x += (o.x - player.x)*0.8;
        o.y += (o.y - player.y)*0.8;
        break;
      }
    }
  }

  // score is just how many seconds we stayed alive
  score = (millis() - startTime) / 1000; // seconds
  if(lives <= 0){
    state = "GAMEOVER"; // go to end screen
    cursor();
  }
}

function drawHUD(ghost=false){
  // simple text that shows lives and score
  push();
  textAlign(LEFT, TOP);
  textSize(16);
  fill(255);
  let s = `Lives: ${lives}`;
  text(s, 16, 14);
  text(`Score: ${nf(score,1,2)}s`, 16, 36);
  pop();
  if(ghost){
    // small hint at the bottom in the menu
    textAlign(CENTER, CENTER);
    textSize(18);
    text("Click or press SPACE to start", width/2, height*0.86);
  }
}

function keyPressed(){
  // space starts the game from the menu
  if(key === ' ' && state === "MENU"){
    state = "PLAY";
    startTime = millis(); // reset timer
  }
  // R restarts the game any time
  if((key === 'r' || key === 'R')){
    resetGame();
    state = "PLAY";
    startTime = millis(); // reset timer
  }
}

function mousePressed(){
  // clicking also starts the game from the menu
  if(state === "MENU"){
    state = "PLAY";
    startTime = millis(); // reset timer
  }
}
