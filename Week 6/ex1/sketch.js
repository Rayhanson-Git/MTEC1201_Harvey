

let wasp;

//let x, y

function preload(){
  wasp = loadImage("wasp.png")
  print(wasp);
  angleMode(DEGREES)
  
}

function setup(){
  createCanvas(windowWidth,windowHeight);
  imageMode(CENTER);
  noFill()
  stroke(255)
}

// x = width/8
// y = width/2


function draw(){
 background(50)
 noFill()

let x = width * noise(frameCount* 0.01)
let y = height * noise(frameCount*0.01 +10)
let r = 360* noise(frameCount*0.01,frameCount*0.01 +10  )

// if(dist(x,y, width/4, height/2) < 100){
  
//     background(255,100,0)
//     textSize(30)
//     fill(255,100,0)
//     text("Danger, wasp!", width/2, 100)

//  }


//  ellipse(width/4, height/2, 200,200)

displaywasp(width*noise(frameCount/100),height*noise(10+frameCount/200), 0)

displaywasp(width*noise(frameCount/230),height*noise(10+frameCount/100), 0)
}

function displaywasp (x, y, r){
 push()
 translate(x, y)
 rotate(r)
 image(wasp,0 ,0 ,100,100)
 pop()
}

function mousePressed(){
  
}


