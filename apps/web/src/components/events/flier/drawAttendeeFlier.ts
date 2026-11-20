/**
 * Canvas renderer for the personalised attendee flier.
 *
 * Everything event-specific lives in FLIER_THEME so the next event only needs
 * that object (and, if the look changes, the background/title helpers) updated.
 */

export const CANVAS_WIDTH = 1080;
export const CANVAS_HEIGHT = 1350;

export const FLIER_THEME = {
  eventName: "Grace Convention",
  fileSlug: "grace-convention-2026",
  church: ["ABIDING WORD OF", "GRACE MISSIONS"],
  titleLines: { top: "CELEBATION", middle: "OF", bottom: "GRACE" },
  themeLead: "The Power of The",
  themeMain: "HIGHEST",
  scripture: "Text: Luke 1:35",
  dates: "10TH - 12TH, DEC., 2026",
  dailyTime: "5PM DAILY",
  specialService: "13TH, SUNDAY | THANKSGIVING",
  specialServiceTime: "9AM PROMPT",
  venue: "1, Makanjuola Layout, Sawmill Dogo Apata, Ibadan",
  attendingLabel: "I WILL BE ATTENDING",
};

export const PHOTO_CIRCLE = { x: 540, y: 760, radius: 148 };

const COLORS = {
  redDeep: "#5E050B",
  red: "#C8121C",
  redBright: "#E3262E",
  gold: "#F5B21A",
  goldLight: "#FFE27A",
  yellow: "#FDE047",
  navy: "#0B1B3F",
  white: "#FFFFFF",
};

export interface FlierFonts {
  /** Heavy display serif for the 3D gold title. */
  display: string;
  /** Heavy sans for everything else. */
  sans: string;
}

export interface DrawFlierOptions {
  logo: HTMLImageElement | null;
  /** Optional full-bleed artwork that replaces the drawn background/header/title. */
  template?: HTMLImageElement | null;
  photo: HTMLImageElement | null;
  zoom: number;
  panX: number;
  panY: number;
  name: string;
  fonts: FlierFonts;
}

// ---------------------------------------------------------------------------
// Static decoration data
// ---------------------------------------------------------------------------

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
  glowRadius?: number;
  sparkle?: boolean;
}

// Deterministic LCG so particles stay put between re-renders.
function createSeededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const STATIC_PARTICLES: Particle[] = (() => {
  const rand = createSeededRandom(20261210);
  const particles: Particle[] = [];

  // Warm ambient bokeh
  for (let i = 0; i < 12; i++) {
    particles.push({
      x: rand() * CANVAS_WIDTH,
      y: rand() * 900 + 40,
      radius: rand() * 55 + 25,
      color: rand() > 0.5 ? "255, 196, 77" : "255, 120, 90",
      alpha: rand() * 0.06 + 0.03,
    });
  }

  // Gold embers
  for (let i = 0; i < 70; i++) {
    particles.push({
      x: rand() * CANVAS_WIDTH,
      y: rand() * 1000,
      radius: rand() * 2.6 + 1.1,
      color: rand() > 0.3 ? "255, 214, 102" : "255, 240, 220",
      alpha: rand() * 0.45 + 0.2,
      glowRadius: rand() * 8 + 4,
    });
  }

  // Crisp sparkles
  for (let i = 0; i < 20; i++) {
    particles.push({
      x: rand() * (CANVAS_WIDTH - 120) + 60,
      y: rand() * 560 + 140,
      radius: rand() * 2 + 1.5,
      color: "255, 255, 255",
      alpha: rand() * 0.6 + 0.35,
      sparkle: true,
    });
  }

  return particles;
})();

let cachedNoiseCanvas: HTMLCanvasElement | null = null;

function getNoisePattern(ctx: CanvasRenderingContext2D): CanvasPattern | null {
  if (typeof document === "undefined") return null;
  if (!cachedNoiseCanvas) {
    const noiseCanvas = document.createElement("canvas");
    noiseCanvas.width = 256;
    noiseCanvas.height = 256;
    const nCtx = noiseCanvas.getContext("2d");
    if (!nCtx) return null;
    const imgData = nCtx.createImageData(256, 256);
    const buffer = new Uint32Array(imgData.data.buffer);
    for (let i = 0; i < buffer.length; i++) {
      const val = Math.floor(Math.random() * 255);
      buffer[i] = (22 << 24) | (val << 16) | (val << 8) | val;
    }
    nCtx.putImageData(imgData, 0, 0);
    cachedNoiseCanvas = noiseCanvas;
  }
  return ctx.createPattern(cachedNoiseCanvas, "repeat");
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

/** Shrinks the font size until `text` fits in `maxWidth`, then sets ctx.font. */
function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  weight: string | number,
  size: number,
  family: string,
  maxWidth: number,
  minSize = 16,
): number {
  let s = size;
  ctx.font = `${weight} ${s}px ${family}`;
  while (s > minSize && ctx.measureText(text).width > maxWidth) {
    s -= 1;
    ctx.font = `${weight} ${s}px ${family}`;
  }
  return s;
}

/** Center-aligned 3D gold lettering with brown extrusion and drop shadow. */
function drawGoldText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  baseline: number,
  size: number,
  family: string,
  maxWidth: number,
) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.letterSpacing = "0px";
  const s = fitFont(ctx, text, 900, size, family, maxWidth);
  const depth = Math.max(4, Math.round(s * 0.07));

  // Soft drop shadow
  ctx.save();
  ctx.shadowColor = "rgba(50, 0, 0, 0.65)";
  ctx.shadowBlur = s * 0.2;
  ctx.shadowOffsetY = depth + 4;
  ctx.fillStyle = "#4A2400";
  ctx.fillText(text, cx, baseline + depth);
  ctx.restore();

  // Extrusion
  for (let i = depth; i > 0; i--) {
    ctx.fillStyle = i > depth / 2 ? "#5C3103" : "#8A5208";
    ctx.fillText(text, cx, baseline + i);
  }

  // Outline
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(2, s * 0.045);
  ctx.strokeStyle = "#6B3A02";
  ctx.strokeText(text, cx, baseline);

  // Gold face
  const face = ctx.createLinearGradient(0, baseline - s * 0.75, 0, baseline);
  face.addColorStop(0, "#FFF8D2");
  face.addColorStop(0.3, "#FFDD55");
  face.addColorStop(0.55, "#F2AE14");
  face.addColorStop(0.72, "#FFE68C");
  face.addColorStop(1, "#C3830A");
  ctx.fillStyle = face;
  ctx.fillText(text, cx, baseline);

  // Top glint
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const glint = ctx.createLinearGradient(0, baseline - s * 0.75, 0, baseline - s * 0.45);
  glint.addColorStop(0, "rgba(255, 255, 255, 0.35)");
  glint.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = glint;
  ctx.fillText(text, cx, baseline);
  ctx.restore();

  ctx.restore();
}

function drawCalendarIcon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = size * 0.08;
  const top = y + size * 0.14;
  ctx.beginPath();
  ctx.roundRect(x, top, size, size * 0.86, size * 0.12);
  ctx.stroke();
  // Header band
  ctx.fillRect(x, top, size, size * 0.2);
  // Binder rings
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x + size * 0.28, y);
  ctx.lineTo(x + size * 0.28, top + size * 0.12);
  ctx.moveTo(x + size * 0.72, y);
  ctx.lineTo(x + size * 0.72, top + size * 0.12);
  ctx.stroke();
  // Day grid
  const cell = size * 0.13;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      ctx.fillRect(
        x + size * 0.14 + c * size * 0.2,
        top + size * 0.3 + r * size * 0.17,
        cell,
        cell,
      );
    }
  }
  ctx.restore();
}

function drawClockIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = r * 0.18;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx, cy - r * 0.6);
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + r * 0.45, cy + r * 0.25);
  ctx.stroke();
  ctx.restore();
}

function drawPinIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
  holeColor: string,
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI * 0.85, Math.PI * 0.15);
  ctx.lineTo(cx, cy + r * 2.1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = holeColor;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

function drawBackground(ctx: CanvasRenderingContext2D) {
  // Base crimson gradient
  const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  bg.addColorStop(0, "#7A0810");
  bg.addColorStop(0.22, "#B80F1A");
  bg.addColorStop(0.5, "#D81E25");
  bg.addColorStop(0.78, "#A50D16");
  bg.addColorStop(1, COLORS.redDeep);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Warm stage glow behind the title
  const glow = ctx.createRadialGradient(540, 250, 40, 540, 250, 620);
  glow.addColorStop(0, "rgba(255, 176, 48, 0.55)");
  glow.addColorStop(0.4, "rgba(255, 96, 24, 0.22)");
  glow.addColorStop(1, "rgba(255, 60, 0, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Corner light washes (orange top-left, pink top-right)
  const tl = ctx.createRadialGradient(80, 60, 10, 80, 60, 420);
  tl.addColorStop(0, "rgba(255, 210, 120, 0.45)");
  tl.addColorStop(1, "rgba(255, 140, 40, 0)");
  ctx.fillStyle = tl;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const tr = ctx.createRadialGradient(1020, 340, 10, 1020, 340, 380);
  tr.addColorStop(0, "rgba(255, 150, 200, 0.28)");
  tr.addColorStop(1, "rgba(255, 80, 140, 0)");
  ctx.fillStyle = tr;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Stage light rig cluster (top-left)
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const lx = 26 + c * 34 + (r % 2) * 10;
      const ly = 40 + r * 34;
      const lg = ctx.createRadialGradient(lx, ly, 0, lx, ly, 20);
      lg.addColorStop(0, "rgba(255, 255, 255, 0.55)");
      lg.addColorStop(0.5, "rgba(255, 220, 240, 0.18)");
      lg.addColorStop(1, "rgba(255, 200, 220, 0)");
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.arc(lx, ly, 20, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Silk swirl: concentric rotated ellipses with alternating light/dark bands
  ctx.save();
  ctx.translate(640, 640);
  ctx.rotate(-0.22);
  for (let i = 0; i < 9; i++) {
    const rx = 260 + i * 70;
    const ry = 120 + i * 38;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, Math.PI * 0.95, Math.PI * 2.25);
    ctx.lineWidth = 26 + i * 3;
    ctx.strokeStyle =
      i % 2 === 0 ? "rgba(255, 110, 110, 0.10)" : "rgba(70, 0, 6, 0.16)";
    ctx.shadowColor = i % 2 === 0 ? "rgba(255, 140, 140, 0.3)" : "rgba(0,0,0,0)";
    ctx.shadowBlur = 24;
    ctx.stroke();
  }
  ctx.restore();

  // Flowing silk sweep across the lower middle
  ctx.save();
  const sweep = ctx.createLinearGradient(0, 700, CANVAS_WIDTH, 900);
  sweep.addColorStop(0, "rgba(255, 90, 90, 0)");
  sweep.addColorStop(0.5, "rgba(255, 120, 120, 0.16)");
  sweep.addColorStop(1, "rgba(255, 90, 90, 0)");
  ctx.fillStyle = sweep;
  ctx.beginPath();
  ctx.moveTo(0, 860);
  ctx.bezierCurveTo(300, 700, 700, 1000, CANVAS_WIDTH, 760);
  ctx.lineTo(CANVAS_WIDTH, 840);
  ctx.bezierCurveTo(700, 1060, 300, 780, 0, 940);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Halftone dots (lower-left texture)
  ctx.save();
  for (let r = 0; r < 14; r++) {
    for (let c = 0; c < 16; c++) {
      const dx = 20 + c * 18;
      const dy = 620 + r * 18;
      const fade = 1 - (c / 16) * 0.9 - (r / 14) * 0.3;
      if (fade <= 0) continue;
      ctx.fillStyle = `rgba(255, 170, 170, ${0.1 * fade})`;
      ctx.beginPath();
      ctx.arc(dx, dy, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Particles
  ctx.save();
  for (const p of STATIC_PARTICLES) {
    if (p.sparkle) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(${p.color}, ${p.alpha * 0.75})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-p.radius * 3.2, 0);
      ctx.lineTo(p.radius * 3.2, 0);
      ctx.moveTo(0, -p.radius * 3.2);
      ctx.lineTo(0, p.radius * 3.2);
      ctx.stroke();
      ctx.restore();
    } else {
      const r = p.glowRadius ?? p.radius;
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      const a = p.glowRadius ? p.alpha : p.alpha * 1.5;
      g.addColorStop(0, `rgba(${p.color}, ${a})`);
      g.addColorStop(0.5, `rgba(${p.color}, ${a * 0.4})`);
      g.addColorStop(1, `rgba(${p.color}, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Film grain
  ctx.save();
  const noise = getNoisePattern(ctx);
  if (noise) {
    ctx.fillStyle = noise;
    ctx.globalCompositeOperation = "overlay";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
  ctx.restore();

  // Edge vignette
  const vignette = ctx.createRadialGradient(540, 620, 380, 540, 620, 900);
  vignette.addColorStop(0, "rgba(40, 0, 4, 0)");
  vignette.addColorStop(1, "rgba(40, 0, 4, 0.45)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Slanted white panel behind the schedule card
  ctx.save();
  ctx.fillStyle = "#FBF7F2";
  ctx.beginPath();
  ctx.moveTo(0, 1095);
  ctx.lineTo(CANVAS_WIDTH, 1012);
  ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.lineTo(0, CANVAS_HEIGHT);
  ctx.closePath();
  ctx.shadowColor = "rgba(40, 0, 0, 0.5)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = -4;
  ctx.fill();
  ctx.restore();
}

function drawHeader(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement | null,
  fonts: FlierFonts,
) {
  ctx.save();
  ctx.font = `800 30px ${fonts.sans}`;
  ctx.letterSpacing = "1px";
  const textW = Math.max(
    ...FLIER_THEME.church.map((l) => ctx.measureText(l).width),
  );
  const logoSize = 60;
  const gap = 18;
  const padX = 30;
  const pillW = padX * 2 + logoSize + gap + textW;
  const pillH = 86;
  const pillX = Math.round((CANVAS_WIDTH - pillW) / 2);
  const pillY = 28;

  ctx.save();
  ctx.shadowColor = "rgba(60, 0, 0, 0.35)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = COLORS.white;
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, 24);
  ctx.fill();
  ctx.restore();

  if (logo) {
    ctx.drawImage(logo, pillX + padX, pillY + (pillH - logoSize) / 2, logoSize, logoSize);
  }

  ctx.textAlign = "left";
  ctx.fillStyle = COLORS.navy;
  const textX = pillX + padX + logoSize + gap;
  ctx.fillText(FLIER_THEME.church[0], textX, pillY + 39);
  ctx.fillText(FLIER_THEME.church[1], textX, pillY + 72);

  // P R E S E N T S
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
  ctx.font = `700 18px ${fonts.sans}`;
  ctx.letterSpacing = "9px";
  ctx.fillText("PRESENTS", 544, 152);
  ctx.restore();
}

function drawTitle(ctx: CanvasRenderingContext2D, fonts: FlierFonts) {
  const { top, middle, bottom } = FLIER_THEME.titleLines;
  drawGoldText(ctx, top, 540, 242, 92, fonts.display, 900);

  // "OF" with flanking gold rules
  ctx.save();
  ctx.font = `900 50px ${fonts.display}`;
  const ofW = ctx.measureText(middle).width;
  const ruleY = 278;
  const ruleGrad = ctx.createLinearGradient(0, ruleY - 4, 0, ruleY + 4);
  ruleGrad.addColorStop(0, "#FFE68C");
  ruleGrad.addColorStop(1, "#C3830A");
  ctx.fillStyle = ruleGrad;
  ctx.shadowColor = "rgba(50, 0, 0, 0.5)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 3;
  ctx.fillRect(540 - ofW / 2 - 200, ruleY - 4, 170, 8);
  ctx.fillRect(540 + ofW / 2 + 30, ruleY - 4, 170, 8);
  ctx.restore();
  drawGoldText(ctx, middle, 540, 298, 50, fonts.display, 300);

  drawGoldText(ctx, bottom, 540, 410, 140, fonts.display, 860);
}

function drawThemeBlock(ctx: CanvasRenderingContext2D, fonts: FlierFonts) {
  ctx.save();
  // "Theme" pill with white rules either side
  const pillW = 110;
  const pillH = 32;
  const pillY = 428;
  ctx.fillStyle = COLORS.white;
  ctx.fillRect(320, pillY + pillH / 2 - 2, 180, 4);
  ctx.fillRect(580, pillY + pillH / 2 - 2, 180, 4);

  ctx.fillStyle = COLORS.yellow;
  ctx.beginPath();
  ctx.roundRect(540 - pillW / 2, pillY, pillW, pillH, 16);
  ctx.fill();
  ctx.fillStyle = "#7A0A10";
  ctx.font = `800 19px ${fonts.sans}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.letterSpacing = "0.5px";
  ctx.fillText("Theme", 540, pillY + pillH / 2 + 1);

  ctx.textBaseline = "alphabetic";
  ctx.shadowColor = "rgba(40, 0, 0, 0.55)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = COLORS.white;
  ctx.letterSpacing = "0px";
  fitFont(ctx, FLIER_THEME.themeLead, 800, 38, fonts.sans, 700);
  ctx.fillText(FLIER_THEME.themeLead, 540, 500);

  ctx.letterSpacing = "1px";
  fitFont(ctx, FLIER_THEME.themeMain, 800, 70, fonts.sans, 700);
  const mainW = ctx.measureText(FLIER_THEME.themeMain).width;
  ctx.fillText(FLIER_THEME.themeMain, 540, 564);

  // Scripture, right-aligned under the main theme word
  ctx.shadowBlur = 4;
  ctx.fillStyle = COLORS.yellow;
  ctx.textAlign = "right";
  ctx.letterSpacing = "0px";
  ctx.font = `italic 800 20px ${fonts.sans}`;
  ctx.fillText(FLIER_THEME.scripture, 540 + mainW / 2 + 20, 590);
  ctx.restore();
}

function drawPhoto(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement | null,
  zoom: number,
  panX: number,
  panY: number,
  fonts: FlierFonts,
) {
  const { x: cx, y: cy, radius } = PHOTO_CIRCLE;

  // Rings
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 15, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255, 226, 122, 0.55)";
  ctx.lineWidth = 2.5;
  ctx.setLineDash([10, 8]);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.beginPath();
  ctx.arc(cx, cy, radius + 6, 0, Math.PI * 2);
  const ring = ctx.createLinearGradient(cx, cy - radius, cx, cy + radius);
  ring.addColorStop(0, "#FFE68C");
  ring.addColorStop(0.5, COLORS.gold);
  ring.addColorStop(1, "#C3830A");
  ctx.strokeStyle = ring;
  ctx.lineWidth = 7;
  ctx.shadowColor = "rgba(255, 190, 40, 0.6)";
  ctx.shadowBlur = 18;
  ctx.stroke();
  ctx.restore();

  // Photo clipped to circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  if (photo) {
    const aspect = photo.width / photo.height;
    const box = radius * 2;
    let w = aspect > 1 ? box * aspect : box;
    let h = aspect > 1 ? box : box / aspect;
    w *= zoom;
    h *= zoom;
    ctx.drawImage(photo, cx - w / 2 + panX, cy - h / 2 + panY, w, h);
  } else {
    const ph = ctx.createRadialGradient(cx, cy - 40, 10, cx, cy, radius);
    ph.addColorStop(0, "#8E0B14");
    ph.addColorStop(1, "#4A0509");
    ctx.fillStyle = ph;
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
    ctx.font = `800 26px ${fonts.sans}`;
    ctx.fillText("Upload Your Photo", cx, cy - 6);
    ctx.font = `600 18px ${fonts.sans}`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillText("Selfie or Portrait", cx, cy + 28);
  }
  ctx.restore();
}

function drawAttendee(
  ctx: CanvasRenderingContext2D,
  name: string,
  fonts: FlierFonts,
) {
  ctx.save();
  ctx.textAlign = "center";
  const display = (name.trim() || "Your Name Here").toUpperCase();
  ctx.letterSpacing = "1.5px";
  fitFont(ctx, display, 800, 48, fonts.sans, 920, 24);
  ctx.fillStyle = COLORS.white;
  ctx.shadowColor = "rgba(30, 0, 0, 0.9)";
  ctx.shadowBlur = 12;
  ctx.fillText(display, 540, 968);
  ctx.shadowBlur = 0;

  // "I WILL BE ATTENDING" ribbon
  const pillW = 350;
  const pillH = 42;
  const pillY = 984;
  ctx.fillStyle = COLORS.yellow;
  ctx.shadowColor = "rgba(30, 0, 0, 0.45)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;
  ctx.beginPath();
  ctx.roundRect(540 - pillW / 2, pillY, pillW, pillH, 21);
  ctx.fill();
  ctx.shadowColor = "rgba(0,0,0,0)";
  ctx.fillStyle = "#7A0A10";
  ctx.font = `800 19px ${fonts.sans}`;
  ctx.letterSpacing = "2.5px";
  ctx.textBaseline = "middle";
  ctx.fillText(FLIER_THEME.attendingLabel, 540, pillY + pillH / 2 + 1);
  ctx.restore();
}

function drawScheduleCard(ctx: CanvasRenderingContext2D, fonts: FlierFonts) {
  const x = 70;
  const y = 1048;
  const w = 940;
  const h = 172;

  ctx.save();
  const card = ctx.createLinearGradient(x, y, x + w, y + h);
  card.addColorStop(0, "#D81E25");
  card.addColorStop(1, "#A50D16");
  ctx.fillStyle = card;
  ctx.shadowColor = "rgba(60, 0, 0, 0.35)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 20);
  ctx.fill();
  ctx.shadowColor = "rgba(0,0,0,0)";
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Column divider
  ctx.strokeStyle = "rgba(255, 226, 122, 0.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(555, y + 22);
  ctx.lineTo(555, y + h - 22);
  ctx.stroke();

  // Left: dates & daily time
  drawCalendarIcon(ctx, x + 32, y + 22, 46, COLORS.yellow);
  ctx.fillStyle = COLORS.white;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.letterSpacing = "0.5px";
  fitFont(ctx, FLIER_THEME.dates, 800, 30, fonts.sans, 380);
  ctx.fillText(FLIER_THEME.dates, x + 96, y + 50);

  ctx.strokeStyle = COLORS.yellow;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 32, y + 88);
  ctx.lineTo(530, y + 88);
  ctx.stroke();

  drawClockIcon(ctx, x + 55, y + 128, 21, COLORS.yellow);
  fitFont(ctx, FLIER_THEME.dailyTime, 800, 38, fonts.sans, 380);
  ctx.fillText(FLIER_THEME.dailyTime, x + 96, y + 130);

  // Right: special service
  const stripX = 585;
  const stripW = 395;
  ctx.fillStyle = COLORS.yellow;
  ctx.beginPath();
  ctx.roundRect(stripX, y + 26, stripW, 50, 10);
  ctx.fill();
  ctx.fillStyle = "#7A0A10";
  ctx.textAlign = "center";
  fitFont(ctx, FLIER_THEME.specialService, 800, 21, fonts.sans, stripW - 24);
  ctx.fillText(FLIER_THEME.specialService, stripX + stripW / 2, y + 52);

  ctx.fillStyle = COLORS.white;
  ctx.letterSpacing = "1px";
  fitFont(ctx, FLIER_THEME.specialServiceTime, 800, 42, fonts.sans, stripW);
  ctx.fillText(FLIER_THEME.specialServiceTime, stripX + stripW / 2, y + 128);
  ctx.restore();
}

function drawVenueBar(ctx: CanvasRenderingContext2D, fonts: FlierFonts) {
  ctx.save();
  const bar = ctx.createLinearGradient(0, 1240, 0, 1322);
  bar.addColorStop(0, COLORS.redBright);
  bar.addColorStop(1, "#A50D16");
  ctx.fillStyle = bar;
  ctx.shadowColor = "rgba(60, 0, 0, 0.35)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 4;
  ctx.beginPath();
  ctx.moveTo(100, 1250);
  ctx.lineTo(CANVAS_WIDTH, 1240);
  ctx.lineTo(CANVAS_WIDTH, 1314);
  ctx.lineTo(70, 1324);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  // Pin badge
  ctx.fillStyle = COLORS.white;
  ctx.beginPath();
  ctx.arc(120, 1286, 30, 0, Math.PI * 2);
  ctx.fill();
  drawPinIcon(ctx, 120, 1279, 12, COLORS.red, COLORS.white);

  ctx.fillStyle = COLORS.white;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.letterSpacing = "0.3px";
  fitFont(ctx, FLIER_THEME.venue, 800, 25, fonts.sans, 860);
  ctx.fillText(FLIER_THEME.venue, 168, 1284);
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export function drawAttendeeFlier(
  ctx: CanvasRenderingContext2D,
  { logo, template, photo, zoom, panX, panY, name, fonts }: DrawFlierOptions,
) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  if (template) {
    ctx.drawImage(template, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  } else {
    drawBackground(ctx);
    drawHeader(ctx, logo, fonts);
    drawTitle(ctx, fonts);
    drawThemeBlock(ctx, fonts);
  }
  drawPhoto(ctx, photo, zoom, panX, panY, fonts);
  drawAttendee(ctx, name, fonts);
  drawScheduleCard(ctx, fonts);
  drawVenueBar(ctx, fonts);
}
