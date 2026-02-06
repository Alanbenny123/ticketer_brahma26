"use client";

import { useState, useEffect, useRef } from 'react';
import { Camera, X } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string>("");
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      startScanner();
    }
    
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    // Prevent multiple initializations
    if (scannerRef.current) return;
    
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      // Try with flexible constraints for external webcams like Irium
      const config = {
        fps: 30,
        qrbox: { width: 350, height: 350 },
        aspectRatio: 1.0,
        disableFlip: false
      };

      // Try different camera configurations
      try {
        // First try: Use any available camera (works better with external webcams)
        await html5QrCode.start(
          { facingMode: { ideal: "environment" } },
          config,
          (decodedText) => {
            onScan(decodedText);
            stopScanner();
          },
          (errorMessage) => {
            // Ignore scanning errors (they happen continuously while scanning)
          }
        );
      } catch (e) {
        // Fallback: Try with exact facing mode
        await html5QrCode.start(
          { facingMode: "user" },
          config,
          (decodedText) => {
            onScan(decodedText);
            stopScanner();
          },
          (errorMessage) => {
            // Ignore scanning errors
          }
        );
      }
      
      setIsScanning(true);
    } catch (err: any) {
      console.error("Error starting scanner:", err);
      setError("Failed to access camera. Please ensure camera permissions are granted and Irium webcam is properly connected.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
        scannerRef.current = null;
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setIsScanning(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Camera className="w-6 h-6 text-blue-400" />
            Scan QR Code
          </h3>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <div id="qr-reader" className="rounded-lg overflow-hidden mb-4"></div>

        <p className="text-gray-400 text-sm text-center">
          {isScanning ? "Position QR code within the frame" : "Initializing camera..."}
        </p>
      </div>
    </div>
  );
}
