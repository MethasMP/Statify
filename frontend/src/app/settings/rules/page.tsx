export const dynamic = "force-dynamic";
import { Suspense } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Neural Rules Management | Statify_OS",
  description: "Configure and manage categorization rules for automated financial transaction parsing.",
};

import ErrorBoundary from "@/components/ErrorBoundary";
import SuspenseLoader from "@/components/SuspenseLoader";
import RulesView from "./RulesView";

export default function RulesPage() {
  return (
    <main className="min-h-screen">
      <nav className="border-b border-border px-8 py-4 mb-4 bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="/" className="font-mono font-black text-lg tracking-tighter uppercase hover:text-accent transition-colors">
            Statify_v1.0
          </a>
          <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">
            Settings / Rules
          </span>
        </div>
      </nav>

      <ErrorBoundary>
        <Suspense fallback={<SuspenseLoader />}>
          <RulesView />
        </Suspense>
      </ErrorBoundary>
    </main>
  );
}
