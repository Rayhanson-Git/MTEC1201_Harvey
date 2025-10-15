let col, col1, col2;

function setup() {
  createCanvas(windowWidth, windowHeight);

background(0);
noStroke(0);
strokeWeight(15);
noFill();

col1=color("#851400");
col2=color("#00e2f2");
}


function draw() {

//  let r = map(mouseX, 0, width, 0, 255);
//  let b = map(mouseX, 0, width, 255, 0);

//  let col = color(r,0,b);

let i = map(mouseX, 0, width, 0, 1);


col = lerpColor(col1, col2, i);

//  console.log(r);
  
  stroke(col);
  line(pmouseX, pmouseY, mouseX, mouseY);

  filter(BLUR, 2);
  fill (col2);
  ellipse(mouseX, mouseY, 10);
  }


  function mousePressed() {
    background(0);

    col1 = color(random(255), random(255), random(255));
    col2 = color(random(255), random(255), random(255));


  }


