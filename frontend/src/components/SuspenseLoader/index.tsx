"use client";

import { Loader2 } from "lucide-react";

export default function SuspenseLoader() {
  return (
    <div className="flex flex-col items-center justify-center p-40 space-y-8 bg-background min-h-[400px]">
      <div className="relative">
        <Loader2 className="w-12 h-12 animate-spin text-accent" />
        <div className="absolute inset-0 blur-lg bg-accent/20 animate-pulse" />
      </div>
      <div className="text-center space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent animate-pulse">
          Synchronizing_Neural_Nodes
        </p>
        <p className="font-mono text-[8px] text-muted-foreground uppercase">
          Fetching_Deep_Data_Buffer...
        </p>
      </div>
    </div>
  );
}
