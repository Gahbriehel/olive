"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  QrCode,
  Camera,
  Upload,
  Keyboard,
  Zap,
  ZapOff,
  SwitchCamera,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  X,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/FormElements/Input";
import {
  decodeQrFromImageData,
  decodeQrFromImageFile,
  playSuccessBeep,
  triggerHapticFeedback,
} from "@/utils/qrDecoder";
import { useHardwareScanner } from "@/hooks/useHardwareScanner";
import { CheckInMethod, IRegistration } from "@/types/dashboard";

export interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (tokenOrRegId: string, method: CheckInMethod) => void;
  title?: string;
  description?: string;
  pendingRegistrations?: IRegistration[];
}

type ScanTab = "camera" | "upload" | "manual" | "simulate";

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  title = "Gate Attendance QR Scanner",
  description = "Scan attendee digital passes via camera, hardware barcode scanner, file upload, or manual search",
  pendingRegistrations = [],
}) => {
  const [activeTab, setActiveTab] = useState<ScanTab>("camera");
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">(
    "environment",
  );
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [hasTorchSupport, setHasTorchSupport] = useState<boolean>(false);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState<string>("");
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastScanTimeRef = useRef<number>(0);
  const lastScannedCodeRef = useRef<string | null>(null);

  // Stop video stream and clear animation frames
  const stopCameraStream = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    Promise.resolve().then(() => {
      setIsCameraActive(false);
      setIsTorchOn(false);
      setHasTorchSupport(false);
    });
  }, []);

  // Handle successful scan event with audio/haptic feedback & debounce
  const processScannedCode = useCallback(
    (code: string, method: CheckInMethod) => {
      const now = Date.now();
      // Debounce identical scans within 2.5s
      if (
        lastScannedCodeRef.current === code &&
        now - lastScanTimeRef.current < 2500
      ) {
        return;
      }

      lastScanTimeRef.current = now;
      lastScannedCodeRef.current = code;

      // Play audio tone and vibration
      playSuccessBeep();
      triggerHapticFeedback();

      const cleanCode = code.trim();
      const matched = pendingRegistrations?.find(
        (r) =>
          r.registrationNumber.toLowerCase() === cleanCode.toLowerCase() ||
          r.id === cleanCode ||
          r.personId === cleanCode,
      );

      if (matched) {
        setScanResult(
          `Checked in: ${matched.name} (${matched.team?.name || ""}) • ${matched.registrationNumber}`,
        );
      } else {
        setScanResult(`Checked in code: ${cleanCode}`);
      }
      onScanSuccess(cleanCode, method);

      // Auto-clear success message after 4s
      setTimeout(() => {
        setScanResult(null);
      }, 4000);
    },
    [onScanSuccess, pendingRegistrations],
  );

  // Hardware USB/Bluetooth barcode/QR scanner listener
  useHardwareScanner({
    enabled: isOpen,
    onScan: (code) => {
      processScannedCode(code, "QR Scan");
    },
  });

  // Start video stream & canvas scanner loop
  const startCameraStream = useCallback(async () => {
    stopCameraStream();
    setCameraError(null);

    if (typeof window === "undefined" || !navigator.mediaDevices) {
      setCameraError(
        "Camera API is not supported or accessible on an non-HTTPS connection.",
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: cameraFacing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      mediaStreamRef.current = stream;

      // Check flashlight/torch capability
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && "getCapabilities" in videoTrack) {
        const caps = (
          videoTrack as unknown as {
            getCapabilities: () => Record<string, boolean>;
          }
        ).getCapabilities();
        if (caps && caps.torch) {
          setHasTorchSupport(true);
        }
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err: unknown) {
      console.error("Camera access error:", err);
      const errorObj = err as { name?: string; message?: string };
      if (
        errorObj.name === "NotAllowedError" ||
        errorObj.name === "PermissionDeniedError"
      ) {
        setCameraError(
          "Camera permission denied. Please allow camera access in browser settings or use manual input.",
        );
      } else if (
        errorObj.name === "NotFoundError" ||
        errorObj.name === "DevicesNotFoundError"
      ) {
        setCameraError("No optical camera found on this device.");
      } else {
        setCameraError(
          errorObj.message || "Failed to start camera. Please try again.",
        );
      }
    }
  }, [cameraFacing, stopCameraStream]);

  // Continuous frame scanner loop
  useEffect(() => {
    if (!isOpen || activeTab !== "camera" || !isCameraActive) return;

    let lastFrameTime = 0;
    const scanFrame = (timestamp: number) => {
      // Throttle scanning to every 120ms to save CPU
      if (timestamp - lastFrameTime > 120) {
        lastFrameTime = timestamp;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (
          video &&
          canvas &&
          video.readyState === video.HAVE_ENOUGH_DATA &&
          video.videoWidth > 0
        ) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });

          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(
              0,
              0,
              canvas.width,
              canvas.height,
            );
            const decodedResult = decodeQrFromImageData(imageData);

            if (decodedResult) {
              processScannedCode(decodedResult, "QR Scan");
            }
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(scanFrame);
    };

    animationFrameRef.current = requestAnimationFrame(scanFrame);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isOpen, activeTab, isCameraActive, processScannedCode]);

  // Handle camera tab lifecycle
  useEffect(() => {
    let isMounted = true;
    if (isOpen && activeTab === "camera") {
      Promise.resolve().then(() => {
        if (isMounted) {
          startCameraStream();
        }
      });
    } else {
      stopCameraStream();
    }
    return () => {
      isMounted = false;
      stopCameraStream();
    };
  }, [isOpen, activeTab, cameraFacing, startCameraStream, stopCameraStream]);

  // Toggle Torch Light
  const toggleTorch = async () => {
    if (!mediaStreamRef.current) return;
    const track = mediaStreamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const nextState = !isTorchOn;
        await (
          track as unknown as {
            applyConstraints: (c: unknown) => Promise<void>;
          }
        ).applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setIsTorchOn(nextState);
      } catch (err) {
        console.error("Torch error:", err);
      }
    }
  };

  // Switch between Rear/Front Camera
  const toggleCameraFacing = () => {
    setCameraFacing((prev) =>
      prev === "environment" ? "user" : "environment",
    );
  };

  // Handle File Upload Scanning
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>,
  ) => {
    let file: File | undefined;
    if ("files" in e.target && e.target.files) {
      file = e.target.files[0];
    } else if ("dataTransfer" in e && e.dataTransfer.files) {
      file = e.dataTransfer.files[0];
    }

    if (!file) return;

    setIsProcessingFile(true);
    try {
      const decoded = await decodeQrFromImageFile(file);
      if (decoded) {
        processScannedCode(decoded, "QR Scan");
      } else {
        setCameraError(
          "Could not find or decode a valid QR code in this image.",
        );
        setTimeout(() => setCameraError(null), 4000);
      }
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Handle Manual Code Submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    processScannedCode(manualCode.trim(), "Manual Search");
    setManualCode("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        stopCameraStream();
        onClose();
      }}
      title={title}
      description={description}
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs">
        {/* Hardware Scanner Active Notification Badge */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300">
          <div className="flex items-center gap-2 font-medium">
            <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse shrink-0" />
            <span>Hardware Barcode Scanner Ready (USB / Bluetooth HID)</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200">
            Auto-Detect
          </span>
        </div>

        {/* Scan Mode Tab Navigation */}
        <div className="flex bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-xl gap-1">
          <button
            onClick={() => setActiveTab("camera")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold transition-all ${
              activeTab === "camera"
                ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Live Camera</span>
          </button>

          <button
            onClick={() => setActiveTab("upload")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold transition-all ${
              activeTab === "upload"
                ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Image Upload</span>
          </button>

          <button
            onClick={() => setActiveTab("manual")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold transition-all ${
              activeTab === "manual"
                ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>Manual Code</span>
          </button>

          {pendingRegistrations.length > 0 && (
            <button
              onClick={() => setActiveTab("simulate")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold transition-all ${
                activeTab === "simulate"
                  ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Simulate</span>
            </button>
          )}
        </div>

        {/* Success Alert */}
        {scanResult && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>{scanResult}</span>
            </div>
            <button
              onClick={() => setScanResult(null)}
              className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error Alert */}
        {cameraError && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 font-medium flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* TAB 1: LIVE CAMERA STREAM */}
        {activeTab === "camera" && (
          <div className="space-y-3">
            <div className="relative aspect-video rounded-2xl bg-black overflow-hidden border-2 border-indigo-500/40 shadow-inner flex flex-col items-center justify-center text-white">
              {/* Hidden Canvas for Video Frame Capture */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Video Element */}
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {!isCameraActive && !cameraError && (
                <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center p-4 text-center space-y-2 z-10">
                  <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
                  <p className="font-semibold text-slate-200">
                    Initializing Optical Camera...
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Please allow camera permissions if prompted by browser
                  </p>
                </div>
              )}

              {/* Scanner Viewfinder Overlay */}
              {isCameraActive && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {/* Subtle Gradient Backing */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30" />

                  {/* Target Crosshairs */}
                  <div className="relative w-48 h-48 border-2 border-emerald-400 rounded-2xl shadow-[0_0_20px_rgba(52,211,153,0.3)] animate-pulse flex items-center justify-center">
                    {/* Corner Accent Brackets */}
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-emerald-400 rounded-tl" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-emerald-400 rounded-tr" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-emerald-400 rounded-bl" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-emerald-400 rounded-br" />

                    {/* Scanning Laser Line */}
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
                  </div>
                </div>
              )}

              {/* Camera Control Bar */}
              {isCameraActive && (
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20">
                  <span className="text-[11px] font-mono text-emerald-400 bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Live • {cameraFacing === "environment" ? "Rear" : "Front"}{" "}
                    Camera
                  </span>

                  <div className="flex gap-2">
                    {hasTorchSupport && (
                      <button
                        onClick={toggleTorch}
                        className={`p-2 rounded-lg backdrop-blur-md transition-all border ${
                          isTorchOn
                            ? "bg-amber-400 text-slate-950 border-amber-300"
                            : "bg-black/60 text-white border-white/20 hover:bg-black/80"
                        }`}
                        title="Toggle Flashlight"
                      >
                        {isTorchOn ? (
                          <Zap className="w-4 h-4" />
                        ) : (
                          <ZapOff className="w-4 h-4" />
                        )}
                      </button>
                    )}

                    <button
                      onClick={toggleCameraFacing}
                      className="p-2 rounded-lg bg-black/60 text-white border border-white/20 backdrop-blur-md hover:bg-black/80 transition-all"
                      title="Switch Camera"
                    >
                      <SwitchCamera className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
              Align attendee digital badge or ticket QR inside the green
              viewfinder square.
            </p>
          </div>
        )}

        {/* TAB 2: IMAGE UPLOAD */}
        {activeTab === "upload" && (
          <div className="space-y-3">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileUpload}
              className="relative border-2 border-dashed border-slate-300 dark:border-zinc-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl p-8 text-center bg-slate-50/50 dark:bg-zinc-900/50 transition-all flex flex-col items-center justify-center space-y-3 cursor-pointer"
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  {isProcessingFile
                    ? "Decoding QR image..."
                    : "Drop badge photo or click to browse"}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports PNG, JPG, WEBP badge screenshots or pass files
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MANUAL CODE INPUT */}
        {activeTab === "manual" && (
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Enter Registration Number or QR Payload Token:
              </label>
              <Input
                placeholder="e.g. YC26-1001 or token string"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                autoFocus
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5"
            >
              Submit Check-In
            </Button>
          </form>
        )}

        {/* TAB 4: SIMULATE (DEV / TEST) */}
        {activeTab === "simulate" && pendingRegistrations.length > 0 && (
          <div className="space-y-2">
            <p className="font-bold text-slate-700 dark:text-slate-300">
              Quick Test Simulation (Pending Registrants):
            </p>
            <div className="space-y-1.5 max-h-56 overflow-y-auto">
              {pendingRegistrations.map((r) => (
                <button
                  key={r.id}
                  onClick={() =>
                    processScannedCode(r.registrationNumber, "QR Scan")
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-left flex items-center justify-between transition-all"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {r.name}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-2">
                      ({r.registrationNumber})
                    </span>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                    style={{ backgroundColor: r.team?.colorHex }}
                  >
                    {r.team?.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-end">
          <Button
            variant="outline"
            onClick={() => {
              stopCameraStream();
              onClose();
            }}
          >
            Close Scanner
          </Button>
        </div>
      </div>
    </Modal>
  );
};
