"use client";

import React, { useState, useRef, useCallback } from "react";
import { QrCode, Camera, Upload, Keyboard } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { playSuccessBeep, triggerHapticFeedback } from "@/utils/qrDecoder";
import { CheckInMethod, IRegistration } from "@/types/dashboard";
import { useCameraScanner } from "./qr-scanner/useCameraScanner";
import { CameraFeed } from "./qr-scanner/CameraFeed";
import { HardwareScannerStatus } from "./qr-scanner/HardwareScannerStatus";
import { ImageUploadPanel } from "./qr-scanner/ImageUploadPanel";
import { ManualEntryForm } from "./qr-scanner/ManualEntryForm";
import { SimulatePanel } from "./qr-scanner/SimulatePanel";
import { ScanStatus } from "./qr-scanner/ScanStatus";

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
  const [scanResult, setScanResult] = useState<string | null>(null);

  const lastScanTimeRef = useRef<number>(0);
  const lastScannedCodeRef = useRef<string | null>(null);

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

  const handleQrScan = useCallback(
    (code: string) => processScannedCode(code, "QR Scan"),
    [processScannedCode],
  );

  const camera = useCameraScanner({
    active: isOpen && activeTab === "camera",
    onDecode: handleQrScan,
  });

  const handleClose = () => {
    camera.stopCameraStream();
    onClose();
  };

  const tabs: TabItem[] = [
    {
      id: "camera",
      label: "Live Camera",
      icon: <Camera className="w-4 h-4" />,
    },
    {
      id: "upload",
      label: "Image Upload",
      icon: <Upload className="w-4 h-4" />,
    },
    {
      id: "manual",
      label: "Manual Code",
      icon: <Keyboard className="w-4 h-4" />,
    },
    ...(pendingRegistrations.length > 0
      ? [
          {
            id: "simulate",
            label: "Simulate",
            icon: <QrCode className="w-4 h-4" />,
          },
        ]
      : []),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      description={description}
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs">
        <HardwareScannerStatus enabled={isOpen} onScan={handleQrScan} />

        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as ScanTab)}
          label="Scan method"
        />

        <ScanStatus
          result={scanResult}
          error={camera.cameraError}
          onDismissResult={() => setScanResult(null)}
        />

        {activeTab === "camera" && <CameraFeed camera={camera} />}

        {activeTab === "upload" && (
          <ImageUploadPanel
            onDecode={handleQrScan}
            onError={camera.setCameraError}
          />
        )}

        {activeTab === "manual" && (
          <ManualEntryForm
            onSubmit={(code) => processScannedCode(code, "Manual Search")}
          />
        )}

        {activeTab === "simulate" && pendingRegistrations.length > 0 && (
          <SimulatePanel
            registrations={pendingRegistrations}
            onPick={handleQrScan}
          />
        )}

        <div className="pt-3 border-t border-border-subtle flex justify-end">
          <Button variant="outline" onClick={handleClose}>
            Close Scanner
          </Button>
        </div>
      </div>
    </Modal>
  );
};
