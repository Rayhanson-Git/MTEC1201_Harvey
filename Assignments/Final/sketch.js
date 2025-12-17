// Orbit Playground
// Copyright belongs to Harvey Chowdhury

// Requirements used:
// 1 Loops (drawing/updating many circles each frame)
// 2 Arrays (storing many orbiters/circles)
// 3 Classes examples

// Controls:
// Left Click: add a new orbiter
// Hold mouse: add orbiters slowly
// press 1 / 2 / 3 to change color style
// Up / Down arrow kets: speed up / slow down
// C: clear orbiters
// R: reset to default

let orbiters = [];      
let colorMode = 1;
let globalSpeed = 0.02; //speed control



function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  // start with a few orbiters
  for (let i = 0; i < 20; i++) {  // 20 orbits
    orbiters.push(new Orbiter(width / 2, height / 2));
  }
}




function draw() {
  // soft trail background
  background(5, 6, 10, 45);

  // (LOOP)update + display every orbiter
  for (let i = 0; i < orbiters.length; i++) {
    orbiters[i].update();  //changes positions and angles
    orbiters[i].display();  // shown on screen
  }

  // center point
  // fill(220, 240, 255, 180);   // just a dot in the centre to present center of screen
  // circle(width / 2, height / 2, 6);

  drawHUD();

  // Mouse hold to add orbiters slowly
  if (mouseIsPressed && frameCount % 6 === 0) {  // preventing spam 
    addOrbiter(mouseX, mouseY);
  }
}



// function addOrbiter(x, y) {
//   if (orbiters.length< 192) {
//     orbiters.push(new Orbiter(x, y);
// addOrbiter(mouseX, mouseY);
//   }
// }



function addOrbiter(x, y) {
  // keep it from getting too heavy
  // creates a new Orbiter at the given coordinates.
  if (orbiters.length < 300) {      // total number of orbiters to prevent the sketch from slowing down.
    orbiters.push(new Orbiter(x, y));
  }
}



// function mousePressed() {

//   if (portals.length < 6) {
//     portals.push(new Portal(mouseX, mouseY));
//     rings.push(new Ring(mouseX, mouseY))
//   } else {



//     rings.push(new Ring(mouseX, mouseY, true));
//   }
// }



function mousePressed() {
  addOrbiter(mouseX, mouseY);  // runs when clicked adding orbit
}

function keyPressed() {
  if (key === "1") colorMode = 1;
  if (key === "2") colorMode = 2;
  if (key === "3") colorMode = 3;

  if (key === "c" || key === "C") orbiters = [];
  if (key === "r" || key === "R") resetScene();

  if (keyCode === UP_ARROW) globalSpeed += 0.005;   // speed increased
  if (keyCode === DOWN_ARROW) globalSpeed -= 0.005;  // speed decreased

  //speed range so nothing gets stuck or crazy out of control
  globalSpeed = constrain(globalSpeed, 0.002, 0.08);
}

function resetScene() {  //clears everything out like starting from beginning
  orbiters = [];
  colorMode = 1;
  globalSpeed = 0.02;

  for (let i = 0; i < 20; i++) { //spawning the 20 orbits again
    orbiters.push(new Orbiter(width / 2, height / 2));
  }
}


// function drawHUD() {
//   push();
//   noStroke();
//   fill(190, 220, 255, 160);
//   textSize(14);
//   textAlign(LEFT, TOP);
//   let line1 = "Neon Orbit Arcade  |  Mode: " + mode;
//   let line2 = "Hold mouse: emit  |  Click: orbi  |  1 Calm  2 Chaos  C Clear  R Reset";
//   text(l);
//   text(line2, 16, 34);



function drawHUD() {  // renders a simple heads‑up display on top of the canvas
  fill(190, 220, 255, 160);  // light blue color
  textSize(14);
  textAlign(LEFT, TOP);

  text("Orbit Playground", 16, 14);
  text(
    "Click: add  | Hold: add slowly  |  1/2/3 color  |  Up/Down speed  |  C clear  |  R reset",
    16, 34
  );

  text("Orbiters: " + orbiters.length + "   Speed: " + nf(globalSpeed, 1, 3), 16, 54);
}

function windowResized() {  // called automatically when the browser window changes size
  resizeCanvas(windowWidth, windowHeight);
}






class Orbiter {
  constructor(startX, startY) {
    // Each orbiter has its own orbit center at point of click
    this.cx = startX;
    this.cy = startY;

    //Orbit radius + angle
    this.r = random(20, 180); //range radius
    this.a = random(TWO_PI); // range angle

    //Individual angular speed with main speed for random effect
    this.s = random(0.5, 1.5); 

    //Random size range
    this.size = random(4, 12); 

    //little drift coordinates from centre 
    this.dx = random(-0.25, 0.25); 
    this.dy = random(-0.25, 0.25);
  }

  update() {
    //orbit 
    this.a += globalSpeed * this.s; // causing rotation with angle and speed 

    //gentle drift of the orbit center
    this.cx += this.dx; 
    this.cy += this.dy;

    // bounce the center drift off edges keeping in the screen
    if (this.cx < 0 || this.cx > width) this.dx *= -1;
    if (this.cy < 0 || this.cy > height) this.dy *= -1;
  }

  display() {  // cirrcular motion math converting the a+r to x/y positions
    let x = this.cx + cos(this.a) * this.r;
    let y = this.cy + sin(this.a) * this.r;

    //color modes
    if (colorMode === 1) fill(220, 70, 135, 240);
    if (colorMode === 2) fill(170, 140, 255, 140);
    if (colorMode === 3) fill(120, 255, 190, 140);

    circle(x, y, this.size); // main dot 

    // glow effect
    fill(255, 255, 255, 40);
    circle(x, y, this.size * 1.8);
  }
}



// Copyright belongs to Harvey Chowdhury
