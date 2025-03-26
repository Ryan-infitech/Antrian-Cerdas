import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  onError?: (error: Error) => void;
  onReset: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ScannerErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error in QR scanner:", error);
    console.error("Component stack:", errorInfo.componentStack);

    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-6 flex flex-col items-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Scanner Error
          </h2>
          <p className="text-gray-600 mb-4">
            {this.state.error?.message ||
              "An error occurred while initializing the scanner"}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: undefined });
              this.props.onReset();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ScannerErrorBoundary;
