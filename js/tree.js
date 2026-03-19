// ===== tree.js =====
// Canvas への桜の木の描画ロジック

/** シード固定の疑似乱数ジェネレータ */
function seededRand(seed) {
  let s = seed + 1;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** progress (0〜1) に応じて桜の木を canvas に描画する */
function drawTree(canvas, progress) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  _drawGround(ctx, W, H);

  if (progress <= 0) {
    _drawSeed(ctx, W, H); return;
  }

  const baseX = W / 2, baseY = H - 22;
  const trunkGrowth = Math.min(progress / 0.25, 1);
  const trunkH = Math.max(12, 100 * trunkGrowth);
  const trunkW = Math.max(3,  11  * trunkGrowth);
  const topY   = baseY - trunkH;

  ctx.save();
  ctx.beginPath(); ctx.rect(2, 2, W - 4, H - 4); ctx.clip();

  _drawRoots(ctx, baseX, baseY, trunkGrowth);
  _drawTrunk(ctx, baseX, baseY, topY, trunkH, trunkW);

  if (progress >= 0.07) _drawBranches(ctx, baseX, baseY, topY, trunkH, trunkW, progress);
  if (progress >= 0.8)  _drawBlossoms(ctx, baseX, topY, progress);

  ctx.restore();
  ctx.globalAlpha = 1;
}

// ---- 内部描画関数 ----

function _drawGround(ctx, W, H) {
  const grad = ctx.createLinearGradient(0, H - 30, 0, H);
  grad.addColorStop(0, '#2a1f0a'); grad.addColorStop(1, '#1a0f05');
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.ellipse(W / 2, H, W * 0.75, 30, 0, Math.PI, 0); ctx.fill();

  const gr = seededRand(99);
  for (let i = 0; i < 16; i++) {
    const x = W * 0.05 + gr() * W * 0.9, h = 5 + gr() * 8;
    ctx.strokeStyle = `rgba(45,85,25,${0.2 + gr() * 0.35})`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, H - 18);
    ctx.quadraticCurveTo(x + (gr() - 0.5) * 8, H - 18 - h * 0.5, x + (gr() - 0.5) * 6, H - 18 - h);
    ctx.stroke();
  }
}

function _drawSeed(ctx, W, H) {
  ctx.fillStyle = '#8B5E3C';
  ctx.beginPath(); ctx.ellipse(W / 2, H - 20, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
}

function _drawRoots(ctx, baseX, baseY, growth) {
  const rR = seededRand(77);
  for (let i = 0; i < 5; i++) {
    const a = Math.PI * 0.78 + (i / 4) * Math.PI * 1.44;
    const len = 14 + rR() * 8;
    ctx.strokeStyle = `rgba(80,45,15,${growth * 0.85})`;
    ctx.lineWidth = 2.5 + rR() * 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(baseX, baseY - 3);
    ctx.quadraticCurveTo(baseX + Math.cos(a) * len * 0.6, baseY + 2, baseX + Math.cos(a) * len, baseY - 1);
    ctx.stroke();
  }
}

function _drawTrunk(ctx, baseX, baseY, topY, trunkH, trunkW) {
  const tg = ctx.createLinearGradient(baseX - trunkW, 0, baseX + trunkW, 0);
  tg.addColorStop(0,   '#3a1e08'); tg.addColorStop(0.22, '#7a4e22');
  tg.addColorStop(0.50,'#a06830'); tg.addColorStop(0.78, '#7a4e22'); tg.addColorStop(1, '#3a1e08');
  ctx.fillStyle = tg;
  ctx.beginPath();
  ctx.moveTo(baseX - trunkW, baseY); ctx.lineTo(baseX - trunkW * 0.85, topY);
  ctx.lineTo(baseX + trunkW * 0.85, topY); ctx.lineTo(baseX + trunkW, baseY);
  ctx.closePath(); ctx.fill();

  // ハイライト
  ctx.strokeStyle = 'rgba(180,120,60,0.18)';
  ctx.lineWidth = trunkW * 0.22; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(baseX - trunkW * 0.28, baseY - trunkH * 0.05);
  ctx.lineTo(baseX - trunkW * 0.18, topY + 5); ctx.stroke();

  // 樹皮テクスチャ
  const bR = seededRand(55);
  for (let i = 0; i < 7; i++) {
    const by = baseY - trunkH * (0.1 + bR() * 0.8), bw = trunkW * (0.5 + bR() * 0.4);
    ctx.strokeStyle = `rgba(10,4,0,${0.10 + bR() * 0.12})`; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(baseX - bw, by);
    ctx.bezierCurveTo(baseX - bw * 0.3, by - 3, baseX + bw * 0.4, by + 2, baseX + bw, by - 1); ctx.stroke();
  }
}

function _drawBranches(ctx, baseX, baseY, topY, trunkH, trunkW, progress) {
  const bg = Math.min(Math.max((progress - 0.07) / 0.73, 0), 1);

  function branchColor(width) {
    const t = Math.min(width / 6, 1);
    return `rgb(${Math.floor(58 + t * 62)},${Math.floor(36 + t * 42)},${Math.floor(16 + t * 20)})`;
  }

  function drawBranch(x, y, angle, length, width, depth, grow, spread) {
    if (depth <= 0 || length < 2 || grow <= 0) return;
    const len = length * Math.min(grow * 1.8, 1);
    if (len < 1.5) return;
    const ex = x + Math.cos(angle) * len, ey = y + Math.sin(angle) * len;
    ctx.strokeStyle = branchColor(width);
    ctx.lineWidth = width; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.quadraticCurveTo((x+ex)/2 + Math.sin(angle)*width*0.6, (y+ey)/2 - Math.cos(angle)*width*0.2, ex, ey);
    ctx.stroke();
    if (depth <= 1) return;
    const cg = Math.max(0, (grow - 0.12) / 0.88);
    drawBranch(ex, ey, angle - spread,        length * 0.66, width * 0.63, depth-1, cg, spread * 0.88);
    drawBranch(ex, ey, angle + spread * 0.88, length * 0.63, width * 0.61, depth-1, cg, spread * 0.88);
    if (depth >= 4 && grow > 0.45)
      drawBranch(ex, ey, angle - spread * 0.1, length * 0.52, width * 0.50, depth-2, cg * 0.70, spread * 0.84);
  }

  const dep = progress < 0.2 ? 4 : progress < 0.4 ? 5 : progress < 0.6 ? 6 : 7;
  const startY = topY + trunkW * 0.8;

  // 先端から扇状に主枝
  const mainBranches = [
    { a: -Math.PI/2-0.40, l: 52, w: 5.0, sp: 0.36 },
    { a: -Math.PI/2+0.38, l: 50, w: 5.0, sp: 0.34 },
    { a: -Math.PI/2-0.75, l: 44, w: 4.2, sp: 0.33 },
    { a: -Math.PI/2+0.72, l: 42, w: 4.2, sp: 0.33 },
    { a: -Math.PI/2-0.12, l: 48, w: 4.6, sp: 0.38 },
    { a: -Math.PI/2+0.12, l: 46, w: 4.6, sp: 0.38 },
  ];
  mainBranches.forEach(b => drawBranch(baseX, startY, b.a, b.l, b.w, dep, bg, b.sp));

  if (progress > 0.25) {
    const og = Math.min((progress - 0.25) / 0.55, 1);
    drawBranch(baseX, startY, -Math.PI/2-1.05, 36, 3.2, dep-1, og, 0.31);
    drawBranch(baseX, startY, -Math.PI/2+1.00, 34, 3.2, dep-1, og, 0.31);
  }
  if (progress > 0.2) {
    const mg = Math.min((progress - 0.2) / 0.6, 1);
    const mY = topY + trunkH * 0.30;
    drawBranch(baseX, mY, -Math.PI/2-0.85, 36, 3.0, dep-2, mg, 0.32);
    drawBranch(baseX, mY, -Math.PI/2+0.82, 34, 3.0, dep-2, mg, 0.32);
  }
}

function _drawBlossoms(ctx, baseX, topY, progress) {
  const bp = (progress - 0.8) / 0.2;
  const cX = baseX, cY = topY - 16;
  const cRX = 90 + bp * 12, cRY = 85 + bp * 10;

  function drawSakuraFlower(cx, cy, r, rot, alpha) {
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.translate(cx, cy); ctx.rotate(rot);
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2;
      ctx.save();
      ctx.translate(Math.cos(a) * r * 0.50, Math.sin(a) * r * 0.50);
      ctx.rotate(a + Math.PI * 0.5);
      const pg = ctx.createRadialGradient(0, -r*0.1, 0, 0, 0, r*0.9);
      pg.addColorStop(0, '#fff0f5'); pg.addColorStop(0.3, '#ffd5e5'); pg.addColorStop(1, '#ffb0cc');
      ctx.fillStyle = pg; ctx.beginPath();
      ctx.ellipse(0, 0, r*0.38, r*0.62, 0, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle = 'rgba(220,100,140,0.25)'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(0, -r*0.58); ctx.lineTo(0, r*0.05); ctx.stroke();
      ctx.restore();
    }
    ctx.beginPath(); ctx.arc(0, 0, r*0.15, 0, Math.PI*2); ctx.fillStyle = '#ffe570'; ctx.fill();
    for (let s = 0; s < 5; s++) {
      const sa = (s / 5) * Math.PI * 2;
      ctx.beginPath(); ctx.arc(Math.cos(sa)*r*0.25, Math.sin(sa)*r*0.25, r*0.05, 0, Math.PI*2);
      ctx.fillStyle = '#ffcc00'; ctx.fill();
    }
    ctx.restore();
  }

  // 背景グロー
  ctx.globalAlpha = 0.16 * bp;
  const glow = ctx.createRadialGradient(cX, cY, 0, cX, cY, cRX * 0.85);
  glow.addColorStop(0, '#ffe0ee'); glow.addColorStop(0.6, '#ffb7c540'); glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow; ctx.beginPath(); ctx.ellipse(cX, cY, cRX*0.85, cRY*0.85, 0, 0, Math.PI*2); ctx.fill();
  ctx.globalAlpha = 1;

  // 3層の花（奥→中→手前）
  const layers = [
    { seed: 11, count: 90,  rMin: 2.8, rAdd: 2.8, alphaBase: 0.30, alphaAdd: 0.28, dFn: r => r },
    { seed: 22, count: 130, rMin: 3.5, rAdd: 4.0, alphaBase: 0.55, alphaAdd: 0.35, dFn: r => Math.sqrt(r), dScale: 0.94 },
    { seed: 33, count: 70,  rMin: 4.5, rAdd: 4.5, alphaBase: 0.65, alphaAdd: 0.35, dMin: 0.62, dAdd: 0.40 },
  ];
  layers.forEach(({ seed, count, rMin, rAdd, alphaBase, alphaAdd, dFn, dScale, dMin, dAdd }) => {
    const rng = seededRand(seed);
    for (let i = 0; i < Math.floor(bp * count); i++) {
      const a = rng() * Math.PI * 2;
      const d = dMin !== undefined ? dMin + rng() * dAdd : (dFn ? dFn(rng()) : rng());
      const ds = dScale || 1;
      const fx = cX + Math.cos(a) * cRX * d * ds;
      const fy = cY + Math.sin(a) * cRY * d * ds;
      drawSakuraFlower(fx, fy, rMin + rng() * rAdd, rng() * Math.PI * 2, (alphaBase + rng() * alphaAdd) * bp);
    }
  });

  // 散る花びら
  if (bp > 0.6) {
    const rP = seededRand(77);
    const pCount = Math.floor((bp - 0.6) / 0.4 * 20);
    for (let i = 0; i < pCount; i++) {
      const px = baseX + (rP() - 0.5) * 160, py = cY + 20 + rP() * 75, pr = 2 + rP() * 3.5;
      ctx.save(); ctx.globalAlpha = 0.5 * (bp-0.6)/0.4 * (1 - (py-cY-20)/80);
      ctx.translate(px, py); ctx.rotate(rP() * Math.PI * 2);
      const pg2 = ctx.createRadialGradient(0, 0, 0, 0, 0, pr);
      pg2.addColorStop(0, '#fff0f5'); pg2.addColorStop(1, '#ffb7c5');
      ctx.fillStyle = pg2; ctx.beginPath();
      ctx.ellipse(0, 0, pr, pr*0.5, 0, 0, Math.PI*2); ctx.fill(); ctx.restore();
    }
  }
}

/** progress に応じたステージ情報を返す */
function getStageInfo(progress) {
  if (progress === 0)   return { label: '🌰 種',      msg: '日報を送って芽吹かせよう！' };
  if (progress < 0.1)  return { label: '🌱 新芽',    msg: '日報まだー？🌸\n早く送ってよ〜！' };
  if (progress < 0.3)  return { label: '🌿 若木',    msg: 'もっと送って！\nすくすく育ってるよ！' };
  if (progress < 0.5)  return { label: '🌳 中木',    msg: '半分まできたね！\nこの調子で頑張れ〜！' };
  if (progress < 0.75) return { label: '🌸 大木',    msg: 'もうすぐ満開だ！\n日報も忘れずに！' };
  if (progress < 1)    return { label: '🌸 満開前夜', msg: 'あと少し！！\n日報送ったら完成だよ〜！' };
  return                      { label: '🌸🌸 完全満開', msg: '完璧！！\n1年間お疲れ様でした🎉' };
}
