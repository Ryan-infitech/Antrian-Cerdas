import React, { useRef, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface IsolatedQrScannerProps {
  onScanSuccess: (code: string) => void;
  onError?: (error: string) => void;
}

// This simple HTML page contains everything needed for QR scanning
// Using it in an iframe completely isolates it from React's DOM handling
const HTML_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>QR Scanner</title>
  <script src="https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js"></script>
  <style>
    body { margin: 0; padding: 0; overflow: hidden; background: #f1f5f9; }
    #qr-reader { width: 100%; }
    #qr-reader-results { display: none; }
    .html5-qrcode-element { margin-bottom: 8px !important; }
    #qr-reader__dashboard_section_swaplink { display: none !important; } /* Hide camera swap link */
    #qr-reader__dashboard_section_csr button { 
      background: #2563eb !important; 
      color: white !important; 
      border: none !important;
      padding: 8px 12px !important;
      border-radius: 6px !important;
    }
  </style>
</head>
<body>
  <div id="qr-reader"></div>
  <div id="qr-reader-results"></div>
  <script>
    // Create QR scanner with minimal configuration
    const html5QrCode = new Html5Qrcode("qr-reader");
    const config = { fps: 5, qrbox: 250 };

    // Start scanning when page loads
    html5QrCode.start(
      { facingMode: "environment" }, 
      config,
      (decodedText) => {
        // Send result to parent window through postMessage
        window.parent.postMessage({ type: 'qr-result', code: decodedText }, '*');
        
        // Immediately stop scanning
        html5QrCode.stop()
          .catch(error => console.error('Failed to stop scanner:', error));
      },
      (errorMessage) => {
        // Only report fatal errors
        if (errorMessage.includes('Unable to start scanning') || 
            errorMessage.includes('Error getting userMedia')) {
          window.parent.postMessage({ type: 'qr-error', error: errorMessage }, '*');
        }
      }
    ).catch((err) => {
      // Report initialization errors
      window.parent.postMessage({ 
        type: 'qr-error', 
        error: 'Failed to start scanner: ' + (err.message || String(err)) 
      }, '*');
    });

    // Listen for stop command from parent
    window.addEventListener('message', function(event) {
      if (event.data.type === 'qr-stop') {
        html5QrCode.stop().catch(err => console.warn('Error stopping scanner:', err));
      }
    });
  </script>
</body>
</html>
`;

const createIframeUrl = () => {
  const blob = new Blob([HTML_TEMPLATE], { type: "text/html" });
  return URL.createObjectURL(blob);
};

const IsolatedQrScanner: React.FC<IsolatedQrScannerProps> = ({
  onScanSuccess,
  onError,
}) => {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const url = createIframeUrl();
    setIframeUrl(url);

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "qr-result" && event.data.code) {
        onScanSuccess(event.data.code);
      } else if (event.data.type === "qr-error" && event.data.error) {
        console.error("QR Scanner error:", event.data.error);
        if (onError) {
          onError(event.data.error);
        }
      }
    };

    window.addEventListener("message", handleMessage);

    const loadTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    // Clean up
    return () => {
      window.removeEventListener("message", handleMessage);
      URL.revokeObjectURL(url);
      clearTimeout(loadTimer);

      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage({ type: "qr-stop" }, "*");
      }
    };
  }, [onScanSuccess, onError]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div
      className="qr-scanner-isolated-container relative w-full"
      style={{ height: "300px" }}
    >
      {iframeUrl && (
        <iframe
          ref={iframeRef}
          src={iframeUrl}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-same-origin"
          onLoad={handleIframeLoad}
          title="QR Code Scanner"
        />
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="mt-2 text-gray-600">Loading scanner...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default IsolatedQrScanner;
