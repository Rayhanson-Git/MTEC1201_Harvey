let current = 0;   
let s = 1;         

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  noStroke();
}

function draw() {
  background(10);


  push();
  translate(width/2, height/2);
  scale(s);


  fill(30);
  rect(0, 0, 150, 360, 16);


  drawLamp(0, current === 0 ? color(255, 70, 70) : color(80, 20, 20));   // red
  drawLamp(1, current === 1 ? color(255, 200, 60) : color(80, 60, 10));  // yellow
  drawLamp(2, current === 2 ? color(90, 255, 120) : color(20, 60, 25));  // green

  pop();
}

function drawLamp(index, c) {
  const y = -110 + index * 110;
  fill(c);
  ellipse(0, y, 90, 90);
}

function keyPressed() {
  if (key === '1') current = 0;
  else if (key === '2') current = 1;
  else if (key === '3') current = 2;
  else if (key === '+') s = min(2.0, s + 0.1);
  else if (key === '-') s = max(0.5, s - 0.1);
}


// press 1,2,3 to switch lights
// Press + , - to scale 