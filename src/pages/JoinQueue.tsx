import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader2,
  Camera,
  QrCode,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";

export default function JoinQueue() {
  const { queueId: paramQueueId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [queueName, setQueueName] = useState("");
  const [userName, setUserName] = useState("");
  const [showScanner, setShowScanner] = useState(!paramQueueId);
  const [queueId, setQueueId] = useState<string | null>(paramQueueId || null);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [scannerStatus, setScannerStatus] = useState("initializing");
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);

  const qrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const { data, error } = await supabase
          .from("queues")
          .select("*")
          .eq("id", queueId)
          .single();

        console.log("Queue data:", data);
        console.log("Error:", error);

        if (error) throw error;
        setQueueName(data.name);
      } catch (error) {
        console.error("Error fetching queue:", error);
        toast.error("Queue not found");
        navigate("/");
      }
    };

    if (queueId) {
      fetchQueue();
    }
  }, [queueId, navigate]);

  // Get available cameras on component mount
  useEffect(() => {
    if (showScanner) {
      Html5Qrcode.getCameras()
        .then((devices) => {
          if (devices && devices.length) {
            setCameras(devices);
            setSelectedCamera(devices[0].id);
          } else {
            setScannerError("No cameras found on your device");
          }
        })
        .catch((err) => {
          console.error("Error getting cameras", err);
          setScannerError(`Could not access cameras: ${err.message}`);
        });
    }
  }, [showScanner]);

  // Initialize scanner when camera is selected
  useEffect(() => {
    // Cleanup previous scanner instance
    if (qrCodeRef.current) {
      qrCodeRef.current.stop().catch(console.error);
      qrCodeRef.current = null;
    }

    if (showScanner && selectedCamera) {
      setScannerStatus("initializing");
      setScannerError(null);

      try {
        // Clear the element first
        const element = document.getElementById("qr-reader");
        if (element) {
          element.innerHTML = "";
        }

        // Create new scanner instance
        qrCodeRef.current = new Html5Qrcode("qr-reader");

        // Configure scanner with specific settings for better visibility
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
        };

        // Start scanning
        qrCodeRef.current
          .start(
            selectedCamera,
            config,
            (decodedText) => {
              console.log("QR Code detected:", decodedText);
              handleQrCodeResult(decodedText);
            },
            (errorMessage) => {
              // This is for transient errors during scanning
              console.log("QR scan error:", errorMessage);
            }
          )
          .then(() => {
            console.log("QR Code scanner started successfully");
            setScannerStatus("active");
          })
          .catch((err) => {
            console.error("Failed to start scanner:", err);
            setScannerStatus("failed");
            setScannerError(
              `Camera access failed: ${err.message || "Unknown error"}`
            );
            toast.error("Failed to access camera");
          });
      } catch (err: any) {
        console.error("Error setting up scanner:", err);
        setScannerStatus("failed");
        setScannerError(`Scanner error: ${err.message}`);
      }
    }

    // Cleanup function
    return () => {
      if (qrCodeRef.current) {
        qrCodeRef.current.stop().catch(console.error);
        qrCodeRef.current = null;
      }
    };
  }, [selectedCamera, showScanner]);

  const handleQrCodeResult = (decodedText: string) => {
    try {
      console.log("Processing QR code:", decodedText);

      // Check if it's directly a queue ID (UUID format)
      if (
        decodedText.match(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        )
      ) {
        console.log("Valid UUID found in QR code");
        setQueueId(decodedText);
        setShowScanner(false);
        return;
      }

      // Try to parse as URL
      try {
        const url = new URL(decodedText);
        const pathParts = url.pathname.split("/");
        const scannedQueueId = pathParts[pathParts.length - 1];

        console.log("Extracted ID from URL:", scannedQueueId);

        // Basic UUID validation
        if (
          scannedQueueId.match(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          )
        ) {
          setQueueId(scannedQueueId);
          setShowScanner(false);
        } else {
          throw new Error("Invalid queue ID format");
        }
      } catch (error) {
        throw new Error("Could not parse QR code as valid URL");
      }
    } catch (error: any) {
      toast.error(error.message || "Invalid QR code");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queueId) return;
    setLoading(true);

    try {
      // Get the current number
      const { data: queue } = await supabase
        .from("queues")
        .select("current_number")
        .eq("id", queueId)
        .single();

      const nextNumber = (queue?.current_number || 0) + 1;

      // Create queue entry
      const { data: entry, error: entryError } = await supabase
        .from("queue_entries")
        .insert([
          {
            queue_id: queueId,
            name: userName,
            number: nextNumber,
          },
        ])
        .select()
        .single();

      if (entryError) throw entryError;

      // Update queue current number
      const { error: updateError } = await supabase
        .from("queues")
        .update({ current_number: nextNumber })
        .eq("id", queueId);

      if (updateError) throw updateError;

      toast.success("Berhasil masuk dalam antrian!");
      navigate(`/view/${queueId}?entry=${entry.id}`);
    } catch (error) {
      toast.error("Gagal bergabung dalam antrian");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const switchCamera = () => {
    if (cameras.length <= 1) return;

    const currentIndex = cameras.findIndex((cam) => cam.id === selectedCamera);
    const nextIndex = (currentIndex + 1) % cameras.length;
    setSelectedCamera(cameras[nextIndex].id);
  };

  const retryScanner = () => {
    setScannerError(null);
    setScannerStatus("initializing");

    // Clean up existing scanner
    if (qrCodeRef.current) {
      qrCodeRef.current.stop().catch(console.error);
      qrCodeRef.current = null;
    }

    // Force remount by toggling state
    setShowScanner(false);
    setTimeout(() => setShowScanner(true), 100);
  };

  const renderScannerContent = () => {
    if (scannerStatus === "failed") {
      return (
        <div className="text-center p-6">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4 font-medium">{scannerError}</p>
          <button
            onClick={retryScanner}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (scannerStatus === "initializing") {
      return (
        <div
          className="flex flex-col items-center justify-center p-6"
          style={{ minHeight: "300px" }}
        >
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p>Accessing camera...</p>
          <p className="text-sm text-gray-500 mt-2">
            Please allow camera permissions if prompted
          </p>
        </div>
      );
    }

    return (
      <div className="qr-container">
        {/* The scanner will be mounted here */}
        <div
          id="qr-reader"
          style={{
            width: "100%",
            minHeight: "300px",
            position: "relative",
            overflow: "hidden",
          }}
        ></div>

        {/* Camera switcher shown only when multiple cameras are available */}
        {cameras.length > 1 && (
          <div className="absolute top-2 right-2 z-10">
            <button
              onClick={switchCamera}
              className="bg-gray-800 bg-opacity-70 text-white p-2 rounded-full"
              title="Switch Camera"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  if (showScanner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
          <div className="text-center mb-4">
            <QrCode className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Scan QR Code
            </h1>
            <p className="text-gray-600 mb-3">
              Position the QR code within the frame to join the queue
            </p>
          </div>

          <div className="border rounded-lg overflow-hidden bg-gray-100 relative">
            {renderScannerContent()}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate("/")}
              className="text-blue-600 hover:underline"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Masuk Antrian
        </h1>
        <p className="text-gray-600 text-center mb-6">{queueName}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="userName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Nama Anda
            </label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan Nama Anda"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
