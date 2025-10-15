function setup() {
  createCanvas(1920, 1080); // 1080p canvas
  fill(0);              
}

function draw() {
  background(18, 24, 38); // dark blue background

  //rectangle
  stroke(220); // rect 1  with rounded corners
  fill(40, 120, 255); 
  rect(100, 380, 180, 120, 10);
  
  // Iwanted to make the rectangles as one inside another
  //but I couldn't figure it out and made them rounded by accident.
  // I was also thinking is I could add lines to details in a way to make them look 3D

  stroke(220)//rect 2 with rounded corners
  fill(38,189,92)
  rect(310, 420, 130, 80, 6); 

  //ellipse
  stroke(255, 180, 0); 
  fill(205, 174, 120);
  ellipse(620, 120, 120, 120);

  //triangle
  noFill(); 
  stroke(160, 220, 255);
  triangle(200, 200, 260, 120, 320, 200);

}