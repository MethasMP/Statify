"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-20 space-y-8 bg-background border border-danger/20 m-10">
          <AlertCircle className="w-16 h-16 text-danger animate-pulse" />
          <div className="text-center space-y-4">
            <h2 className="font-mono text-xl font-black uppercase text-danger">Kernel_Panic_Detected</h2>
            <p className="font-mono text-[10px] text-muted-foreground uppercase max-w-md">
              {this.state.error?.message || "Critical sequence interrupt in neural processing lane."}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-utilitarian bg-danger text-white border-none hover:bg-white hover:text-danger mt-4 flex items-center gap-3 mx-auto"
            >
              <RefreshCcw className="w-4 h-4" />
              Reboot_System
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
