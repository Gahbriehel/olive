"use client";

import React from "react";
import { Zap, ZapOff, SwitchCamera } from "lucide-react";
import { cn } from "@/helpers/cn";
import { Spinner } from "@/components/ui/Spinner";
import type { CameraScanner } from "./useCameraScanner";

const cameraButtonClass =
  "p-2 rounded-lg backdrop-blur-md transition-all border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60";

/** Live camera viewport. The backdrop is always black, in both themes. */
export function CameraFeed({ camera }: { camera: CameraScanner }) {
  const {
    videoRef,
    canvasRef,
    cameraFacing,
    isCameraActive,
    isTorchOn,
    hasTorchSupport,
    cameraError,
    toggleTorch,
    toggleCameraFacing,
  } = camera;

  return (
    <div className="space-y-3">
      <div className="relative aspect-video rounded-2xl bg-black overflow-hidden border-2 border-primary/40 shadow-inner flex flex-col items-center justify-center text-white">
        {/* Hidden Canvas for Video Frame Capture */}
        <canvas ref={canvasRef} className="hidden" />

        <video
          ref={videoRef}
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {!isCameraActive && !cameraError && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-4 text-center space-y-2 z-10">
            <Spinner size="lg" className="mx-auto text-white" />
            <p className="font-semibold text-white">
              Initializing Optical Camera...
            </p>
            <p className="text-2xs text-white/70">
              Please allow camera permissions if prompted by browser
            </p>
          </div>
        )}

        {/* Scanner Viewfinder Overlay */}
        {isCameraActive && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30" />

            {/* Target Crosshairs */}
            <div className="relative w-48 h-48 border-2 border-success rounded-2xl shadow-[0_0_20px_rgba(52,211,153,0.3)] animate-pulse flex items-center justify-center">
              {/* Corner Accent Brackets */}
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-success rounded-tl" />
              <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-success rounded-tr" />
              <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-success rounded-bl" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-success rounded-br" />

              {/* Scanning Laser Line */}
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-success to-transparent animate-pulse" />
            </div>
          </div>
        )}

        {/* Camera Control Bar */}
        {isCameraActive && (
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20">
            <span className="text-2xs font-mono text-white bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success animate-ping" />
              Live • {cameraFacing === "environment" ? "Rear" : "Front"} Camera
            </span>

            <div className="flex gap-2">
              {hasTorchSupport && (
                <button
                  type="button"
                  onClick={toggleTorch}
                  className={cn(
                    cameraButtonClass,
                    isTorchOn
                      ? "bg-warning text-white border-warning-border"
                      : "bg-black/60 text-white border-white/20 hover:bg-black/80",
                  )}
                  title="Toggle Flashlight"
                  aria-label="Toggle flashlight"
                  aria-pressed={isTorchOn}
                >
                  {isTorchOn ? (
                    <Zap className="w-4 h-4" />
                  ) : (
                    <ZapOff className="w-4 h-4" />
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={toggleCameraFacing}
                className={cn(
                  cameraButtonClass,
                  "bg-black/60 text-white border-white/20 hover:bg-black/80",
                )}
                title="Switch Camera"
                aria-label="Switch camera"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-2xs text-fg-muted text-center">
        Align attendee digital badge or ticket QR inside the green viewfinder
        square.
      </p>
    </div>
  );
}
