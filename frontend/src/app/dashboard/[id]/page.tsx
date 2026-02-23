export const dynamic = "force-dynamic";
import { Suspense } from "react";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return {
    title: `Dashboard ${params.id.split("-")[0]} | Statify_OS`,
    description: "AI-generated financial analysis and transaction insight dashboard.",
  };
}

import ErrorBoundary from "@/components/ErrorBoundary";
import SuspenseLoader from "@/components/SuspenseLoader";
import DashboardView from "@/features/dashboard/components/DashboardView";

export default function DashboardPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen">
      <nav className="border-b border-border px-8 py-4 mb-4 bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="/" className="font-mono font-black text-lg tracking-tighter uppercase hover:text-accent transition-colors">
            Statify_v1.0
          </a>
          <div className="flex items-center gap-6">
            <a href={`/dashboard/${params.id}/anomalies`}
               className="font-mono text-[9px] text-muted-foreground hover:text-warning transition-colors uppercase tracking-widest">
              Anomalies
            </a>
            <a href="/settings/rules"
               className="font-mono text-[9px] text-muted-foreground hover:text-accent transition-colors uppercase tracking-widest">
              Rules
            </a>
            <span className="text-[9px] bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 font-mono font-bold uppercase tracking-wider">
              Analysis Active
            </span>
          </div>
        </div>
      </nav>

      <ErrorBoundary>
        <Suspense fallback={<SuspenseLoader />}>
          <DashboardView id={params.id} />
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}
