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
import { Manrope, Playfair_Display } from "next/font/google";
import { customToast } from "@/helpers/customToast";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  FLIER_THEME,
  drawAttendeeFlier,
} from "./flier/drawAttendeeFlier";

// Canvas can't use CSS variables, so load the faces here and pass their
// resolved family names to the renderer.
const flierDisplayFont = Playfair_Display({
  subsets: ["latin"],
  weight: ["900"],
});
const flierSansFont = Manrope({
  subsets: ["latin"],
  weight: ["600", "800"],
});
const FLIER_FONTS = {
  display: `${flierDisplayFont.style.fontFamily}, Georgia, serif`,
  sans: `${flierSansFont.style.fontFamily}, Arial, sans-serif`,
};

export interface AttendeeFlierModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle?: string;
  eventStartDate?: string;
  eventLocation?: string;
  initialName?: string;
  /**
   * Optional full-bleed artwork. When provided it replaces the drawn
   * background, header, title and theme; the photo, name, schedule card and
   * venue bar are still drawn on top.
   */
  templateImageUrl?: string;
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
  const [fontsLoaded, setFontsLoaded] = useState(false);
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

  // Make sure the flier faces are downloaded before drawing; otherwise the
  // canvas silently falls back to a system font and the PNG keeps it.
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      document.fonts.load(`900 100px ${FLIER_FONTS.display}`),
      document.fonts.load(`800 30px ${FLIER_FONTS.sans}`),
      document.fonts.load(`italic 800 20px ${FLIER_FONTS.sans}`),
      document.fonts.load(`600 18px ${FLIER_FONTS.sans}`),
    ])
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setFontsLoaded(true);
      });
    return () => {
      cancelled = true;
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

  // Redraw the flier whenever any input changes
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    drawAttendeeFlier(ctx, {
      logo: logoImageRef.current,
      template: templateImageRef.current,
      photo: userImageRef.current,
      zoom,
      panX,
      panY,
      name: attendeeName,
      fonts: FLIER_FONTS,
    });
  }, [
    isOpen,
    canvasReady,
    attendeeName,
    zoom,
    panX,
    panY,
    logoLoaded,
    templateLoaded,
    fontsLoaded,
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
        a.download = `${safeName}-${FLIER_THEME.fileSlug}.png`;
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
        const file = new File([blob], `${FLIER_THEME.fileSlug}-flier.png`, {
          type: "image/png",
        });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `${FLIER_THEME.eventName} Flier`,
            text: `I will be attending ${FLIER_THEME.eventName}! Join me!`,
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
                className="w-full rounded-3xl bg-[#1A0507] border border-red-500/30 text-[#F8FAFC] shadow-2xl overflow-hidden flex flex-col relative"
              >
                {/* Header Strip */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#120304]">
                  <div className="flex items-center space-x-2.5">
                    {/* <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                      <Sparkles className="w-5 h-5" />
                    </div> */}
                    <div>
                      <DialogTitle className="text-lg font-bold text-white tracking-wide">
                        Create Your {FLIER_THEME.eventName} Flier
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
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-red-500/30 hover:border-amber-500/60 bg-white/5 hover:bg-white/[0.08] rounded-2xl p-4 cursor-pointer transition-all group text-center">
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
                    <div className="relative w-full max-w-[360px] aspect-[4/5] bg-black/60 rounded-2xl overflow-hidden border border-red-500/30 shadow-2xl group select-none">
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
