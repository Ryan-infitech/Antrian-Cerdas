import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Loader2,
  QrCode,
  AlertTriangle,
  ArrowLeft,
  Camera,
} from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";
import FallbackCameraScanner from "../components/FallbackCameraScanner";

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

  const scannerContainerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerInitializedRef = useRef(false); // Track if scanner was initialized

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
        toast.error("Queue not found");
        navigate("/");
      }
    };

    if (queueId) {
      fetchQueue();
    }
  }, [queueId, navigate]);

  // Improved cleanup function to be more robust and avoid DOM manipulation errors
  const safeCleanupScanner = () => {
    try {
      // First, mark scanner as not initialized
      scannerInitializedRef.current = false;

      // Clear scanner using its API, which should handle DOM cleanup properly
      if (scannerRef.current) {
        try {
          // Use promise-based clear with proper error handling
          scannerRef.current
            .clear()
            .then(() => {
              console.log("Scanner cleared successfully");

              // Only after successful clear by the scanner itself, clear our references
              scannerRef.current = null;

              // Now it's safer to clean up any remaining elements
              setTimeout(() => {
                if (scannerContainerRef.current) {
                  // Safely check if the element still has children before clearing
                  while (scannerContainerRef.current.firstChild) {
                    scannerContainerRef.current.removeChild(
                      scannerContainerRef.current.firstChild
                    );
                  }
                }
              }, 100);
            })
            .catch((err) => {
              console.warn("Non-critical error during scanner clear:", err);
              scannerRef.current = null; // Still clear our reference
            });
        } catch (err) {
          console.warn("Error during scanner cleanup:", err);
          scannerRef.current = null;
        }
      } else {
        // If scanner ref doesn't exist but container does, clean it carefully
        if (scannerContainerRef.current) {
          setTimeout(() => {
            try {
              // Empty the container safely if it exists and has children
              if (
                scannerContainerRef.current &&
                scannerContainerRef.current.firstChild
              ) {
                scannerContainerRef.current.innerHTML = "";
              }
            } catch (err) {
              console.warn("Error clearing scanner container:", err);
            }
          }, 100);
        }
      }
    } catch (err) {
      console.error("Critical error during scanner cleanup:", err);
    }
  };

  // First, explicitly request camera permissions
  useEffect(() => {
    if (showScanner) {
      setScannerStatus("requesting");
      setScannerError(null);

      // Ensure clean state before starting
      safeCleanupScanner();

      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("mediaDevices API not supported");
        setScannerStatus("error");
        setScannerError(
          "Your browser doesn't support camera access. Try using Chrome, Firefox, or Safari."
        );
        return;
      }

      // Request camera permission
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          console.log("Camera permission granted");
          setScannerStatus("granted");

          // Stop the stream - we just needed permission
          stream.getTracks().forEach((track) => track.stop());

          // Initialize scanner after a short delay
          setTimeout(initializeScanner, 500);
        })
        .catch((err) => {
          console.error("Camera permission error:", err);
          setScannerStatus("denied");
          setScannerError(
            err.name === "NotAllowedError" ||
              err.name === "PermissionDeniedError"
              ? "Camera access denied. Please allow camera access and try again."
              : `Camera error: ${err.message || "Unable to access camera"}`
          );
        });
    }

    // Cleanup when component unmounts or showScanner changes
    return safeCleanupScanner;
  }, [showScanner]);

  // Update the initializeScanner function to be more careful with DOM elements
  const initializeScanner = () => {
    if (!scannerContainerRef.current) {
      setScannerError("Scanner container not found");
      setScannerStatus("error");
      return;
    }

    try {
      // Cleanup first to ensure a clean start
      safeCleanupScanner();

      // Wait a moment to ensure cleanup is complete before creating new elements
      setTimeout(() => {
        // Ensure we have a fresh container for the scanner
        if (scannerContainerRef.current) {
          // Clear the container first
          try {
            while (scannerContainerRef.current.firstChild) {
              scannerContainerRef.current.removeChild(
                scannerContainerRef.current.firstChild
              );
            }
          } catch (err) {
            console.warn(
              "Error clearing container, trying innerHTML as fallback",
              err
            );
            scannerContainerRef.current.innerHTML = "";
          }

          // Create a fresh container element
          const freshContainer = document.createElement("div");
          freshContainer.id = "qr-scanner-container";
          freshContainer.style.width = "100%";
          freshContainer.style.minHeight = "300px";

          // Append the fresh container
          scannerContainerRef.current.appendChild(freshContainer);

          setScannerStatus("initializing");
          console.log("Initializing new QR scanner...");

          // Create scanner with minimal config and more time to initialize
          const scanner = new Html5QrcodeScanner(
            "qr-scanner-container",
            {
              fps: 10,
              qrbox: 250,
              rememberLastUsedCamera: false,
              aspectRatio: 1.0,
            },
            false
          );

          scannerRef.current = scanner;

          // Use a longer timeout for render to ensure DOM is fully prepared
          setTimeout(() => {
            if (!scannerRef.current || !scannerContainerRef.current) return;

            try {
              scanner.render(
                (decodedText) => {
                  console.log("Scan successful, beginning cleanup");
                  // Store the result first
                  const result = decodedText;

                  // Use setTimeout to allow the scanner to complete its internal processes
                  setTimeout(() => {
                    safeCleanupScanner();
                    // Process the scan result after cleanup
                    handleScanSuccess(result);
                  }, 300);
                },
                (errorMessage) => {
                  console.error("Critical scanner error:", errorMessage);
                }
              );

              scannerInitializedRef.current = true;
              setTimeout(() => {
                if (scannerInitializedRef.current) {
                  setScannerStatus("active");
                }
              }, 1000);
            } catch (err) {
              console.error("Error rendering scanner:", err);
              setScannerStatus("error");
              setScannerError(
                `Scanner initialization failed: ${err.message || String(err)}`
              );
            }
          }, 500);
        }
      }, 300); // Wait for cleanup to complete
    } catch (err) {
      console.error("Error creating scanner:", err);
      setScannerStatus("error");
      setScannerError(
        `Failed to create scanner: ${err.message || String(err)}`
      );
    }
  };

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
            retryScanner();
          })
          .catch((err) => {
            console.error("Error requesting camera again:", err);
            toast.error(
              "Could not access camera. Please check browser settings."
            );
          });
      }
    } catch (err) {
      console.error("Error opening camera settings:", err);
      toast.error("Failed to open camera settings");
    }
  };

  const retryScanner = () => {
    // Clean up and retry
    safeCleanupScanner();
    setScannerError(null);
    setScannerStatus("requesting");

    // Force re-render by toggling state
    setShowScanner(false);
    setTimeout(() => setShowScanner(true), 500); // Longer delay for safety
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

  const renderScannerContent = () => {
    switch (scannerStatus) {
      case "requesting":
      case "initializing":
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
              Camera access was denied. Please enable camera permissions to scan
              QR codes.
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
              onClick={retryScanner}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        );

      case "granted":
      case "active":
        return (
          <div ref={scannerContainerRef} className="qr-container relative">
            <div
              id="qr-scanner-container"
              style={{ width: "100%", minHeight: "300px" }}
            ></div>
            {scannerStatus === "granted" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            )}
          </div>
        );

      default:
        return <div>Something went wrong</div>;
    }
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

          <div className="mt-6 flex justify-center flex-col items-center">
            <button
              onClick={() => {
                // Ensure scanner is cleaned up before navigating
                safeCleanupScanner();
                navigate("/");
              }}
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
