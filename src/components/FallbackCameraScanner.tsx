import React, { useState } from "react";
import { KeySquare } from "lucide-react";

interface FallbackCameraScannerProps {
  onCodeEntered: (code: string) => void;
}

const FallbackCameraScanner: React.FC<FallbackCameraScannerProps> = ({
  onCodeEntered,
}) => {
  const [manualCode, setManualCode] = useState("");
  const [showManualEntry, setShowManualEntry] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onCodeEntered(manualCode.trim());
    }
  };

  if (!showManualEntry) {
    return (
      <div className="text-center mt-4">
        <button
          onClick={() => setShowManualEntry(true)}
          className="text-blue-600 text-sm hover:underline flex items-center gap-1 mx-auto"
        >
          <KeySquare className="w-3 h-3" /> Enter code manually
        </button>
      </div>
    );
  }

  return (
    <div className="border-t mt-4 pt-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">
        Manual Code Entry
      </h3>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          placeholder="Paste QR code or UUID here"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default FallbackCameraScanner;
