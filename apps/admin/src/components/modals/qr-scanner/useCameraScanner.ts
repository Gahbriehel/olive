"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { decodeQrFromImageData } from "@/utils/qrDecoder";

export type CameraFacing = "environment" | "user";

interface UseCameraScannerOptions {
  /** True while the modal is open and the camera tab is selected. */
  active: boolean;
  /** Called with every decoded QR payload from the live feed. */
  onDecode: (code: string) => void;
}

/**
 * Owns the camera stream, torch and jsQR frame loop for the QR scanner.
 * The stream starts when `active` turns on and stops when it turns off,
 * when the facing mode changes, or on unmount.
 */
export function useCameraScanner({
  active,
  onDecode,
}: UseCameraScannerOptions) {
  const [cameraFacing, setCameraFacing] = useState<CameraFacing>("environment");
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [hasTorchSupport, setHasTorchSupport] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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
    if (!active || !isCameraActive) return;

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
              onDecode(decodedResult);
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
  }, [active, isCameraActive, onDecode]);

  // Handle camera tab lifecycle
  useEffect(() => {
    let isMounted = true;
    if (active) {
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
  }, [active, cameraFacing, startCameraStream, stopCameraStream]);

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

  return {
    videoRef,
    canvasRef,
    cameraFacing,
    isCameraActive,
    isTorchOn,
    hasTorchSupport,
    cameraError,
    setCameraError,
    stopCameraStream,
    toggleTorch,
    toggleCameraFacing,
  };
}

export type CameraScanner = ReturnType<typeof useCameraScanner>;
