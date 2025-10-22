let mode = 0;      
let angle = 0;
let col1, col2;




function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  col1 = color("#ff9b00");
  col2 = color("#00e2f2");
  noStroke();
}



function draw() {
  background(0, 20);  

  const speed = map(mouseX, 0, width, 0.01, 0.08);
  angle += speed;

  push();
  translate(mouseX, mouseY);
  rotate(angle);




  if (mode === 0) {
    fill(col1);
    rect(0, 0, 120, 30, 8);
  } else {
    fill(col2);
    ellipse(0, 0, 80, 80);
  }
  pop();
}



// function mousePressed() {

//   mode === 1;
//   col1 = color(random(255), random(255), random(255));
//   
// }


function mousePressed() {

  mode = 1 - mode;
  col1 = color(random(255), random(255), random(255));
  col2 = color(random(255), random(255), random(255));
}

function keyPressed() {
  if (key === 'c' || key === 'C') background(0); 
}

// Move the mouse to change rotation speed.
// Click to toggle between rectangle and ellipse
// Press C to clear the canvas