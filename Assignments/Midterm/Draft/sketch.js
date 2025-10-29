let mode = -1;     // menu
let colA, colB;    // global palette randomized on reset
let seed;




const S1 = { /* Week 2 – static composition + simple interaction */
  init() {
    // no canvas here; we use the main one
  },
  run() {
    background(12, 24, 38);
    // composition of week 2
    stroke(220); strokeWeight(2); fill(40, 120, 255);
    rect(100, 380, 180, 120, 10);
    rect(310, 420, 130, 80, 6);

    // color by mouse press
    const t = constrain(map(mouseX, 0, width, 0, 1), 0, 1);
    const c = lerpColor(colA, colB, t);
    noStroke(); fill(c);
    ellipse(620, 120, 120, 120);

    // triangel
    noFill(); stroke(160, 220, 255); strokeWeight(3);
    triangle(200, 200, 260, 120, 320, 200);
  },
  mousePressed() {},
  keyPressed() {}
};

const S2 = { // Week 3 – gradient brush
  col1: null, col2: null, brushMode: 0,
  init() {
    this.col1 = color("#ff9b00");
    this.col2 = color("#00e2f2");
  },
  run() {
    // draw expressive lines/ellipses with blur, mapping speed → strokeWeight
    const speed = dist(mouseX, mouseY, pmouseX, pmouseY);
    const w = map(speed, 0, 40, 2, 20);
    const i = constrain(map(mouseX, 0, width, 0, 1), 0, 1);
    const col = lerpColor(this.col1, this.col2, i);
    stroke(col); strokeWeight(w);

    if (this.brushMode === 0) {
      line(pmouseX, pmouseY, mouseX, mouseY);
    } else {
      noStroke(); fill(col); ellipse(mouseX, mouseY, w * 2, w * 2);
    }
    // subtle smear
    filter(BLUR, 1);
  },
  mousePressed() {
    // toggle mode and randomize colors
    this.brushMode = 1 - this.brushMode;
    this.col1 = color(random(255), random(255), random(255));
    this.col2 = color(random(255), random(255), random(255));
  },
  keyPressed() {
    if (key === 'c' || key === 'C') background(0);
  }
};

const S3 = { /* Week 4 – rotating stamp / orbit tool */
  angle: 0, shapeMode: 0,
  init() {},
  run() {
    background(0, 25);
    const speed = map(mouseX, 0, width, 0.01, 0.08);
    this.angle += speed;

    push();
    translate(mouseX, mouseY);
    rotate(this.angle);

    const c = lerpColor(colA, colB, constrain(map(mouseX, 0, width, 0, 1), 0, 1));
    if (this.shapeMode === 0) {
      noFill(); stroke(c); rectMode(CENTER);
      rect(0, 0, 160, 40, 8);
    } else {
      noStroke(); fill(c); ellipse(0, 0, 90, 90);
    }
    pop();
  },
  mousePressed() { this.shapeMode = 1 - this.shapeMode; },
  keyPressed() { if (key === 'c' || key === 'C') background(0); }
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  resetSketch();
}

function draw() {
  if (mode === -1) {
    drawMenu();
  } else if (mode === 0) {
    S1.run();
  } else if (mode === 1) {
    S2.run();
  } else if (mode === 2) {
    S3.run();
  }
}




function resetSketch() {
  seed = random(10000); randomSeed(seed);
  colA = color(random(255), random(255), random(255));
  colB = color(random(255), random(255), random(255));

  S1.init(); S2.init(); S3.init();
  mode = -1; 
}

function drawMenu() {
  background(0);
  fill(255); textAlign(CENTER, CENTER);
  textSize(28);
  text("MIDTERM WIP – Choose a study:\\n[1] Week2  [2] Week3  [3] Week4\\nR = Restart  |  M = Menu", width/2, height/2);
}

// --- input routing ---
function keyPressed() {
  if (key === '1') mode = 0;
  else if (key === '2') mode = 1;
  else if (key === '3') mode = 2;
  else if (key === 'm' || key === 'M') mode = -1;
  else if (key === 'r' || key === 'R') resetSketch();
  else {
    if (mode === 0) S1.keyPressed();
    else if (mode === 1) S2.keyPressed();
    else if (mode === 2) S3.keyPressed();
  }
}

function mousePressed() {
  if (mode === -1) { mode = 0; return; }
  if (mode === 0) S1.mousePressed();
  else if (mode === 1) S2.mousePressed();
  else if (mode === 2) S3.mousePressed();
}
