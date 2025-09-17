//let col1, col2;
const spread = 40; 
const dotSize = 13;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  background(0);
  //newPalette();
}

function draw() {
  const x = mouseX + random(-spread, spread);
  const y = mouseY + random(-spread, spread);

  // Generate random RGB color with transparenmt effect
  const col = color(random(255), random(255), random(255), 150);

  fill(col);
  rect(x, y, dotSize, dotSize);
  
  fill(0);
  rect(x + 3, y + 3, dotSize - 6, dotSize - 6);

  //filter(BLUR, 0.5)

}


function mousePressed() {
  background(0);
  newPalette();
}

// function newPalette() {
//   col1 = color("#851400");
//   col2 = color("#00e2f2");
  
// }
