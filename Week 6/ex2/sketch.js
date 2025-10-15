

let wasp;
let xLoc, yLoc, rotation

let obstaclexLocs = []
let obstacleyLocs = []
let obstacleD = []

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

  

xLoc = width/8
yLoc = width/2
rotation = 0

obstaclexLocs = [width/4, width/2, width*3/4, width/3, width*2/3]
obstacleyLocs = [height/4, height/2, height/4, height*3/4, height*2/3]
obstacleD = [random(100, 300), random(100, 300), random(100, 300), random(100, 300), random(100, 300)]



}


function draw(){
 background(50)
 noFill()

let x = width * noise(frameCount* 0.01)
let y = height * noise(frameCount*0.01 +10)
let r = 360* noise(frameCount*0.01,frameCount*0.01 +10  )

moveWasp()

for(let i = 0; i < obstaclexLocs.length; i++){
  obstacle(obstaclexLocs[i], obstacleyLocs[i], obstacleD[i])
}

displaywasp(xLoc, yLoc, rotation)



}

function obstacle(x, y, w,){
  
  ellipse(x, y, w)

if(dist(xLoc,yLoc, x,y) < w/2){
  
    background(255,100,0)
    textSize(30)
    fill(255,100,0)
    text("Danger, wasp!", width/2, 100)

 }


//  ellipse(width/4, height/2, 200,200)


} 

function moveWasp() {
  if(keyIsDown(RIGHT_ARROW) === true) {
  xLoc+=4;
  rotation = 0
}

if(keyIsDown(LEFT_ARROW) === true) {
  xLoc-=4;
  rotation = 180
}

if(keyIsDown(UP_ARROW) === true) {
  yLoc-=4;
  rotation = 270
}

if(keyIsDown(DOWN_ARROW) === true) {
  yLoc+=4;
  rotation = 90
}

if(keyIsDown(RIGHT_ARROW) === true && keyIsDown(UP_ARROW) === true) {

  rotation = -45
}

if(keyIsDown(RIGHT_ARROW) === true && keyIsDown(DOWN_ARROW) === true) {
  
  rotation = 45
}

if(keyIsDown(LEFT_ARROW) === true && keyIsDown(UP_ARROW) === true) {
  
  rotation = -135
}

if(keyIsDown(LEFT_ARROW) === true && keyIsDown(DOWN_ARROW) === true) {
  
  rotation = -315
}
 


}

function displaywasp (x, y, r){
 push()
 translate(x, y)
 rotate(r)
 image(wasp,0 ,0 ,100,100)
 pop()
}

function mousePressed(){
  obstaclexLocs.push(mouseX)
  obstacleyLocs.push(mouseY)
  obstacleD.push(random(100, 300))
}


