let theta = 0;
let mode = 0;  

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  strokeWeight(2);
}



function draw() {
  background(0, 30);

  //const speed = map(mouseY, 0, width, random);
  
  const speed = map(mouseX, 0, width, 0.02, 0.12);
  const radius = map(mouseY, 0, height, 120, 40);
  theta += speed;



  push();
  translate(mouseX, mouseY);
  rotate(theta);





  if (mode === 0) {
    stroke(0, 255, 220);
    noFill();
    rect(radius, 0, 36, 12, 4);
  } else {

    stroke(255, 180, 80);
    for (let i = 0; i < 6; i++) {
      rotate(TWO_PI / 6);
      line(0, 0, radius, 0);
    }
  }
  pop();
}

// function mousePressed() {

//   mode === 1;
// }


function mousePressed() {

  mode = 1 - mode;
}





function keyPressed() {
  if (key === 's' || key === 'S') saveCanvas('orbit_brush', 'png');
}

// Moving mouse change rotation speed
// Move mouse up and down to change radius
// Click to toggle 
// Press S to sabe
