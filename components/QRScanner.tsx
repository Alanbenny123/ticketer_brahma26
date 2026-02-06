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
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      loadCameras();
    }
    
    return () => {
      stopScanner();
    };
  }, []);

  const loadCameras = async () => {
    try {
      const devices = await Html5Qrcode.getCameras();
      console.log("Available cameras:", devices);
      setCameras(devices);
      if (devices && devices.length > 0) {
        // Use the first camera by default
        setSelectedCamera(devices[0].id);
        startScanner(devices[0].id);
      } else {
        // If no specific cameras detected, try generic camera access
        console.log("No specific cameras detected, trying generic access");
        startScannerGeneric();
      }
    } catch (err: any) {
      console.error("Error loading cameras:", err);
      // Fallback to generic camera access
      startScannerGeneric();
    }
  };

  const startScannerGeneric = async () => {
    // Prevent multiple initializations
    if (scannerRef.current) {
      await stopScanner();
    }
    
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      // Try with environment facing mode (works for most cameras)
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 30,
          qrbox: { width: 350, height: 350 },
          aspectRatio: 1.0,
          disableFlip: false
        },
        (decodedText) => {
          console.log("QR Code detected:", decodedText);
          onScan(decodedText);
          stopScanner();
        },
        (errorMessage) => {
          // Ignore scanning errors
        }
      );
      setIsScanning(true);
      setError("");
    } catch (err: any) {
      console.error("Environment mode failed, trying user mode:", err);
      // Try with user facing mode as fallback
      try {
        const html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;
        
        await html5QrCode.start(
          { facingMode: "user" },
          {
            fps: 30,
            qrbox: { width: 350, height: 350 }
          },
          (decodedText) => {
            console.log("QR Code detected:", decodedText);
            onScan(decodedText);
            stopScanner();
          },
          (errorMessage) => {
            // Ignore scanning errors
          }
        );
        setIsScanning(true);
        setError("");
      } catch (err2: any) {
        console.error("All camera access methods failed:", err2);
        setError("Failed to access any camera. Please grant camera permissions and ensure a camera is connected.");
      }
    }
  };

  const startScanner = async (cameraId: string) => {
    // Prevent multiple initializations
    if (scannerRef.current) {
      await stopScanner();
    }
    
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      // Use the specific camera ID
      await html5QrCode.start(
        cameraId,
        {
          fps: 30,
          qrbox: { width: 350, height: 350 },
          aspectRatio: 1.0,
          disableFlip: false
        },
        (decodedText) => {
          console.log("QR Code detected:", decodedText);
          onScan(decodedText);
          stopScanner();
        },
        (errorMessage) => {
          // Ignore scanning errors
        }
      );
      setIsScanning(true);
      setError("");
    } catch (err: any) {
      console.error("Error starting scanner with camera ID:", err);
      // Fallback to generic access
      startScannerGeneric();
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
      <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Camera className="w-6 h-6 text-orange-500" />
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

        {/* Camera selector */}
        {cameras.length > 1 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Camera
            </label>
            <select
              value={selectedCamera}
              onChange={(e) => {
                setSelectedCamera(e.target.value);
                startScanner(e.target.value);
              }}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {cameras.map((camera) => (
                <option key={camera.id} value={camera.id}>
                  {camera.label || `Camera ${camera.id}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <div id="qr-reader" className="rounded-lg overflow-hidden mb-4 bg-black"></div>

        <p className="text-gray-400 text-sm text-center">
          {isScanning ? "Position QR code within the frame" : cameras.length > 0 ? "Initializing camera..." : "Detecting cameras..."}
        </p>
      </div>
    </div>
  );
}
