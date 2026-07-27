import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CertFlow — Compliance Automation",
  description: "Automated compliance evidence collection for NIS2, DORA, ISO 27001, and ENS. Built for Spanish SMEs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-dark-950 text-zinc-200 antialiased">
        {children}
      </body>
    </html>
  );
}
