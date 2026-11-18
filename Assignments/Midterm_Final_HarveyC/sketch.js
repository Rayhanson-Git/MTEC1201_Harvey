// Wasp Dodge+
// Guide a wasp through moving circles and stay in play for as long as possible.
// © Harvey Rayhanson (Harvey Chowdhury), rayhanson.tech. MTEC 1201 midterm project.
//
// How to play
//   Space / click / tap      start a run
//   Arrows / WASD            fly the wasp
//   Drag (touch or mouse)    the wasp flies towards your finger
//   P / Esc                  pause
//   M                        sound on or off
//   R                        restart at any time
//
// You have 4 lives. Each circle you hit costs one, then you are safe for a
// second. The score is the number of seconds you survive. Every 15 seconds the
// level goes up: one more circle, a little faster. Power-ups drift in now and then:
//   Shield   blocks the next hit
//   Slow     circles move at half speed for 5 seconds
//   Heart    gives back a lost life (never more than 4)

// ---------------------------------------------------------------- settings

const LIVES = 4;
const HIT_COOLDOWN = 1000; // ms of safety after a hit
const START_OBSTACLES = 12;
const MAX_OBSTACLES = 24;
const OBSTACLE_SPEED_MULT = 4; // the original speed boost for circles
const LEVEL_SECONDS = 15; // a new level every 15 seconds
const LEVEL_SPEEDUP = 0.06; // each level is 6% faster...
const MAX_SPEEDUP = 1.6; // ...up to 1.6 times the starting speed
const POWERUP_EVERY = [9000, 15000]; // ms between power-ups, picked at random in this range
const POWERUP_LIFETIME = 8000; // ms a power-up stays before fading away
const SLOW_DURATION = 5000;
const SLOW_FACTOR = 0.5;
const NEAR_MISS = 16; // px between edges that counts as a near miss
const BEST_KEY = 'wasp-dodge:best';
const SOUND_KEY = 'wasp-dodge:sound';

// the wasp picture points up and a little to the right; this turns it to face its flight
const SPRITE_HEADING = -1.31; // radians

// ------------------------------------------------------------------- assets

// Each file has a fallback, so a missing or blocked file never stops the game.
let waspImg = null;
let sadImg = null;
let hitSfx = null;
let uiFont = null;

function preload() {
  waspImg = loadImage('wasp.png', undefined, () => (waspImg = null));
  sadImg = loadImage('sadface.png', undefined, () => (sadImg = null));
  uiFont = loadFont('font.TTF', undefined, () => (uiFont = null));
  if (typeof loadSound === 'function') {
    hitSfx = loadSound('gameover.mp3', undefined, () => (hitSfx = null));
  }
}

// ------------------------------------------------------------------- state

const player = { x: 0, y: 0, r: 28, speed: 5, rot: SPRITE_HEADING, vx: 0, vy: 0 };

let obstacles = [];
let sparkles = [];
let burst = []; // little pieces thrown out on a hit
let popups = []; // short floating words ("Shield", "Near miss")
let powerup = null; // the power-up on the field, if any

let state = 'MENU'; // MENU, PLAY, PAUSE or GAMEOVER
let lives = LIVES;
let score = 0; // seconds survived
let startTime = 0;
let pausedAt = 0;
let lastHitAt = -Infinity;
let level = 1;
let shield = false;
let slowUntil = 0;
let nextPowerupAt = 0;
let shake = 0;

let best = 0;
let newBest = false;
let nearMisses = 0;
let powerupsTaken = 0;
let soundOn = true;
let touchTarget = null; // where a finger or a held mouse is steering the wasp

// ------------------------------------------------------------------- p5 hooks

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight);
  canvas.elt.setAttribute('role', 'img');
  canvas.elt.setAttribute('aria-label', 'Wasp Dodge+: fly a wasp between moving circles. Press Space or tap to start.');
  pixelDensity(min(2, displayDensity()));
  textAlign(CENTER, CENTER);
  imageMode(CENTER);
  if (uiFont) textFont(uiFont);
  best = Number(readStore(BEST_KEY)) || 0;
  soundOn = readStore(SOUND_KEY) !== 'off';
  initSparkles();
  resetGame();
  state = 'MENU';
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initSparkles();
  player.x = constrain(player.x, player.r, width - player.r);
  player.y = constrain(player.y, player.r, height - player.r);
}

function draw() {
  push();
  if (shake > 0) {
    translate(random(-shake, shake), random(-shake, shake));
    shake *= 0.85;
    if (shake < 0.3) shake = 0;
  }
  drawBackground();

  if (state === 'MENU') {
    updatePlayer(true);
    updateObstacles(false);
    drawPowerup();
    drawPlayer(150);
    pop();
    drawMenu();
  } else if (state === 'PLAY') {
    updateLevel();
    updatePlayer(false);
    updateObstacles(true);
    updatePowerup();
    handleCollisions();
    drawBurst();
    drawPowerup();
    drawPlayer(255);
    drawPopups();
    pop();
    drawHUD();
  } else if (state === 'PAUSE') {
    updateObstacles(false);
    drawPowerup();
    drawPlayer(255);
    pop();
    drawHUD();
    drawPause();
  } else {
    updateObstacles(false);
    drawBurst();
    pop();
    drawHUD();
    drawGameOver();
  }
}

// ------------------------------------------------------------------- input

function keyPressed() {
  if (key === ' ' && state === 'MENU') startRun();
  else if (key === ' ' && state === 'GAMEOVER') startRun();
  else if (key === 'r' || key === 'R') startRun();
  else if ((key === 'p' || key === 'P' || keyCode === ESCAPE) && (state === 'PLAY' || state === 'PAUSE')) togglePause();
  else if (key === 'm' || key === 'M') {
    soundOn = !soundOn;
    writeStore(SOUND_KEY, soundOn ? 'on' : 'off');
    popups.push(new Popup(soundOn ? 'Sound on' : 'Sound off', width / 2, 70, [255, 255, 255]));
  }
  // keep Space and the arrow keys from scrolling the page
  if (key === ' ' || [UP_ARROW, DOWN_ARROW, LEFT_ARROW, RIGHT_ARROW].includes(keyCode)) return false;
}

function mousePressed() {
  unlockAudio();
  if (state === 'MENU' || state === 'GAMEOVER') {
    if (state === 'GAMEOVER' && millis() - lastHitAt < 600) return false; // a stray click right after the last hit
    startRun();
    return false;
  }
  if (state === 'PLAY') touchTarget = { x: mouseX, y: mouseY };
  return false;
}

function mouseDragged() {
  if (state === 'PLAY') touchTarget = { x: mouseX, y: mouseY };
  return false;
}

function mouseReleased() {
  touchTarget = null;
}

// Touch screens: p5 does not call the mouse functions for a finger, so these
// share them. Returning false keeps the page from scrolling or zooming.
function touchStarted() {
  return mousePressed();
}

function touchMoved() {
  return mouseDragged();
}

function touchEnded() {
  mouseReleased();
  return false;
}

// The pause and the sound buttons in the corner (see index.html) call these.
function togglePause() {
  if (state === 'PLAY') {
    state = 'PAUSE';
    pausedAt = millis();
    cursor();
  } else if (state === 'PAUSE') {
    const away = millis() - pausedAt;
    startTime += away; // time spent paused does not count
    lastHitAt += away;
    slowUntil += away;
    nextPowerupAt += away;
    if (powerup) powerup.born += away;
    state = 'PLAY';
    noCursor();
  }
}

// Browsers keep audio silent until the first click or key; this wakes it.
function unlockAudio() {
  if (typeof userStartAudio === 'function') {
    try {
      userStartAudio();
    } catch (e) {
      /* audio not available */
    }
  }
}

// ------------------------------------------------------------------- game flow

function startRun() {
  unlockAudio();
  resetGame();
  state = 'PLAY';
  startTime = millis();
  noCursor();
}

function resetGame() {
  player.x = width / 2;
  player.y = height * 0.7;
  player.vx = player.vy = 0;
  player.rot = SPRITE_HEADING;
  obstacles = [];
  for (let i = 0; i < START_OBSTACLES; i++) spawnObstacle(true); // they fly in from the edges
  lives = LIVES;
  score = 0;
  level = 1;
  shield = false;
  slowUntil = 0;
  powerup = null;
  burst = [];
  popups = [];
  nearMisses = 0;
  powerupsTaken = 0;
  newBest = false;
  lastHitAt = -Infinity;
  touchTarget = null;
  nextPowerupAt = millis() + random(...POWERUP_EVERY);
}

function endRun() {
  state = 'GAMEOVER';
  slowUntil = 0;
  touchTarget = null;
  cursor();
  if (score > best) {
    best = score;
    newBest = true;
    writeStore(BEST_KEY, best.toFixed(2));
  }
}

function updateLevel() {
  score = (millis() - startTime) / 1000;
  const next = 1 + floor(score / LEVEL_SECONDS);
  if (next > level) {
    level = next;
    popups.push(new Popup(`Level ${level}`, width / 2, height * 0.3, [255, 210, 90], 30));
  }
}

function speedFactor() {
  const ramp = min(MAX_SPEEDUP, 1 + (level - 1) * LEVEL_SPEEDUP);
  const slow = millis() < slowUntil ? SLOW_FACTOR : 1;
  return ramp * slow;
}

function targetObstacleCount() {
  return min(MAX_OBSTACLES, START_OBSTACLES + (level - 1));
}

// ------------------------------------------------------------------- player

function updatePlayer(ghost) {
  // keyboard: right minus left, down minus up
  let dx = (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) - (keyIsDown(65) || keyIsDown(LEFT_ARROW));
  let dy = (keyIsDown(83) || keyIsDown(DOWN_ARROW)) - (keyIsDown(87) || keyIsDown(UP_ARROW));

  // touch or a held mouse: fly towards the finger, at the same top speed
  if (touchTarget && !ghost && dx === 0 && dy === 0) {
    const tx = touchTarget.x - player.x;
    const ty = touchTarget.y - player.y;
    const d = Math.hypot(tx, ty);
    if (d > 6) {
      dx = tx / d;
      dy = ty / d;
    }
  }

  // diagonals are no faster than straight lines
  const len = Math.hypot(dx, dy);
  if (len > 1) {
    dx /= len;
    dy /= len;
  }
  player.vx = dx * player.speed;
  player.vy = dy * player.speed;

  if (!ghost) {
    player.x = constrain(player.x + player.vx, player.r, width - player.r);
    player.y = constrain(player.y + player.vy, player.r, height - player.r);
  }

  // turn smoothly to face the way the wasp is flying
  if (player.vx !== 0 || player.vy !== 0) {
    // player.rot is the flight heading; drawPlayer turns the picture to match it
    const want = Math.atan2(player.vy, player.vx);
    let diff = want - player.rot;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    player.rot += diff * 0.2;
  }
}

function drawPlayer(alpha) {
  push();
  translate(player.x, player.y);

  // shield bubble
  if (shield) {
    noFill();
    stroke(120, 200, 255, 160 + 60 * sin(frameCount * 0.15));
    strokeWeight(2.5);
    circle(0, 0, player.r * 2.9);
    noStroke();
  }

  // a little wing bob while flying
  const bob = player.vx || player.vy ? sin(frameCount * 0.6) * 0.04 : 0;
  rotate(player.rot - SPRITE_HEADING + bob);
  let a = alpha;
  // quick blink while safe after a hit
  if (state === 'PLAY' && millis() - lastHitAt < HIT_COOLDOWN && frameCount % 6 < 3) a = min(alpha, 110);

  if (waspImg) {
    tint(255, a);
    image(waspImg, 0, 0, player.r * 3, player.r * 3);
    noTint();
  } else {
    // drawn wasp, if the picture is missing
    noStroke();
    fill(255, 220, 0, a);
    ellipse(0, 0, player.r * 1.4, player.r * 2);
    fill(40, 40, 60, a);
    rect(-player.r * 0.7, -player.r * 0.15, player.r * 1.4, player.r * 0.3);
    triangle(0, player.r * 1.3, -player.r * 0.3, player.r * 0.8, player.r * 0.3, player.r * 0.8);
  }
  pop();
}

// ------------------------------------------------------------------- circles

function spawnObstacle(offscreen = false) {
  // a circle with a random size, position and speed
  const edge = floor(random(4));
  const r = random(14, 36);
  let x = random(width);
  let y = random(height);
  let vx = random(-2.2, 2.2) * OBSTACLE_SPEED_MULT;
  let vy = random(-2.2, 2.2) * OBSTACLE_SPEED_MULT;
  if (offscreen) {
    // start just outside the screen so they fly in
    if (edge === 0) { x = random(width); y = -r * 2; vy = random(0.6, 2.0) * OBSTACLE_SPEED_MULT; }
    if (edge === 1) { x = width + r * 2; y = random(height); vx = random(-2.0, -0.6) * OBSTACLE_SPEED_MULT; }
    if (edge === 2) { x = random(width); y = height + r * 2; vy = random(-2.0, -0.6) * OBSTACLE_SPEED_MULT; }
    if (edge === 3) { x = -r * 2; y = random(height); vx = random(0.6, 2.0) * OBSTACLE_SPEED_MULT; }
  }
  obstacles.push({ x, y, r, vx, vy, close: false });
}

function updateObstacles(moving) {
  while (obstacles.length < (state === 'PLAY' ? targetObstacleCount() : START_OBSTACLES)) spawnObstacle(true);
  const k = speedFactor();
  const slowed = millis() < slowUntil;

  for (const o of obstacles) {
    if (moving) {
      o.x += o.vx * k;
      o.y += o.vy * k;
    } else if (state === 'MENU') {
      // the menu keeps the circles moving as a preview
      o.x += o.vx;
      o.y += o.vy;
    }
    // bounce off the edges of the screen
    if (o.x < o.r && o.vx < 0) o.vx *= -1;
    if (o.x > width - o.r && o.vx > 0) o.vx *= -1;
    if (o.y < o.r && o.vy < 0) o.vy *= -1;
    if (o.y > height - o.r && o.vy > 0) o.vy *= -1;

    // a white outline so each circle is easy to see; icy while Slow is on
    stroke(255, 230);
    strokeWeight(1);
    noFill();
    circle(o.x, o.y, o.r * 2 + 2);
    noStroke();
    if (slowed) fill(150, 220, 255, 170);
    else fill(100, 150, 255, 160);
    circle(o.x, o.y, o.r * 2);
  }

  // every so often a small random nudge, so they feel alive
  if (moving && frameCount % 30 === 0) {
    for (const o of obstacles) {
      o.vx = constrain(o.vx + random(-0.15, 0.15), -2.5 * OBSTACLE_SPEED_MULT, 2.5 * OBSTACLE_SPEED_MULT);
      o.vy = constrain(o.vy + random(-0.15, 0.15), -2.5 * OBSTACLE_SPEED_MULT, 2.5 * OBSTACLE_SPEED_MULT);
    }
  }
}

function handleCollisions() {
  const now = millis();
  const safe = now - lastHitAt < HIT_COOLDOWN;

  for (const o of obstacles) {
    const gap = dist(player.x, player.y, o.x, o.y) - (player.r + o.r);
    if (gap < 0 && !safe) {
      // only one hit per cooldown, so a cluster can't take every life at once
      lastHitAt = now;
      // push the circle away a little
      o.x += (o.x - player.x) * 0.8;
      o.y += (o.y - player.y) * 0.8;
      if (shield) {
        shield = false;
        popups.push(new Popup('Shield!', player.x, player.y - 50, [120, 200, 255]));
        shake = 4;
        throwBurst(player.x, player.y, [120, 200, 255]);
      } else {
        lives = max(0, lives - 1);
        shake = 9;
        throwBurst(player.x, player.y, [255, 200, 60]);
        if (soundOn && hitSfx) {
          try {
            hitSfx.play();
          } catch (e) {
            /* audio not available */
          }
        }
      }
      break;
    }
    // near misses: count each circle once per pass, never during the safe second
    if (gap >= 0 && gap < NEAR_MISS && !safe) {
      if (!o.close) {
        o.close = true;
        nearMisses++;
        popups.push(new Popup('Close!', player.x, player.y - 46, [255, 255, 255], 16));
      }
    } else if (gap > NEAR_MISS * 3) {
      o.close = false;
    }
  }

  if (lives <= 0) endRun();
}

// ------------------------------------------------------------------- power-ups

const POWERUPS = {
  shield: { label: 'Shield', colour: [120, 200, 255] },
  slow: { label: 'Slow', colour: [150, 255, 210] },
  heart: { label: 'Heart', colour: [255, 110, 130] },
};

function updatePowerup() {
  const now = millis();
  if (!powerup && now > nextPowerupAt) {
    // hearts only appear when a life has been lost
    const kinds = lives < LIVES ? ['shield', 'slow', 'heart'] : ['shield', 'slow'];
    powerup = {
      kind: random(kinds),
      x: random(80, width - 80),
      y: random(100, height - 80),
      born: now,
    };
  }
  if (!powerup) return;
  if (now - powerup.born > POWERUP_LIFETIME) {
    powerup = null;
    nextPowerupAt = now + random(...POWERUP_EVERY);
    return;
  }
  if (dist(player.x, player.y, powerup.x, powerup.y) < player.r + 18) {
    const p = POWERUPS[powerup.kind];
    if (powerup.kind === 'shield') shield = true;
    if (powerup.kind === 'slow') slowUntil = now + SLOW_DURATION;
    if (powerup.kind === 'heart') lives = min(LIVES, lives + 1);
    powerupsTaken++;
    popups.push(new Popup(p.label, powerup.x, powerup.y - 40, p.colour, 24));
    throwBurst(powerup.x, powerup.y, p.colour);
    powerup = null;
    nextPowerupAt = now + random(...POWERUP_EVERY);
  }
}

function drawPowerup() {
  if (!powerup) return;
  const p = POWERUPS[powerup.kind];
  const age = millis() - powerup.born;
  // fade in, bob, and blink in the last two seconds
  const fade = min(1, age / 400) * (age > POWERUP_LIFETIME - 2000 && frameCount % 10 < 5 ? 0.4 : 1);
  const y = powerup.y + sin(frameCount * 0.08) * 5;
  push();
  translate(powerup.x, y);
  noStroke();
  fill(...p.colour, 40 * fade);
  circle(0, 0, 54);
  fill(...p.colour, 220 * fade);
  circle(0, 0, 30);
  fill(16, 16, 20, 230 * fade);
  if (powerup.kind === 'heart') {
    // a small heart
    beginShape();
    vertex(0, 7);
    bezierVertex(-12, -2, -6, -11, 0, -4);
    bezierVertex(6, -11, 12, -2, 0, 7);
    endShape(CLOSE);
  } else if (powerup.kind === 'shield') {
    beginShape();
    vertex(0, -9);
    vertex(8, -5);
    vertex(6, 5);
    vertex(0, 9);
    vertex(-6, 5);
    vertex(-8, -5);
    endShape(CLOSE);
  } else {
    // an hourglass for Slow
    triangle(-7, -8, 7, -8, 0, 0);
    triangle(-7, 8, 7, 8, 0, 0);
  }
  pop();
}

// ------------------------------------------------------------------- effects

function throwBurst(x, y, col) {
  for (let i = 0; i < 18; i++) {
    const a = random(TWO_PI);
    const s = random(1.5, 5);
    burst.push({ x, y, vx: cos(a) * s, vy: sin(a) * s, life: random(25, 45), col });
  }
}

function drawBurst() {
  noStroke();
  for (let i = burst.length - 1; i >= 0; i--) {
    const b = burst[i];
    b.x += b.vx;
    b.y += b.vy;
    b.vx *= 0.94;
    b.vy *= 0.94;
    b.life--;
    fill(...b.col, map(b.life, 0, 45, 0, 230));
    circle(b.x, b.y, 4);
    if (b.life <= 0) burst.splice(i, 1);
  }
}

class Popup {
  constructor(words, x, y, col, size = 20) {
    this.words = words;
    this.x = x;
    this.y = y;
    this.col = col;
    this.size = size;
    this.life = 50;
  }

  draw() {
    this.y -= 0.8;
    this.life--;
    noStroke();
    fill(...this.col, map(this.life, 0, 50, 0, 255));
    textSize(this.size);
    text(this.words, this.x, this.y);
  }
}

function drawPopups() {
  for (let i = popups.length - 1; i >= 0; i--) {
    popups[i].draw();
    if (popups[i].life <= 0) popups.splice(i, 1);
  }
}

// ------------------------------------------------------------------- background

function initSparkles() {
  // many tiny dots with random positions and a slow drift
  sparkles = [];
  for (let i = 0; i < 120; i++) {
    sparkles.push({
      x: random(width),
      y: random(height),
      d: random(1, 3),
      a: random(30, 120),
      vx: random(-0.2, 0.2),
      vy: random(-0.2, 0.2),
    });
  }
}

function drawBackground() {
  background(16, 16, 20);
  noStroke();
  for (const s of sparkles) {
    if (state !== 'PAUSE') {
      s.x += s.vx;
      s.y += s.vy;
    }
    if (s.x < -10) s.x = width + 10;
    if (s.x > width + 10) s.x = -10;
    if (s.y < -10) s.y = height + 10;
    if (s.y > height + 10) s.y = -10;
    fill(255, 255, 255, s.a);
    circle(s.x, s.y, s.d);
  }
}

// ------------------------------------------------------------------- screens

function drawHUD() {
  push();
  textAlign(LEFT, TOP);
  noStroke();

  // lives as small wasps (or dots, if the picture is missing)
  for (let i = 0; i < LIVES; i++) {
    const x = 26 + i * 30;
    const on = i < lives;
    if (waspImg) {
      tint(255, on ? 255 : 45);
      image(waspImg, x, 28, 30, 30);
      noTint();
    } else {
      fill(255, 220, 0, on ? 255 : 50);
      circle(x, 28, 16);
    }
  }
  if (shield) {
    noFill();
    stroke(120, 200, 255, 200);
    strokeWeight(2);
    circle(26 + LIVES * 30 + 4, 28, 22);
    noStroke();
  }

  fill(255);
  textSize(18);
  text(`${nf(score, 1, 2)}s`, 16, 50);
  fill(255, 255, 255, 150);
  textSize(15);
  text(`Level ${level}` + (best > 0 ? `   Best ${nf(best, 1, 2)}s` : ''), 16, 76);
  if (millis() < slowUntil && state === 'PLAY') {
    fill(150, 255, 210);
    text(`Slow ${ceil((slowUntil - millis()) / 1000)}`, 16, 98);
  }
  pop();
}

// a dark card behind text, so it stays readable over the moving circles
function panel(w, h, cy) {
  noStroke();
  fill(16, 16, 20, 200);
  rect(width / 2 - w / 2, cy - h / 2, w, h, 18);
}

function drawMenu() {
  push();
  panel(min(width - 24, 760), 280, height / 2 - 60);
  noStroke();
  fill(255);
  textSize(min(64, width / 9));
  text('Wasp Dodge+', width / 2, height / 2 - 150);
  textSize(min(22, width / 26));
  fill(255, 255, 255, 220);
  text("Avoid the circles. Hit 4 and it's game over.", width / 2, height / 2 - 92);
  text('Move with ARROWS or WASD, or drag. SPACE, click or tap to start.', width / 2, height / 2 - 62);
  text('P pauses. M mutes. R restarts at any time.', width / 2, height / 2 - 32);

  fill(255, 255, 255, 170);
  textSize(min(17, width / 32));
  text('Power-ups:  Shield blocks a hit  /  Slow halves their speed  /  Heart gives a life back', width / 2, height / 2 + 6);
  if (best > 0) {
    fill(255, 210, 90);
    text(`Your best: ${nf(best, 1, 2)} seconds`, width / 2, height / 2 + 40);
  }
  fill(255);
  textSize(min(20, width / 28));
  text('Click, tap or press SPACE to start', width / 2, height * 0.86);
  pop();
}

function drawPause() {
  push();
  fill(16, 16, 20, 170);
  rect(0, 0, width, height);
  fill(255);
  textSize(48);
  text('Paused', width / 2, height / 2 - 20);
  textSize(20);
  fill(255, 255, 255, 200);
  text('Press P or Esc to carry on', width / 2, height / 2 + 30);
  pop();
}

function drawGameOver() {
  push();
  panel(min(width - 24, 560), sadImg ? 380 : 260, height / 2 + (sadImg ? 20 : -30));
  noStroke();
  fill(255);
  textSize(min(52, width / 10));
  text('GAME OVER', width / 2, height / 2 - 110);
  textSize(26);
  text(`Final Score: ${nf(score, 1, 2)} sec`, width / 2, height / 2 - 60);
  textSize(18);
  if (newBest) {
    fill(255, 210, 90);
    text('A new best!', width / 2, height / 2 - 28);
  } else if (best > 0) {
    fill(255, 255, 255, 170);
    text(`Best: ${nf(best, 1, 2)} sec`, width / 2, height / 2 - 28);
  }
  fill(255, 255, 255, 170);
  text(`Level ${level}  /  ${nearMisses} near misses  /  ${powerupsTaken} power-ups`, width / 2, height / 2 + 2);
  fill(255);
  textSize(22);
  text('Press R, SPACE or tap to try again', width / 2, height / 2 + 42);
  if (sadImg) {
    tint(255, 140);
    image(sadImg, width / 2, height / 2 + 140, 96, 96);
    noTint();
  }
  pop();
}

// ------------------------------------------------------------------- storage

// The best score and the sound setting live in the browser. Storage can be
// blocked (private windows); the game then simply forgets them.
function readStore(k) {
  try {
    return localStorage.getItem(k);
  } catch (e) {
    return null;
  }
}

function writeStore(k, v) {
  try {
    localStorage.setItem(k, v);
  } catch (e) {
    /* storage unavailable */
  }
}
