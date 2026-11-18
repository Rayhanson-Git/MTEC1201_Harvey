// Draws the README artwork for Wasp Dodge+ into ../assets.
// Run from design/: npm install && npm run build
import fs from 'node:fs';
import path from 'node:path';
import { C, F, text, paragraph, label, svg, frame, arrow, key, write, r2, REDUCED, ROOT } from './lib.mjs';

// Colours from sketch.js
const CIRCLE = 'rgb(100,150,255)', SLOWC = 'rgb(150,220,255)', SHIELD = 'rgb(120,200,255)', SLOW = 'rgb(150,255,210)', HEART = 'rgb(255,110,130)', GOLD = 'rgb(255,210,90)';
const WASP = `data:image/png;base64,${fs.readFileSync(path.join(ROOT, 'design/wasp-small.png')).toString('base64')}`;

let seed = 5;
const rand = (a = 0, b = 1) => { seed = (seed * 16807) % 2147483647; return a + ((seed - 1) / 2147483646) * (b - a); };

const circle = (x, y, r, col = CIRCLE, op = 0.63) => `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(r + 1)}" stroke="#fff" stroke-opacity=".85"/><circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}" fill="${col}" fill-opacity="${op}"/>`;
const wasp = (x, y, size, rot = 0, op = 1) => `<image href="${WASP}" x="${r2(x - size / 2)}" y="${r2(y - size / 2)}" width="${size}" height="${size}" opacity="${op}" transform="rotate(${rot} ${r2(x)} ${r2(y)})"/>`;

function hero(H = 440, file = 'assets/hero.svg') {
  const W = 1280, dy = (H - 440) / 2;
  seed = 5;
  const style = `.drift{animation:drift ease-in-out infinite alternate}@keyframes drift{to{transform:translate(var(--dx),var(--dy))}}
.dodge{animation:dodge 5s ease-in-out infinite}@keyframes dodge{0%,100%{transform:translate(0,0)}35%{transform:translate(-26px,18px)}70%{transform:translate(20px,-10px)}}${REDUCED}`;
  let field = '';
  const spots = [[760, 120, 34], [880, 300, 26], [1010, 140, 20], [1150, 260, 36], [1080, 380, 18], [720, 340, 22], [930, 80, 16], [1210, 110, 24], [820, 210, 14]];
  spots.forEach(([x, y, r], i) => {
    field += `<g class="drift" style="--dx:${r2(rand(-30, 30))}px;--dy:${r2(rand(-24, 24))}px;animation-duration:${r2(rand(2.6, 5))}s">${circle(x, y + dy, r)}</g>`;
  });
  let stars = '';
  for (let i = 0; i < 80; i++) stars += `<circle cx="${r2(rand(10, W - 10))}" cy="${r2(rand(10, H - 10))}" r="${r2(rand(0.5, 1.4))}" fill="#fff" opacity="${r2(rand(0.1, 0.4))}"/>`;
  const body = frame(W, H, { fill: '#101014' }) + `<g clip-path="url(#clip)">${stars}${field}` +
    `<g class="dodge"><circle cx="965" cy="${235 + dy}" r="44" stroke="${SHIELD}" stroke-width="2.5" opacity=".8"/>${wasp(965, 235 + dy, 84, 20)}</g></g>` +
    label('Browser game · p5.js · 2025', { x: 64, y: 118 + dy }) +
    text('Wasp Dodge+', { font: F.display, size: 62, x: 62, y: 190 + dy, fill: C.ink }) +
    paragraph('Guide a wasp through moving circles and stay in play for as long as you can. Four lives, a second of grace after each hit, and every second you survive is a point.', { x: 64, y: 240 + dy, width: 540, size: 19 }).svg +
    label('Arrows / WASD · drag · Space · R', { x: 64, y: 360 + dy, fill: C.accent2 });
  write(file, svg(W, H, body, {
    title: 'Wasp Dodge+',
    desc: 'A browser game in p5.js: a wasp inside a shield bubble dodges blue circles drifting across a dark, starry field.',
    style, defs: `<clipPath id="clip"><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="23"/></clipPath>`,
  }));
}

// How a run works: lives and the grace second, the level ramp, the power-ups.
function run() {
  const W = 1280, H = 700;
  let b = frame(W, H);
  b += label('How a run works', { x: 56, y: 64 }) + text('Four lives, one more second', { font: F.display, size: 30, x: 56, y: 104, fill: C.ink });

  // 1. lives and cooldown timeline
  const tx = 56, ty = 150, tw = W - 112;
  b += `<rect x="${tx}" y="${ty}" width="${tw}" height="150" rx="16" fill="${C.paper2}" stroke="${C.rule}"/>`;
  b += text('Hits', { font: F.display, size: 20, x: tx + 24, y: ty + 38, fill: C.ink });
  b += paragraph('Each circle you touch costs one life. For the next second the wasp blinks and nothing can hit it, so a cluster never takes every life at once.', { x: tx + 24, y: ty + 66, width: 330, size: 14 }).svg;
  const lx = tx + 400, lw = tw - 430, ly = ty + 92;
  b += `<path d="M${lx} ${ly}H${lx + lw}" stroke="${C.haze}" stroke-width="1.5"/>`;
  const hits = [0.12, 0.42, 0.7, 0.9];
  hits.forEach((h, i) => {
    const x = lx + h * lw, gw = lw * 0.09;
    if (i < 3) b += `<rect x="${r2(x)}" y="${ly - 14}" width="${r2(gw)}" height="28" rx="6" fill="${SHIELD}" fill-opacity=".14" stroke="${SHIELD}" stroke-opacity=".5"/>`;
    b += `<circle cx="${r2(x)}" cy="${ly}" r="7" fill="${C.accent2}"/>`;
    b += text(`${3 - i} left`, { font: F.mono, size: 12, x: x, y: ly + 36, fill: i === 3 ? C.accent2 : C.ink2, anchor: 'middle' });
  });
  b += text('1 s of grace', { font: F.mono, size: 12, x: lx + 0.12 * lw + lw * 0.045, y: ly - 24, fill: SHIELD, anchor: 'middle' });
  b += text('game over', { font: F.mono, size: 12, x: lx + 0.9 * lw, y: ly - 24, fill: C.accent2, anchor: 'middle' });
  for (let i = 0; i < 4; i++) b += wasp(lx + i * 30, ty + 34, 28, 0, i < 3 ? 1 : 0.25);

  // 2. level ramp chart
  const cx = 56, cy = 324, cw = (W - 112 - 24) / 2, ch = 340;
  b += `<rect x="${cx}" y="${cy}" width="${r2(cw)}" height="${ch}" rx="16" fill="${C.paper2}" stroke="${C.rule}"/>`;
  b += text('Levels', { font: F.display, size: 20, x: cx + 24, y: cy + 38, fill: C.ink });
  b += paragraph('Every 15 seconds: one more circle (12 up to 24) and 6% more speed (up to 1.6 times).', { x: cx + 24, y: cy + 66, width: cw - 48, size: 14 }).svg;
  const gx = cx + 60, gy = cy + 300, gw = cw - 96, gh = 170;
  b += `<path d="M${gx} ${gy - gh}V${gy}H${gx + gw}" stroke="${C.haze}"/>`;
  let dC = '', dS = '';
  for (let lvl = 1; lvl <= 14; lvl++) {
    const x0 = gx + ((lvl - 1) / 14) * gw, x1 = gx + (lvl / 14) * gw;
    const n = Math.min(24, 12 + lvl - 1), sp = Math.min(1.6, 1 + (lvl - 1) * 0.06);
    const yc = gy - ((n - 10) / 16) * gh, ys = gy - ((sp - 0.9) / 0.8) * gh;
    dC += `${lvl === 1 ? 'M' : 'L'}${r2(x0)} ${r2(yc)}H${r2(x1)}`;
    dS += `${lvl === 1 ? 'M' : 'L'}${r2(x0)} ${r2(ys)}H${r2(x1)}`;
  }
  b += `<path d="${dC}" stroke="${CIRCLE}" stroke-width="2.5"/><path d="${dS}" stroke="${GOLD}" stroke-width="2.5" stroke-dasharray="6 5"/>`;
  [0, 60, 120, 180].forEach((t) => b += text(`${t}s`, { font: F.mono, size: 11, x: gx + (t / 210) * gw, y: gy + 18, fill: C.muted, anchor: 'middle' }));
  b += text('circles  12 to 24', { font: F.mono, size: 12, x: gx + 14, y: gy - gh * 0.62, fill: CIRCLE });
  b += text('speed  1.0 to 1.6 x', { font: F.mono, size: 12, x: gx + 14, y: gy - gh * 0.62 - 22, fill: GOLD });

  // 3. power-ups
  const px = cx + cw + 24;
  b += `<rect x="${r2(px)}" y="${cy}" width="${r2(cw)}" height="${ch}" rx="16" fill="${C.paper2}" stroke="${C.rule}"/>`;
  b += text('Power-ups', { font: F.display, size: 20, x: px + 24, y: cy + 38, fill: C.ink });
  b += paragraph('One drifts in every 9 to 15 seconds and fades after 8. Fly through it to take it.', { x: px + 24, y: cy + 66, width: cw - 48, size: 14 }).svg;
  const items = [
    ['Shield', SHIELD, 'Blocks the next hit. A bubble shows it is up.', 'M0 -9L8 -5L6 5L0 9L-6 5L-8 -5Z'],
    ['Slow', SLOW, 'Circles move at half speed for 5 seconds, and turn icy.', 'M-7 -8H7L0 0ZM-7 8H7L0 0Z'],
    ['Heart', HEART, 'Gives back a lost life, never more than four. Only offered after a hit.', 'M0 7C-12 -2 -6 -11 0 -4C6 -11 12 -2 0 7Z'],
  ];
  items.forEach(([name, col, desc, d], i) => {
    const y = cy + 140 + i * 66, x = px + 48;
    b += `<circle cx="${x}" cy="${y}" r="26" fill="${col}" fill-opacity=".16"/><circle cx="${x}" cy="${y}" r="15" fill="${col}"/>`;
    b += `<path d="${d}" transform="translate(${x} ${y})" fill="#101014"/>`;
    b += text(name, { font: F.mono, size: 14, x: x + 42, y: y - 6, fill: col });
    b += paragraph(desc, { x: x + 42, y: y + 15, width: cw - 130, size: 13.5, maxLines: 2 }).svg;
  });
  write('assets/run.svg', svg(W, H, b, {
    title: 'How a run works',
    desc: 'Four lives; each hit costs one and gives one second of grace. Every 15 seconds the level goes up: one more circle, from 12 to 24, and 6 percent more speed, up to 1.6 times. A power-up appears every 9 to 15 seconds and fades after 8: Shield blocks the next hit, Slow halves the circles speed for 5 seconds, Heart gives a lost life back, never more than four.',
  }));
}

hero(); hero(640, 'design/social.svg'); run();
