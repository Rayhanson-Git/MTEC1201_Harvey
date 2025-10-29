let col, col1, col2;
let button


function setup() {




  Button1 = createButton('scene 1')




  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

background(0);
noStroke(0);
strokeWeight(15);
noFill();

col1=color("#851400");
col2=color("#00e2f2");
}


function draw() {


  noStroke();
  fill(0, 25);
  rect(0, 0, width, height);

let i = constrain(map(mouseX, 0, width, 0, 1), 0, 1);


col = lerpColor(col1, col2, i);


  
  stroke(col);
  line(pmouseX, pmouseY, mouseX, mouseY);
  }


  function mousePressed() {
    background(0);

    col1 = color(random(255), random(255), random(255));
    col2 = color(random(255), random(255), random(255));


  }


