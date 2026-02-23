import { Suspense } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import SuspenseLoader from "@/components/SuspenseLoader";
import UploadDetails from "@/features/ingestion/components/UploadDetails";

export default function UploadPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen bg-muted/30 pb-20">
      <nav className="border-b bg-background border-border px-8 py-4 mb-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="/" className="font-mono font-bold text-xl tracking-tighter uppercase cursor-pointer hover:text-accent transition-colors">Statify_v1.0</a>
          <div className="flex gap-4 items-center">
             <span className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 font-bold animate-pulse">ANALYSIS_MODE_ACTIVE</span>
          </div>
        </div>
      </nav>

      <ErrorBoundary>
        <Suspense fallback={<SuspenseLoader />}>
          <UploadDetails id={params.id} />
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}
