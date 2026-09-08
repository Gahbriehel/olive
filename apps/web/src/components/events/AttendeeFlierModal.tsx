"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useSyncExternalStore,
} from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import {
  X,
  Upload,
  Download,
  Share2,
  ZoomIn,
  Move,
  RotateCcw,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { customToast } from "@/helpers/customToast";

export interface AttendeeFlierModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle?: string;
  eventStartDate?: string;
  eventLocation?: string;
  initialName?: string;
  /**
   * Optional custom template image overlay.
   * When not provided, the Youth Aflame 2026 branded canvas template will be drawn.
   */
  templateImageUrl?: string;
}

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1350;

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
  glowRadius?: number;
  sparkle?: boolean;
}

// Deterministic pseudo-random number generator (LCG) so particles remain fixed during re-renders
function createSeededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const STATIC_PARTICLES: Particle[] = (() => {
  const rand = createSeededRandom(20260908);
  const particles: Particle[] = [];

  // 1. Soft atmospheric bokeh orbs (large, very faint ambient light)
  for (let i = 0; i < 14; i++) {
    particles.push({
      x: rand() * CANVAS_WIDTH,
      y: rand() * (CANVAS_HEIGHT - 350) + 40,
      radius: rand() * 55 + 25,
      color: rand() > 0.4 ? "59, 130, 246" : "245, 158, 11",
      alpha: rand() * 0.05 + 0.02,
    });
  }

  // 2. Medium glowing ember specks / dust particles
  for (let i = 0; i < 75; i++) {
    const isGold = rand() > 0.35;
    particles.push({
      x: rand() * CANVAS_WIDTH,
      y: rand() * CANVAS_HEIGHT,
      radius: rand() * 2.8 + 1.2,
      color: isGold ? "251, 191, 36" : "147, 197, 253",
      alpha: rand() * 0.45 + 0.2,
      glowRadius: rand() * 8 + 4,
    });
  }

  // 3. Crisp 4-point light sparkles
  for (let i = 0; i < 22; i++) {
    particles.push({
      x: rand() * (CANVAS_WIDTH - 120) + 60,
      y: rand() * 920 + 60,
      radius: rand() * 2 + 1.5,
      color: "255, 255, 255",
      alpha: rand() * 0.65 + 0.3,
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
    const len = buffer.length;

    for (let i = 0; i < len; i++) {
      const val = Math.floor(Math.random() * 255);
      // Subtle alpha for fine organic grain
      buffer[i] = (22 << 24) | (val << 16) | (val << 8) | val;
    }

    nCtx.putImageData(imgData, 0, 0);
    cachedNoiseCanvas = noiseCanvas;
  }

  return ctx.createPattern(cachedNoiseCanvas, "repeat");
}

export function AttendeeFlierModal({
  isOpen,
  onClose,
  initialName = "",
  templateImageUrl,
}: AttendeeFlierModalProps) {
  const [attendeeName, setAttendeeName] = useState(initialName);
  const [prevInitialName, setPrevInitialName] = useState(initialName);
  if (initialName !== prevInitialName) {
    setPrevInitialName(initialName);
    setAttendeeName(initialName);
  }

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [templateLoaded, setTemplateLoaded] = useState(false);
  const [photoVersion, setPhotoVersion] = useState(0);
  const [canvasReady, setCanvasReady] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Headless UI's Dialog mounts its Portal children asynchronously (SSR
  // handoff), so canvasRef.current can still be null on the render where
  // isOpen first becomes true. This callback ref flips canvasReady once the
  // node actually lands in the DOM so the draw effect below re-runs.
  const setCanvasRef = useCallback((node: HTMLCanvasElement | null) => {
    canvasRef.current = node;
    setCanvasReady(node !== null);
  }, []);
  const userImageRef = useRef<HTMLImageElement | null>(null);
  const logoImageRef = useRef<HTMLImageElement | null>(null);
  const templateImageRef = useRef<HTMLImageElement | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Web Share API support without cascading effect renders
  const canShare = useSyncExternalStore(
    () => () => {},
    () =>
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function" &&
      typeof navigator.canShare === "function",
    () => false,
  );

  // Preload Church Gold Logo
  useEffect(() => {
    const logo = new Image();
    logo.crossOrigin = "anonymous";
    logo.src = "/images/icon-gold.png";
    logo.onload = () => {
      logoImageRef.current = logo;
      setLogoLoaded(true);
    };
  }, []);

  // Preload custom template image if provided
  useEffect(() => {
    if (!templateImageUrl) {
      templateImageRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = templateImageUrl;
    img.onload = () => {
      templateImageRef.current = img;
      setTemplateLoaded(true);
    };
  }, [templateImageUrl]);

  // Load uploaded attendee photo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      customToast.error("Please upload a valid image file (JPG, PNG, WEBP)");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setImageSrc(objectUrl);

    const img = new Image();
    img.onload = () => {
      userImageRef.current = img;
      setZoom(1);
      setPanX(0);
      setPanY(0);
      setPhotoVersion((v) => v + 1);
    };
    img.src = objectUrl;
  };

  const handleResetPosition = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  // Main canvas render effect matching Youth Aflame 2026 aesthetics
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // -------------------------------------------------------------
    // 1. BASE BACKGROUND: Electric Royal Blue & Radiant Atmosphere
    // -------------------------------------------------------------
    if (templateImageRef.current) {
      ctx.drawImage(
        templateImageRef.current,
        0,
        0,
        CANVAS_WIDTH,
        CANVAS_HEIGHT,
      );
    } else {
      // Deep radiant royal blue gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      bgGradient.addColorStop(0, "#011A4D");
      bgGradient.addColorStop(0.35, "#042D7C");
      bgGradient.addColorStop(0.7, "#031C56");
      bgGradient.addColorStop(1, "#010B24");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Atmospheric radial glow flare behind title area
      const flare = ctx.createRadialGradient(540, 310, 30, 540, 310, 520);
      flare.addColorStop(0, "rgba(37, 99, 235, 0.45)");
      flare.addColorStop(0.45, "rgba(29, 78, 216, 0.16)");
      flare.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = flare;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Volumetric stage lighting streaks (soft light rays from top)
      ctx.save();
      const ray1 = ctx.createLinearGradient(540, 0, 80, CANVAS_HEIGHT);
      ray1.addColorStop(0, "rgba(147, 197, 253, 0.10)");
      ray1.addColorStop(0.5, "rgba(59, 130, 246, 0.03)");
      ray1.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = ray1;
      ctx.beginPath();
      ctx.moveTo(500, 0);
      ctx.lineTo(580, 0);
      ctx.lineTo(200, CANVAS_HEIGHT);
      ctx.lineTo(40, CANVAS_HEIGHT);
      ctx.closePath();
      ctx.fill();

      const ray2 = ctx.createLinearGradient(540, 0, 1000, CANVAS_HEIGHT);
      ray2.addColorStop(0, "rgba(147, 197, 253, 0.10)");
      ray2.addColorStop(0.5, "rgba(59, 130, 246, 0.03)");
      ray2.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = ray2;
      ctx.beginPath();
      ctx.moveTo(520, 0);
      ctx.lineTo(600, 0);
      ctx.lineTo(1040, CANVAS_HEIGHT);
      ctx.lineTo(880, CANVAS_HEIGHT);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Atmospheric glowing particles, embers, bokeh & sparkles
      ctx.save();
      STATIC_PARTICLES.forEach((p) => {
        if (p.sparkle) {
          // Delicate 4-point star sparkle
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
          ctx.beginPath();
          ctx.arc(0, 0, p.radius * 0.8, 0, Math.PI * 2);
          ctx.fill();

          // Star cross flares
          ctx.strokeStyle = `rgba(${p.color}, ${p.alpha * 0.75})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-p.radius * 3.2, 0);
          ctx.lineTo(p.radius * 3.2, 0);
          ctx.moveTo(0, -p.radius * 3.2);
          ctx.lineTo(0, p.radius * 3.2);
          ctx.stroke();
          ctx.restore();
        } else if (p.radius > 20) {
          // Soft ambient bokeh orbs
          const bokehGrad = ctx.createRadialGradient(
            p.x,
            p.y,
            0,
            p.x,
            p.y,
            p.radius,
          );
          bokehGrad.addColorStop(0, `rgba(${p.color}, ${p.alpha * 1.5})`);
          bokehGrad.addColorStop(0.6, `rgba(${p.color}, ${p.alpha * 0.5})`);
          bokehGrad.addColorStop(1, `rgba(${p.color}, 0)`);
          ctx.fillStyle = bokehGrad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Glowing dust speck / ember
          if (p.glowRadius) {
            const glowGrad = ctx.createRadialGradient(
              p.x,
              p.y,
              0,
              p.x,
              p.y,
              p.glowRadius,
            );
            glowGrad.addColorStop(0, `rgba(${p.color}, ${p.alpha})`);
            glowGrad.addColorStop(0.4, `rgba(${p.color}, ${p.alpha * 0.4})`);
            glowGrad.addColorStop(1, `rgba(${p.color}, 0)`);
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.glowRadius, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });
      ctx.restore();

      // Film Grain Noise Overlay (Texture)
      ctx.save();
      const noisePattern = getNoisePattern(ctx);
      if (noisePattern) {
        ctx.fillStyle = noisePattern;
        ctx.globalCompositeOperation = "overlay";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }
      ctx.restore();

      // Top-Left Dotted Matrix Grid Accent
      // ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      // const dotSpacing = 16;
      // const dotRows = 9;
      // const dotCols = 12;
      // for (let r = 0; r < dotRows; r++) {
      //   for (let c = 0; c < dotCols; c++) {
      //     ctx.beginPath();
      //     ctx.arc(45 + c * dotSpacing, 40 + r * dotSpacing, 1.8, 0, Math.PI * 2);
      //     ctx.fill();
      //   }
      // }

      // -------------------------------------------------------------
      // 2. CHURCH HEADER: Abiding Word of Grace Missions Presents
      // -------------------------------------------------------------
      ctx.save();
      ctx.font = "bold 34px sans-serif";
      ctx.letterSpacing = "2px";
      const churchLine1W = ctx.measureText("ABIDING WORD OF").width;
      const churchLine2W = ctx.measureText("GRACE MISSIONS").width;
      const churchTextW = Math.max(churchLine1W, churchLine2W);
      const churchLogoSize = 75;
      const churchLogoGap = 24;
      const churchTotalW = churchLogoSize + churchLogoGap + churchTextW;
      const churchStartX = Math.round((CANVAS_WIDTH - churchTotalW) / 2);

      // Logo (Gold Dove & Bible)
      if (logoImageRef.current) {
        ctx.drawImage(
          logoImageRef.current,
          churchStartX,
          38,
          churchLogoSize,
          churchLogoSize,
        );
      }

      ctx.textAlign = "left";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(
        "ABIDING WORD OF",
        churchStartX + churchLogoSize + churchLogoGap,
        72,
      );
      ctx.fillText(
        "GRACE MISSIONS",
        churchStartX + churchLogoSize + churchLogoGap,
        110,
      );
      ctx.restore();

      // "P R E S E N T S" with flanking gold divider lines
      ctx.textAlign = "center";
      ctx.fillStyle = "#F59E0B";
      ctx.font = "bold 16px sans-serif";
      ctx.letterSpacing = "6px";
      ctx.fillText("P R E S E N T S", 540, 158);

      ctx.strokeStyle = "rgba(245, 158, 11, 0.45)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(330, 152);
      ctx.lineTo(440, 152);
      ctx.moveTo(640, 152);
      ctx.lineTo(750, 152);
      ctx.stroke();

      // -------------------------------------------------------------
      // 3. TITLE BRANDING: YOUTH AFLAME 2026
      // -------------------------------------------------------------
      ctx.save();
      ctx.font = "900 100px sans-serif";
      ctx.letterSpacing = "1px";
      const youthW = ctx.measureText("YOUTH").width;

      ctx.font = "900 94px sans-serif";
      ctx.letterSpacing = "1px";
      const aflameW = ctx.measureText("AFLAME").width;

      const badgeW = 105;
      const badgeH = 66;
      const badgeRadius = 14;
      const badgeGap = 2; // Gap/margin between badges to prevent bleeding

      const badge20Y = 175;
      const badge26Y = badge20Y + badgeH + badgeGap; // 175 + 66 + 2 = 243

      const maxTitleWordW = Math.max(youthW, aflameW);
      const titleToBadgeGap = 22;
      const totalTitleW = maxTitleWordW + titleToBadgeGap + badgeW;
      const titleStartX = Math.round((CANVAS_WIDTH - totalTitleW) / 2);
      const badgeX = titleStartX + maxTitleWordW + titleToBadgeGap;

      // Draw "YOUTH" in crisp bold white
      ctx.textAlign = "left";
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 100px sans-serif";
      ctx.letterSpacing = "1px";
      ctx.fillText("YOUTH", titleStartX, 255);

      // [20] Blue Pill
      ctx.fillStyle = "#1D4ED8";
      ctx.beginPath();
      ctx.roundRect(badgeX, badge20Y, badgeW, badgeH, badgeRadius);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 36px sans-serif";
      ctx.letterSpacing = "0px";
      ctx.fillText("20", badgeX + badgeW / 2, badge20Y + badgeH / 2);
      ctx.restore();

      // [26] Red Pill
      ctx.fillStyle = "#DC2626";
      ctx.beginPath();
      ctx.roundRect(badgeX, badge26Y, badgeW, badgeH, badgeRadius);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 36px sans-serif";
      ctx.letterSpacing = "0px";
      ctx.fillText("26", badgeX + badgeW / 2, badge26Y + badgeH / 2);
      ctx.restore();

      // Draw "AFLAME" in vibrant gold/orange gradient
      const aflameGrad = ctx.createLinearGradient(
        titleStartX,
        0,
        titleStartX + aflameW,
        0,
      );
      aflameGrad.addColorStop(0, "#FBAE17");
      aflameGrad.addColorStop(0.5, "#F7931E");
      aflameGrad.addColorStop(1, "#F15A24");
      ctx.fillStyle = aflameGrad;
      ctx.textAlign = "left";
      ctx.font = "900 94px sans-serif";
      ctx.letterSpacing = "1px";
      ctx.fillText("AFLAME", titleStartX, 335);
      ctx.restore();

      // Theme Banner
      ctx.save();
      ctx.font = "italic 24px serif";
      ctx.letterSpacing = "0px";
      const themeLabelW = ctx.measureText("Theme:").width;

      ctx.font = "bold 23px sans-serif";
      ctx.letterSpacing = "1.5px";
      const themeTextW = ctx.measureText(
        "THE WORD, PROSPERITY & TRUE SUCCESS",
      ).width;

      const themeGap = 16;
      const themeTotalW = themeLabelW + themeGap + themeTextW;
      const themeStartX = Math.round((CANVAS_WIDTH - themeTotalW) / 2);

      ctx.textAlign = "left";
      ctx.font = "italic 24px serif";
      ctx.letterSpacing = "0px";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText("Theme:", themeStartX, 376);

      ctx.font = "bold 23px sans-serif";
      ctx.letterSpacing = "1.5px";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(
        "THE WORD, PROSPERITY & TRUE SUCCESS",
        themeStartX + themeLabelW + themeGap,
        376,
      );

      ctx.textAlign = "center";
      ctx.font = "bold 17px sans-serif";
      ctx.fillStyle = "#FCD34D";
      ctx.letterSpacing = "2px";
      ctx.fillText("Joshua 1:8", 540, 404);
      ctx.restore();
    }

    // -------------------------------------------------------------
    // 4. CIRCULAR PHOTO FRAME WITH GLOWING DUAL GOLD RINGS
    // -------------------------------------------------------------
    const circleCenterX = 540;
    const circleCenterY = 625;
    const circleRadius = 195;

    // Outer dashed glowing accent ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(circleCenterX, circleCenterY, circleRadius + 14, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(245, 158, 11, 0.4)";
    ctx.lineWidth = 2.5;
    ctx.setLineDash([10, 8]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Middle ambient glow
    ctx.beginPath();
    ctx.arc(circleCenterX, circleCenterY, circleRadius + 6, 0, Math.PI * 2);
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 5;
    ctx.shadowColor = "rgba(245, 158, 11, 0.6)";
    ctx.shadowBlur = 16;
    ctx.stroke();
    ctx.restore();

    // Clip circular window and draw attendee's photo
    ctx.save();
    ctx.beginPath();
    ctx.arc(circleCenterX, circleCenterY, circleRadius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    if (userImageRef.current) {
      const img = userImageRef.current;
      const imgAspect = img.width / img.height;
      const boxSize = circleRadius * 2;

      let drawW = boxSize;
      let drawH = boxSize;

      if (imgAspect > 1) {
        drawH = boxSize;
        drawW = boxSize * imgAspect;
      } else {
        drawW = boxSize;
        drawH = boxSize / imgAspect;
      }

      // Apply zoom & pan adjustments
      drawW *= zoom;
      drawH *= zoom;

      const drawX = circleCenterX - drawW / 2 + panX;
      const drawY = circleCenterY - drawH / 2 + panY;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    } else {
      // Placeholder state
      ctx.fillStyle = "#0A1938";
      ctx.fillRect(
        circleCenterX - circleRadius,
        circleCenterY - circleRadius,
        circleRadius * 2,
        circleRadius * 2,
      );

      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      ctx.font = "bold 26px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Upload Your Photo", circleCenterX, circleCenterY - 10);
      ctx.font = "18px sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.fillText("Selfie or Portrait", circleCenterX, circleCenterY + 28);
    }
    ctx.restore();

    // -------------------------------------------------------------
    // 5. ATTENDEE STATUS: "I will be attending" + NAME
    // -------------------------------------------------------------
    ctx.save();
    ctx.textAlign = "center";

    // "I will be attending" pill ribbon banner
    const pillW = 340;
    const pillH = 46;
    const pillY = 852;
    const pillX = 540 - pillW / 2;

    // Glowing pill container
    ctx.fillStyle = "#F59E0B";
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 23);
    ctx.fill();

    ctx.fillStyle = "#061537";
    ctx.font = "bold 19px sans-serif";
    ctx.letterSpacing = "2.5px";
    ctx.fillText("I WILL BE ATTENDING", 540, pillY + 30);

    // Clean, Single-Tier Attendee Name
    const displayName = (attendeeName.trim() || "Your Name Here").toUpperCase();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 52px sans-serif";
    ctx.letterSpacing = "1.5px";
    ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
    ctx.shadowBlur = 12;
    ctx.fillText(displayName, 540, 955);
    ctx.shadowBlur = 0;
    ctx.restore();

    // -------------------------------------------------------------
    // 6. BOTTOM SCHEDULE CONTAINER CARD (Mirrors White Event Card)
    // -------------------------------------------------------------
    const cardX = 80;
    const cardY = 1005;
    const cardW = 920;
    const cardH = 175;
    const cardRadius = 26;

    // White card background
    ctx.save();
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, cardRadius);
    ctx.fill();

    // Dual gold outline on white card
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Vertical separator line
    ctx.strokeStyle = "rgba(226, 232, 240, 0.9)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(540, cardY + 20);
    ctx.lineTo(540, cardY + cardH - 20);
    ctx.stroke();

    // Left Side: Dates
    ctx.textAlign = "left";
    // Saturday
    ctx.fillStyle = "#DC2626";
    ctx.font = "bold 16px sans-serif";
    ctx.letterSpacing = "1px";
    ctx.fillText("SATURDAY", cardX + 50, cardY + 46);

    ctx.fillStyle = "#0F172A";
    ctx.font = "900 24px sans-serif";
    ctx.letterSpacing = "1px";
    ctx.fillText("19TH SEPTEMBER 2026", cardX + 50, cardY + 76);

    // Sunday
    ctx.fillStyle = "#1D4ED8";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("SUNDAY", cardX + 50, cardY + 115);

    ctx.fillStyle = "#0F172A";
    ctx.font = "900 24px sans-serif";
    ctx.fillText("20TH SEPTEMBER 2026", cardX + 50, cardY + 145);

    // Right Side: Services & Times
    ctx.fillStyle = "#DC2626";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("LOVE FEAST:", cardX + 500, cardY + 46);

    ctx.fillStyle = "#0F172A";
    ctx.font = "900 22px sans-serif";
    ctx.fillText("10:00AM - 4:00PM", cardX + 500, cardY + 76);

    ctx.fillStyle = "#1D4ED8";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("THANKSGIVING SERVICE:", cardX + 500, cardY + 115);

    ctx.fillStyle = "#0F172A";
    ctx.font = "900 22px sans-serif";
    ctx.fillText("10:00AM PROMPT", cardX + 500, cardY + 145);
    ctx.restore();

    // -------------------------------------------------------------
    // 7. FOOTER VENUE & PILLARS STRIP
    // -------------------------------------------------------------
    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = "#F59E0B";
    ctx.font = "bold 15px sans-serif";
    ctx.letterSpacing = "1.5px";
    ctx.fillText("LOCATION:", 540, 1222);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 18px sans-serif";
    ctx.letterSpacing = "1px";
    ctx.fillText(
      "01 MAKANJUOLA LAYOUT, SAWMILL, DOGO APATA, IBADAN.",
      540,
      1248,
    );

    // Bottom Motto Strip
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "bold 14px sans-serif";
    ctx.letterSpacing = "3.5px";
    ctx.fillText("THE WORD  | WORSHIP  |  GAMES | Q&A SESSION", 540, 1300);
    ctx.restore();
  }, [
    isOpen,
    canvasReady,
    attendeeName,
    zoom,
    panX,
    panY,
    logoLoaded,
    templateLoaded,
    photoVersion,
  ]);

  // Drag interaction to pan the photo intuitively
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!userImageRef.current) return;
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX - panX, y: e.clientY - panY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    setPanX(e.clientX - dragStartRef.current.x);
    setPanY(e.clientY - dragStartRef.current.y);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Touch handlers for mobile pan
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!userImageRef.current || e.touches.length !== 1) return;
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.touches[0].clientX - panX,
      y: e.touches[0].clientY - panY,
    };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    setPanX(e.touches[0].clientX - dragStartRef.current.x);
    setPanY(e.touches[0].clientY - dragStartRef.current.y);
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  // Download high-resolution flier
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsGenerating(true);
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          customToast.error("Failed to generate flier image");
          setIsGenerating(false);
          return;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const safeName = (attendeeName || "attendee")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-");
        a.href = url;
        a.download = `${safeName}-youth-aflame-2026.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        customToast.success("Flier downloaded successfully!");
        setIsGenerating(false);
      }, "image/png");
    } catch {
      customToast.error("Error generating image");
      setIsGenerating(false);
    }
  };

  // Mobile Web Share
  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !navigator.share) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], "youth-aflame-2026-flier.png", {
          type: "image/png",
        });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: "Youth Aflame 2026 Flier",
            text: "I will be attending Youth Aflame 2026! Join me!",
            files: [file],
          });
          customToast.success("Flier shared!");
        } else {
          handleDownload();
        }
      }, "image/png");
    } catch {
      // User cancelled share
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          static
          open={isOpen}
          onClose={onClose}
          className="relative z-50"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <DialogPanel className="w-full max-w-5xl my-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 15 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="w-full rounded-3xl bg-[#0F172A] border border-blue-500/30 text-[#F8FAFC] shadow-2xl overflow-hidden flex flex-col relative"
              >
                {/* Header Strip */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#0B1329]">
                  <div className="flex items-center space-x-2.5">
                    {/* <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                      <Sparkles className="w-5 h-5" />
                    </div> */}
                    <div>
                      <DialogTitle className="text-lg font-bold text-white tracking-wide">
                        Create Your Youth Aflame 2026 Flier
                      </DialogTitle>
                      <p className="text-xs text-slate-400">
                        Upload your photo, type your name, and download your
                        personalized badge.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Main Split Body: Left Controls, Right Canvas Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8">
                  {/* Left Column: Form & Adjustments (desktop also keeps the buttons pinned to the bottom here) */}
                  <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
                    <div className="space-y-5">
                      {/* Step 1: Name Input */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                          <span>Your Name on Flier</span>
                          <span className="text-[11px] text-amber-400 font-normal"></span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={attendeeName}
                            onChange={(e) => setAttendeeName(e.target.value)}
                            placeholder="e.g. Benjamin Judah"
                            className="w-full text-sm bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                          />
                          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                        </div>
                      </div>

                      {/* Step 2: Photo Upload Button */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-300">
                          Upload Your Photo
                        </label>
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-blue-500/30 hover:border-amber-500/60 bg-white/5 hover:bg-white/[0.08] rounded-2xl p-4 cursor-pointer transition-all group text-center">
                          <Upload className="w-6 h-6 text-amber-400 mb-1.5 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-medium text-white">
                            {imageSrc
                              ? "Click to change photo"
                              : "Select your picture"}
                          </span>
                          <span className="text-[11px] text-slate-400 mt-0.5">
                            Supports JPG, PNG, WEBP (Selfie / Portrait
                            recommended)
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Step 3: Photo Framing Controls (Only if photo is uploaded) */}
                      {imageSrc && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3.5"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-amber-400 flex items-center space-x-1.5">
                              <Move className="w-3.5 h-3.5" />
                              <span>Adjust Photo Inside Circle</span>
                            </span>
                            <button
                              onClick={handleResetPosition}
                              className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1 transition-colors"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reset</span>
                            </button>
                          </div>

                          {/* Zoom Slider */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] text-slate-400">
                              <span className="flex items-center space-x-1">
                                <ZoomIn className="w-3 h-3" />
                                <span>Zoom</span>
                              </span>
                              <span>{zoom.toFixed(2)}x</span>
                            </div>
                            <input
                              type="range"
                              min="0.5"
                              max="2.5"
                              step="0.05"
                              value={zoom}
                              onChange={(e) =>
                                setZoom(parseFloat(e.target.value))
                              }
                              className="w-full accent-amber-500 cursor-pointer"
                            />
                          </div>

                          <p className="text-[11px] text-slate-400 italic">
                            Tip: You can also drag the photo directly on the
                            preview to center your face!
                          </p>
                        </motion.div>
                      )}
                    </div>

                    {/* Action Buttons (desktop only — mobile shows these below the preview instead) */}
                    <div className="hidden lg:flex pt-4 border-t border-white/10 flex-wrap gap-3">
                      <button
                        onClick={handleDownload}
                        disabled={isGenerating}
                        className="flex-1 py-3 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg shadow-amber-950/40 cursor-pointer"
                      >
                        {isGenerating ? (
                          <span>Processing...</span>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            <span>Download My Flier</span>
                          </>
                        )}
                      </button>

                      {canShare && (
                        <button
                          onClick={handleShare}
                          className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                          title="Share to WhatsApp / Social Media"
                        >
                          <Share2 className="w-4 h-4 text-amber-400" />
                          <span>Share</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Live Flier Preview Canvas */}
                  <div className="lg:col-span-6 flex flex-col items-center justify-center">
                    <div className="relative w-full max-w-[360px] aspect-[4/5] bg-black/60 rounded-2xl overflow-hidden border border-blue-500/30 shadow-2xl group select-none">
                      <canvas
                        ref={setCanvasRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        className="w-full h-full object-contain cursor-grab active:cursor-grabbing"
                        title="Drag to reposition photo"
                      />

                      {/* Drag hint overlay */}
                      {imageSrc && (
                        <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/75 backdrop-blur-sm border border-white/10 text-[10px] text-slate-300 pointer-events-none flex items-center space-x-1">
                          <Move className="w-2.5 h-2.5 text-amber-400" />
                          <span>Drag to reposition</span>
                        </div>
                      )}
                    </div>
                    {/* <p className="text-[11px] text-slate-400 mt-2 text-center">
                      High-Resolution 1080×1350 PNG • Ready for WhatsApp & Instagram
                    </p> */}
                    <p className="text-[11px] text-slate-400 mt-2 text-center">
                      Ready for WhatsApp & Instagram
                    </p>
                  </div>

                  {/* Action Buttons (mobile only — shown after the preview so Download comes last; desktop shows these under the form instead) */}
                  <div className="lg:hidden pt-4 border-t border-white/10 flex flex-wrap gap-3">
                    <button
                      onClick={handleDownload}
                      disabled={isGenerating}
                      className="flex-1 py-3 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg shadow-amber-950/40 cursor-pointer"
                    >
                      {isGenerating ? (
                        <span>Processing...</span>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Download My Flier</span>
                        </>
                      )}
                    </button>

                    {canShare && (
                      <button
                        onClick={handleShare}
                        className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                        title="Share to WhatsApp / Social Media"
                      >
                        <Share2 className="w-4 h-4 text-amber-400" />
                        <span>Share</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
