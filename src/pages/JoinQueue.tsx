import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, QrCode, AlertTriangle, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";
import SEO from "../components/SEO";
import FallbackCameraScanner from "../components/FallbackCameraScanner";
import IsolatedQrScanner from "../components/IsolatedQrScanner";
import ScannerErrorBoundary from "../components/ScannerErrorBoundary";

export default function JoinQueue() {
  const { queueId: paramQueueId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [queueName, setQueueName] = useState("");
  const [userName, setUserName] = useState("");
  const [showScanner, setShowScanner] = useState(!paramQueueId);
  const [queueId, setQueueId] = useState<string | null>(paramQueueId || null);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [scannerStatus, setScannerStatus] = useState<
    "requesting" | "granted" | "denied" | "initializing" | "active" | "error"
  >("requesting");
  // Key for forcing re-mount of scanner component
  const [scannerKey, setScannerKey] = useState(0);

  // Fetch queue details when queueId changes
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const { data, error } = await supabase
          .from("queues")
          .select("*")
          .eq("id", queueId)
          .single();

        if (error) throw error;
        setQueueName(data.name);
      } catch (error) {
        console.error("Error fetching queue:", error);
        toast.error("Antrian tidak ditemukan");
        navigate("/");
      }
    };

    if (queueId) {
      fetchQueue();
    }
  }, [queueId, navigate]);

  // First, explicitly request camera permissions
  useEffect(() => {
    if (showScanner) {
      setScannerStatus("requesting");
      setScannerError(null);

      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("mediaDevices API not supported");
        setScannerStatus("error");
        setScannerError(
          "browser anda tidak mendukung akses kamera. Silakan gunakan browser lain."
        );
        return;
      }

      // Request camera permission
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          console.log("akses kamera diizinkan");
          setScannerStatus("granted");

          // Stop the stream - we just needed permission
          stream.getTracks().forEach((track) => track.stop());
        })
        .catch((err) => {
          console.error("Camera permission error:", err);
          setScannerStatus("denied");
          setScannerError(
            err.name === "NotAllowedError" ||
              err.name === "PermissionDeniedError"
              ? "Akses kamera ditolak. Silakan izinkan akses kamera untuk menggunakan pemindai QR."
              : `Camera error: ${err.message || "Unable to access camera"}`
          );
        });
    }
  }, [showScanner]);

  const handleScanSuccess = (decodedText: string) => {
    try {
      console.log("Processing QR code:", decodedText);

      // Check if it's directly a queue ID (UUID format)
      if (
        decodedText.match(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        )
      ) {
        console.log("Valid UUID found");
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
          throw new Error("Invalid QR code format");
        }
      } catch (error) {
        throw new Error("Could not parse QR code as URL");
      }
    } catch (error: any) {
      toast.error(error.message || "Invalid QR code");
    }
  };

  // Reset scanner by incrementing key to force re-mount
  const resetScanner = () => {
    setScannerError(null);
    setScannerStatus("requesting");
    setScannerKey((prev) => prev + 1);
  };

  // Access browser settings to enable camera
  const openCameraSettings = () => {
    try {
      if (navigator.mediaDevices.getUserMedia) {
        toast.success("Opening camera permissions dialog");
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((stream) => {
            // If successful, stop the stream and retry the scanner
            stream.getTracks().forEach((track) => track.stop());
            resetScanner();
          })
          .catch((err) => {
            console.error("Error requesting camera again:", err);
            toast.error(
              "Tidak dapat mengakses kamera. Silakan buka pengaturan browser untuk mengizinkan akses kamera."
            );
          });
      }
    } catch (err) {
      console.error("Error opening camera settings:", err);
      toast.error("Failed to open camera settings");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queueId) return;
    setLoading(true);

    try {
      // Use the atomic function to get the next number
      const { data: nextNumberData, error: nextNumberError } =
        await supabase.rpc("get_next_queue_number", { queue_uuid: queueId });

      if (nextNumberError) throw nextNumberError;

      const nextNumber = nextNumberData;

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

      toast.success("Berhasil masuk dalam antrian!");
      navigate(`/view/${queueId}?entry=${entry.id}`);
    } catch (error) {
      toast.error("Gagal bergabung dalam antrian");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderScannerContent = () => {
    switch (scannerStatus) {
      case "requesting":
        return (
          <div
            className="flex flex-col items-center justify-center p-6"
            style={{ minHeight: "300px" }}
          >
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p>Requesting camera access...</p>
            <p className="text-sm text-gray-500 mt-2">
              Please allow camera access when prompted
            </p>
          </div>
        );

      case "denied":
        return (
          <div className="text-center p-6">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">
              Akses kamera ditolak. Silakan izinkan akses kamera untuk menggunakan pemindai QR.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={openCameraSettings}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Request Camera Access
              </button>
              <button
                onClick={() => navigate("/")}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 mt-2 sm:mt-0"
              >
                Back to Home
              </button>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="text-center p-6">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{scannerError}</p>
            <button
              onClick={resetScanner}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        );

      case "granted":
        return (
          <div
            className="w-full rounded-lg overflow-hidden shadow-inner bg-black"
            style={{ minHeight: "60vh", maxHeight: "500px" }}
          >
            <IsolatedQrScanner
              onScanSuccess={handleScanSuccess}
              onError={(error) => {
                console.error("Scanner error:", error);
                setScannerError(error);
                setScannerStatus("error");
              }}
            />
          </div>
        );

      default:
        return <div>Something went wrong</div>;
    }
  };

  if (showScanner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <SEO
          title="Scan QR Code Antrian | Antrian Cerdas"
          description="Scan QR code untuk bergabung dalam antrian. Dapatkan nomor antrian dan pantau status secara real-time."
          keywords="scan qr antrian, join queue, masuk antrian, antrian digital"
          url="https://buatantrian.web.id/join"
        />

        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
          <div className="text-center mb-4">
            <QrCode className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Scan QR Code
            </h1>
            <p className="text-gray-600 mb-3">
              Posisikan QR code dalam bingkai untuk memindai
            </p>
          </div>

          <div className="rounded-lg overflow-hidden bg-gray-100 relative">
            {renderScannerContent()}
          </div>

          <div className="mt-6 flex justify-center flex-col items-center">
            <button
              onClick={() => navigate("/")}
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>

            {(scannerStatus === "denied" || scannerStatus === "error") && (
              <FallbackCameraScanner
                onCodeEntered={(code) => handleScanSuccess(code)}
              />
            )}
          </div>

          {/* Add diagnostic information for debugging */}
          <div className="mt-4 text-xs text-gray-400 text-center">
            Scanner status: {scannerStatus}
            {scannerError && <div>Error: {scannerError}</div>}
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
