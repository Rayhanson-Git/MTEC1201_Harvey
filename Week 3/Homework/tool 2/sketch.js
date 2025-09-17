let col1, col2

function setup() {
  createCanvas(windowWidth, windowHeight);
  noFill();
  strokeWeight(10);
  resetCanvasAndPalette();
}

function draw() {

if (mouseIsPressed){    
  const t = map(mouseX, 0, width, 0, 1);
  const col = lerpColor(col1, col2, constrain(t, 0, 1));

  stroke(col);
  line(pmouseX, pmouseY, mouseX, mouseY);

    //filter(BLUR, 1);
 }

}

function mousePressed() {
  resetCanvasAndPalette();     
  
}

function keyPressed() {
  background(255);             
}

function resetCanvasAndPalette() {
  background(0);

  col1 = color(random(255), random(255), random(255));
  col2 = color(random(255), random(255), random(255));
}
