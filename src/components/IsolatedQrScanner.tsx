import React, { useRef, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface IsolatedQrScannerProps {
  onScanSuccess: (code: string) => void;
  onError?: (error: string) => void;
}

// HTML template with responsive sizing
const HTML_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>QR Scanner</title>
  <script src="https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    html, body { 
      margin: 0; 
      padding: 0; 
      overflow: hidden; 
      background: #000; 
      font-family: system-ui, -apple-system, sans-serif;
      width: 100%;
      height: 100%;
    }
    
    .scanner-container {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    #qr-reader {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    
    /* Hide unnecessary elements */
    #qr-reader__dashboard_section_swaplink { display: none !important; }
    #qr-reader__status_span { display: none !important; }
    
    /* Style the video container and properly fill space */
    #qr-reader__scan_region {
      background: transparent !important;
      position: absolute !important;
      top: 0;
      left: 0;
      width: 100% !important;
      height: 100% !important;
      overflow: hidden;
      padding: 0 !important;
    }
    
    #qr-reader__scan_region video {
      position: absolute;
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
      top: 0;
      left: 0;
    }
    
    /* Style the camera control buttons */
    #qr-reader__dashboard {
      position: absolute;
      bottom: 20px;
      left: 0;
      width: 100%;
      background: transparent !important;
      display: flex;
      justify-content: center;
      z-index: 100;
    }
    
    #qr-reader__dashboard_section_csr {
      background: transparent !important;
      text-align: center;
    }
    
    #qr-reader__dashboard_section_csr button {
      background: #2563eb !important;
      color: white !important;
      border: none !important;
      padding: 8px 16px !important;
      border-radius: 8px !important;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
    
    /* Scanner frame */
    .scan-frame {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 80%;
      height: 80%;
      max-width: 300px;
      max-height: 300px;
      border: 2px solid rgba(255,255,255,0.5);
      border-radius: 10px;
      z-index: 10;
      pointer-events: none;
      box-shadow: 0 0 0 2000px rgba(0,0,0,0.5);
    }
    
    /* Corner markers */
    .corner {
      position: absolute;
      width: 20px;
      height: 20px;
      border-color: #2563eb;
      border-width: 3px;
      z-index: 15;
    }
    
    .corner-tl {
      top: -3px;
      left: -3px;
      border-top-style: solid;
      border-left-style: solid;
      border-top-left-radius: 8px;
    }
    
    .corner-tr {
      top: -3px;
      right: -3px;
      border-top-style: solid;
      border-right-style: solid;
      border-top-right-radius: 8px;
    }
    
    .corner-bl {
      bottom: -3px;
      left: -3px;
      border-bottom-style: solid;
      border-left-style: solid;
      border-bottom-left-radius: 8px;
    }
    
    .corner-br {
      bottom: -3px;
      right: -3px;
      border-bottom-style: solid;
      border-right-style: solid;
      border-bottom-right-radius: 8px;
    }
    
    /* Scanner line animation */
    .scan-line {
      position: absolute;
      width: 100%;
      height: 2px;
      background: #2563eb;
      top: 50%;
      animation: scan 2s linear infinite;
      z-index: 15;
    }
    
    @keyframes scan {
      0% { top: 15%; }
      50% { top: 85%; }
      100% { top: 15%; }
    }
    
    /* Instructions */
    .instructions {
      position: absolute;
      bottom: 70px;
      left: 0;
      width: 100%;
      text-align: center;
      color: white;
      font-size: 14px;
      padding: 10px;
      z-index: 20;
    }
  </style>
</head>
<body>
  <div class="scanner-container">
    <div id="qr-reader"></div>
    
    <div class="scan-frame">
      <div class="corner corner-tl"></div>
      <div class="corner corner-tr"></div>
      <div class="corner corner-bl"></div>
      <div class="corner corner-br"></div>
      <div class="scan-line"></div>
    </div>
    
    <div class="instructions">Posisikan QR Code dalam kotak</div>
  </div>
  
  <script>
    // Create QR scanner with dynamic configuration
    const html5QrCode = new Html5Qrcode("qr-reader");
    
    // Responsive qrbox based on screen dimensions
    const computeQrboxSize = () => {
      const scanBoxSize = Math.min(window.innerWidth, window.innerHeight) * 0.7;
      return { 
        width: scanBoxSize, 
        height: scanBoxSize 
      };
    };
    
    const config = { 
      fps: 10,
      qrbox: computeQrboxSize(),
      aspectRatio: window.innerWidth / window.innerHeight,
      showTorchButtonIfSupported: true,
      formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ]
    };

    // Add window resize handler to adjust qrbox size
    window.addEventListener('resize', () => {
      html5QrCode.applyVideoConstraints({
        aspectRatio: window.innerWidth / window.innerHeight
      }).catch(err => console.warn('Could not update aspect ratio', err));
    });

    // Start scanning when page loads
    html5QrCode.start(
      { facingMode: "environment" }, 
      config,
      (decodedText) => {
        // Add vibration feedback
        if (navigator.vibrate) {
          navigator.vibrate(100);
        }
        
        // Send result to parent window
        window.parent.postMessage({ type: 'qr-result', code: decodedText }, '*');
        
        // Stop scanning
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
      className="qr-scanner-isolated-container relative w-full bg-black overflow-hidden rounded-lg"
      style={{ height: "100vh", maxHeight: "500px" }}
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
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <span className="mt-4 text-white font-medium">
              Aktivasi kamera...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default IsolatedQrScanner;
