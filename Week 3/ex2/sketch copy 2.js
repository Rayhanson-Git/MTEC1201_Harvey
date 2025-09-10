//let col;

function setup() {
  createCanvas(windowWidth, windowHeight);

background(0);
strokeWeight(10);
noStroke(0);


}

function draw() {

  let r = map(mouseX, 0, width, 0, 255);
  let b = map(mouseX, 0, width, 255, 0);
  let col = color(r,0,b);

  console.log(r);
  
  stroke(col);
  line(pmouseX, pmouseY, mouseX, mouseY);
  //fill (col);
  //ellipse(mouseX, mouseY, 20);


}
