import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: 'Statify_OS | AI Bank Statement Parser & Financial Intelligence',
  description: 'The world\'s most advanced AI bank statement parser. Extract transactions from PDF/CSV with 99.8% accuracy. Neural anomaly detection for 2026 financial workflows.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0d0d0d',
}

import QueryProvider from "@/lib/QueryProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background antialiased`}>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
